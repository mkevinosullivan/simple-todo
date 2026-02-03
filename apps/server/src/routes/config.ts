import { Router, type Request, type Response } from 'express';

import type {
  UpdateCelebrationConfigDto,
  UpdateConfigDto,
  UpdateEducationFlagDto,
  UpdateWipLimitDto,
} from '../middleware/validation.js';
import {
  UpdateCelebrationConfigSchema,
  UpdateConfigSchema,
  UpdateEducationFlagSchema,
  UpdateWipLimitSchema,
  validateRequest,
} from '../middleware/validation.js';
import { DataService } from '../services/DataService.js';
import { TaskService } from '../services/TaskService.js';
import { WIPLimitService } from '../services/WIPLimitService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Initialize services (singleton pattern for localhost app)
const dataService = new DataService(process.env.DATA_DIR);
const taskService = new TaskService(dataService);
const wipLimitService = new WIPLimitService(taskService, dataService);

/**
 * GET /api/config
 * Get full application configuration
 *
 * @route GET /api/config
 * @returns {object} 200 - Full configuration object
 * @returns {object} 500 - Internal server error
 *
 * @example
 * // Request:
 * GET /api/config
 *
 * // Response (200):
 * {
 *   "wipLimit": 7,
 *   "promptingEnabled": true,
 *   "promptingFrequencyHours": 2.5,
 *   "celebrationsEnabled": true,
 *   "celebrationDurationSeconds": 7,
 *   "browserNotificationsEnabled": false,
 *   "hasCompletedSetup": false,
 *   "hasSeenPromptEducation": false,
 *   "hasSeenWIPLimitEducation": false
 * }
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
      // Load full configuration
      const config = await dataService.loadConfig();

      // Return full config object
      res.status(200).json(config);
    } catch (error) {
      logger.error('Failed to get configuration', { error });
      res.status(500).json({
        error: 'Failed to retrieve configuration',
      });
    }
  })
);

/**
 * PATCH /api/config
 * Update application configuration (partial update)
 *
 * @route PATCH /api/config
 * @param {object} req.body - Partial configuration object (at least one field required)
 * @returns {object} 200 - Full updated configuration object
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Internal server error
 *
 * @example
 * // Request:
 * PATCH /api/config
 * {
 *   "hasCompletedSetup": true
 * }
 *
 * // Response (200):
 * {
 *   "wipLimit": 7,
 *   "promptingEnabled": true,
 *   "promptingFrequencyHours": 2.5,
 *   "celebrationsEnabled": true,
 *   "celebrationDurationSeconds": 7,
 *   "browserNotificationsEnabled": false,
 *   "hasCompletedSetup": true,
 *   "hasSeenPromptEducation": false,
 *   "hasSeenWIPLimitEducation": false
 * }
 */
router.patch(
  '/',
  validateRequest(UpdateConfigSchema),
  asyncHandler(
    async (req: Request<object, object, UpdateConfigDto>, res: Response): Promise<void> => {
      try {
        // Load current config
        const config = await dataService.loadConfig();

        // Apply partial updates (only update provided fields)
        Object.assign(config, req.body);

        // Persist updated config to file
        await dataService.saveConfig(config);

        // Return full updated configuration
        res.status(200).json(config);
      } catch (error) {
        logger.error('Failed to update configuration', { error });
        res.status(500).json({
          error: 'Failed to update configuration',
        });
      }
    }
  )
);

/**
 * GET /api/config/wip-limit
 * Get current WIP limit configuration with metadata
 *
 * @route GET /api/config/wip-limit
 * @returns {object} 200 - WIP limit configuration
 * @returns {number} 200.limit - Current WIP limit (5-10)
 * @returns {number} 200.currentCount - Number of active tasks
 * @returns {boolean} 200.canAddTask - True if tasks can be added (count < limit)
 * @returns {object} 500 - Internal server error
 *
 * @example
 * // Request:
 * GET /api/config/wip-limit
 *
 * // Response (200):
 * {
 *   "limit": 7,
 *   "currentCount": 3,
 *   "canAddTask": true
 * }
 */
router.get(
  '/wip-limit',
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
      // Get current WIP limit configuration and state
      const limit = await wipLimitService.getWIPLimit();
      const currentCount = await wipLimitService.getCurrentWIPCount();
      const canAddTask = await wipLimitService.canAddTask();

      // Load full config to get education flag
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const config = await dataService.loadConfig();

      // Return configuration with metadata
      res.status(200).json({
        limit,
        currentCount,
        canAddTask,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        hasSeenWIPLimitEducation: config.hasSeenWIPLimitEducation ?? false,
      });
    } catch (error) {
      logger.error('Failed to get WIP limit configuration', { error });
      res.status(500).json({
        error: 'Failed to retrieve WIP limit configuration',
      });
    }
  })
);

