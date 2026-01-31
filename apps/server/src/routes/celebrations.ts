import { Router, type Request, type Response } from 'express';

import type { CelebrationMessage } from '@simple-todo/shared/types';

import { CelebrationService } from '../services/CelebrationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Initialize service (singleton pattern for localhost app)
const celebrationService = new CelebrationService();

/**
 * GET /api/celebrations/message
 * Returns random celebration message with variant for UI styling
 *
 * @route GET /api/celebrations/message
 * @param {string} [taskId] - Optional query parameter for task-specific context
 * @returns {object} 200 - Celebration message with variant and duration
 * @returns {string} 200.message - Celebration text to display
 * @returns {string} 200.variant - Message tone: enthusiastic, supportive, motivational, data-driven
 * @returns {number} 200.duration - Suggested display duration in milliseconds (default: 5000)
 *
 * @example
 * // Request:
 * GET /api/celebrations/message
 *
 * // Response (200):
 * {
 *   "message": "Amazing! You crushed it! 🎉",
 *   "variant": "enthusiastic",
 *   "duration": 5000
 * }
 *
 * // Request with taskId:
 * GET /api/celebrations/message?taskId=123e4567-e89b-12d3-a456-426614174000
 *
 * // Response (200):
 * {
 *   "message": "Task completed! That's 5 this week!",
 *   "variant": "data-driven",
 *   "duration": 5000
 * }
 */
router.get(
  '/message',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      // Parse optional taskId query parameter
      const taskId = req.query.taskId as string | undefined;

      // Call CelebrationService to generate message
      const celebration: CelebrationMessage =
        await celebrationService.getCelebrationMessage(taskId);

      // Map to API format with default duration 5000ms (AC: 5)
      const response = {
        message: celebration.message,
        variant: celebration.variant,
        duration: celebration.duration ?? 5000,
      };

      // Return JSON response with status 200
      res.status(200).json(response);
    } catch (error) {
      // Log error but don't expose details to client (AC: 10)
      logger.error('CelebrationService error', { error });

      // Return fallback celebration (graceful degradation)
      res.status(200).json({
        message: 'Great job! Task completed.',
        variant: 'supportive',
        duration: 5000,
      });
    }
  })
);

export default router;