/**
 * PUT /api/config/wip-limit
 * Update WIP limit configuration and mark setup as completed
 *
 * @route PUT /api/config/wip-limit
 * @param {object} req.body - Request body
 * @param {number} req.body.limit - New WIP limit (5-10)
 * @returns {object} 200 - Updated WIP limit configuration
 * @returns {number} 200.limit - New WIP limit
 * @returns {number} 200.currentCount - Current number of active tasks
 * @returns {boolean} 200.canAddTask - True if tasks can be added
 * @returns {boolean} 200.hasCompletedSetup - Always true after this endpoint is called
 * @returns {object} 400 - Validation error (invalid limit)
 * @returns {object} 500 - Internal server error
 *
 * @throws {Error} Returns 400 if limit is outside 5-10 range
 * @throws {Error} Returns 400 if limit is not a number or integer
 * @throws {Error} Returns 500 if unable to persist configuration
 *
 * @example
 * // Request:
 * PUT /api/config/wip-limit
 * {
 *   "limit": 8
 * }
 *
 * // Response (200):
 * {
 *   "limit": 8,
 *   "currentCount": 3,
 *   "canAddTask": true,
 *   "hasCompletedSetup": true
 * }
 *
 * // Error response (400 - invalid limit):
 * {
 *   "error": "Validation failed",
 *   "details": [
 *     {
 *       "field": "limit",
 *       "message": "WIP limit must be at least 5"
 *     }
 *   ]
 * }
 */
router.put(
  '/wip-limit',
  validateRequest(UpdateWipLimitSchema),
  asyncHandler(
    async (req: Request<object, object, UpdateWipLimitDto>, res: Response): Promise<void> => {
      try {
        // Request body is validated by middleware - limit is guaranteed to be 5-10
        const { limit } = req.body;

        // Update WIP limit configuration
        await wipLimitService.setWIPLimit(limit);

        // Load current config and set hasCompletedSetup to true
        const config = await dataService.loadConfig();
        config.hasCompletedSetup = true;
        await dataService.saveConfig(config);

        // Return updated configuration with metadata
        const currentCount = await wipLimitService.getCurrentWIPCount();
        const canAddTask = await wipLimitService.canAddTask();

        res.status(200).json({
          limit,
          currentCount,
          canAddTask,
          hasCompletedSetup: true,
        });
      } catch (error) {
        // Service layer may throw validation errors (e.g., "WIP limit must be between 5 and 10")
        // These should already be caught by Zod middleware, but handle as fallback
        if (
          error instanceof Error &&
          (error.message.includes('must be between') || error.message.includes('must be a number'))
        ) {
          logger.warn('WIP limit validation error bypassed Zod middleware', {
            error: error.message,
          });
          res.status(400).json({
            error: error.message,
          });
          return;
        }

        // Generic server error (file system, etc.)
        logger.error('Failed to update WIP limit configuration', { error });
        res.status(500).json({
          error: 'Failed to update WIP limit configuration',
        });
      }
    }
  )
);

/**
 * PATCH /api/config/education
 * Update education flag configuration (e.g., hasSeenWIPLimitEducation)
 *
 * @route PATCH /api/config/education
 * @param {object} req.body - Request body
 * @param {boolean} req.body.hasSeenWIPLimitEducation - Whether user has seen WIP limit education
 * @returns {object} 200 - Success response
 * @returns {boolean} 200.hasSeenWIPLimitEducation - Updated flag value
 * @returns {object} 400 - Validation error (invalid type)
 * @returns {object} 500 - Internal server error
 *
 * @throws {Error} Returns 400 if hasSeenWIPLimitEducation is not a boolean
 * @throws {Error} Returns 500 if unable to persist configuration
 *
 * @example
 * // Request:
 * PATCH /api/config/education
 * {
 *   "hasSeenWIPLimitEducation": true
 * }
 *
 * // Response (200):
 * {
 *   "hasSeenWIPLimitEducation": true
 * }
 *
 * // Error response (400 - invalid type):
 * {
 *   "error": "Validation failed",
 *   "details": [
 *     {
 *       "field": "hasSeenWIPLimitEducation",
 *       "message": "hasSeenWIPLimitEducation must be a boolean"
 *     }
 *   ]
 * }
 */
router.patch(
  '/education',
  validateRequest(UpdateEducationFlagSchema),
  asyncHandler(
    async (
      req: Request<object, object, UpdateEducationFlagDto>,
      res: Response
    ): Promise<void> => {
      try {
        // Request body is validated by middleware
        const { hasSeenWIPLimitEducation } = req.body;

        // Load current config
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const config = await dataService.loadConfig();

        // Update education flag
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        config.hasSeenWIPLimitEducation = hasSeenWIPLimitEducation;

        // Persist to file
        await dataService.saveConfig(config);

        // Return success response
        res.status(200).json({
          hasSeenWIPLimitEducation,
        });
      } catch (error) {
        // Generic server error (file system, etc.)
        logger.error('Failed to update education flag configuration', { error });
        res.status(500).json({
          error: 'Failed to update education flag configuration',
        });
      }
    }
  )
);

/**
 * GET /api/config/celebrations
 * Get celebration configuration settings
 *
 * @route GET /api/config/celebrations
 * @returns {object} 200 - Celebration configuration
 * @returns {boolean} 200.celebrationsEnabled - Whether celebrations are enabled
 * @returns {number} 200.celebrationDurationSeconds - Duration in seconds (3-10)
 * @returns {object} 500 - Internal server error
 *
 * @example
 * // Request:
 * GET /api/config/celebrations
 *
 * // Response (200):
 * {
 *   "celebrationsEnabled": true,
 *   "celebrationDurationSeconds": 7
 * }
 */
router.get(
  '/celebrations',
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
      // Load full configuration
      const config = await dataService.loadConfig();

      // Return celebration-specific fields
      res.status(200).json({
        celebrationsEnabled: config.celebrationsEnabled,
        celebrationDurationSeconds: config.celebrationDurationSeconds,
      });
    } catch (error) {
      logger.error('Failed to get celebration configuration', { error });
      res.status(500).json({
        error: 'Failed to retrieve celebration configuration',
      });
    }
  })
);

/**
 * PUT /api/config/celebrations
 * Update celebration configuration settings
 *
 * @route PUT /api/config/celebrations
 * @param {object} req.body - Request body
 * @param {boolean} req.body.celebrationsEnabled - Whether to enable celebrations
 * @param {number} req.body.celebrationDurationSeconds - Duration in seconds (3-10)
 * @returns {object} 200 - Full updated configuration object
 * @returns {object} 400 - Validation error (invalid parameters)
 * @returns {object} 500 - Internal server error
 *
 * @throws {Error} Returns 400 if celebrationDurationSeconds is outside 3-10 range
 * @throws {Error} Returns 400 if celebrationsEnabled is not a boolean
 * @throws {Error} Returns 500 if unable to persist configuration
 *
 * @example
 * // Request:
 * PUT /api/config/celebrations
 * {
 *   "celebrationsEnabled": false,
 *   "celebrationDurationSeconds": 5
 * }
 *
 * // Response (200):
 * {
 *   "wipLimit": 7,
 *   "promptingEnabled": true,
 *   "promptingFrequencyHours": 2.5,
 *   "celebrationsEnabled": false,
 *   "celebrationDurationSeconds": 5,
 *   "browserNotificationsEnabled": false,
 *   "hasCompletedSetup": true,
 *   "hasSeenPromptEducation": false,
 *   "hasSeenWIPLimitEducation": false
 * }
 *
 * // Error response (400 - duration too low):
 * {
 *   "error": "Validation failed",
 *   "details": [
 *     {
 *       "field": "celebrationDurationSeconds",
 *       "message": "Celebration duration must be at least 3 seconds"
 *     }
 *   ]
 * }
 */
router.put(
  '/celebrations',
  validateRequest(UpdateCelebrationConfigSchema),
  asyncHandler(
    async (
      req: Request<object, object, UpdateCelebrationConfigDto>,
      res: Response
    ): Promise<void> => {
      try {
        // Request body is validated by middleware
        const { celebrationsEnabled, celebrationDurationSeconds } = req.body;

        // Load current config
        const config = await dataService.loadConfig();

        // Update celebration fields
        config.celebrationsEnabled = celebrationsEnabled;
        config.celebrationDurationSeconds = celebrationDurationSeconds;

        // Persist updated config to file
        await dataService.saveConfig(config);

        // Return full updated configuration
        res.status(200).json(config);
      } catch (error) {
        // Generic server error (file system, etc.)
        logger.error('Failed to update celebration configuration', { error });
        res.status(500).json({
          error: 'Failed to update celebration configuration',
        });
      }
    }
  )
);

export default router;
