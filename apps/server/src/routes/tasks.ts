import type { TaskStatus } from '@simple-todo/shared/types';
import { Router, type Request, type Response } from 'express';

import { DataService } from '../services/DataService.js';
import { TaskService } from '../services/TaskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Initialize services
const dataService = new DataService(process.env.DATA_DIR);
const taskService = new TaskService(dataService);

// Validation helpers
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const isValidTaskStatus = (status: unknown): status is TaskStatus => {
  return status === 'active' || status === 'completed';
};

/**
 * POST /api/tasks
 * Create a new task
 *
 * @route POST /api/tasks
 * @param {object} req.body - Request body
 * @param {string} req.body.text - Task text (1-500 characters)
 * @returns {object} 201 - Created task
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Internal server error
 */
router.post(
  '/',
  asyncHandler(
    async (req: Request<object, object, { text?: string }>, res: Response): Promise<void> => {
      try {
        // Validate request body
        if (!req.body || typeof req.body.text !== 'string') {
          res.status(400).json({
            error: 'Task text is required and must be a string',
          });
          return;
        }

        // Trim whitespace
        const text = req.body.text.trim();

        // Create task (TaskService will validate empty and length)
        const task = await taskService.createTask(text);

        // Return created task
        res.status(201).json(task);
      } catch (error) {
        // Handle service errors
        if (error instanceof Error) {
          if (
            error.message === 'Task text cannot be empty' ||
            error.message.includes('maximum length')
          ) {
            res.status(400).json({
              error: error.message,
            });
            return;
          }
          logger.error('Error creating task', { error: error.message });
          res.status(500).json({
            error: 'Internal server error',
          });
          return;
        }

        // Unexpected error
        logger.error('Unexpected error creating task', { error });
        res.status(500).json({
          error: 'Internal server error',
        });
      }
    }
  )
);

/**
 * GET /api/tasks
 * Retrieve all tasks with optional status filter
 *
 * @route GET /api/tasks
 * @param {string} req.query.status - Optional status filter ('active' | 'completed')
 * @returns {object} 200 - Array of tasks
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Internal server error
 */
router.get(
  '/',
  asyncHandler(
    async (
      req: Request<object, object, object, { status?: string }>,
      res: Response
    ): Promise<void> => {
      try {
        // Validate query parameter if provided
        let status: TaskStatus | undefined;
        if (req.query.status) {
          if (!isValidTaskStatus(req.query.status)) {
            res.status(400).json({
              error: 'Invalid status parameter. Must be "active" or "completed"',
            });
            return;
          }
          status = req.query.status;
        }

        // Get tasks
        const tasks = await taskService.getAllTasks(status);

        // Return tasks array
        res.status(200).json(tasks);
      } catch (error) {
        // Handle service errors
        if (error instanceof Error) {
          logger.error('Error getting tasks', { error: error.message });
          res.status(500).json({
            error: 'Internal server error',
          });
          return;
        }

        // Unexpected error
        logger.error('Unexpected error getting tasks', { error });
        res.status(500).json({
          error: 'Internal server error',
        });
      }
    }
  )
);

/**
 * GET /api/tasks/:id
 * Retrieve a single task by ID
 *
 * @route GET /api/tasks/:id
 * @param {string} req.params.id - Task ID (UUID)
 * @returns {object} 200 - Task object
 * @returns {object} 400 - Validation error
 * @returns {object} 404 - Task not found
 * @returns {object} 500 - Internal server error
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      // Validate ID format
      if (!isValidUUID(req.params.id)) {
        res.status(400).json({
          error: 'Invalid task ID format',
        });
        return;
      }

      // Get task
      const task = await taskService.getTaskById(req.params.id);

      // Check if task exists
      if (!task) {
        res.status(404).json({
          error: 'Task not found',
        });
        return;
      }

      // Return task
      res.status(200).json(task);
    } catch (error) {
      // Handle service errors
      if (error instanceof Error) {
        logger.error('Error getting task by ID', { error: error.message });
        res.status(500).json({
          error: 'Internal server error',
        });
        return;
      }

      // Unexpected error
      logger.error('Unexpected error getting task by ID', { error });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  })
);

/**
 * PUT /api/tasks/:id
 * Update task text
 *
 * @route PUT /api/tasks/:id
 * @param {string} req.params.id - Task ID (UUID)
 * @param {object} req.body - Request body
 * @param {string} req.body.text - Updated task text (1-500 characters)
 * @returns {object} 200 - Updated task
 * @returns {object} 400 - Validation error
 * @returns {object} 404 - Task not found
 * @returns {object} 500 - Internal server error
 */
router.put(
  '/:id',
  asyncHandler(
    async (
      req: Request<{ id: string }, object, { text?: string }>,
      res: Response
    ): Promise<void> => {
      try {
        // Validate ID format
        if (!isValidUUID(req.params.id)) {
          res.status(400).json({
            error: 'Invalid task ID format',
          });
          return;
        }

        // Validate request body
        if (!req.body || typeof req.body.text !== 'string') {
          res.status(400).json({
            error: 'Task text is required and must be a string',
          });
          return;
        }

        // Trim whitespace
        const text = req.body.text.trim();

        // Update task (TaskService will validate empty, length, not found, completed)
        const task = await taskService.updateTask(req.params.id, text);

        // Return updated task
        res.status(200).json(task);
      } catch (error) {
        // Handle service errors
        if (error instanceof Error) {
          if (error.message === 'Task not found') {
            res.status(404).json({
              error: 'Task not found',
            });
            return;
          }
          if (
            error.message === 'Cannot update completed tasks' ||
            error.message === 'Task text cannot be empty' ||
            error.message.includes('maximum length')
          ) {
            res.status(400).json({
              error: error.message,
            });
            return;
          }
          logger.error('Error updating task', { error: error.message });
          res.status(500).json({
            error: 'Internal server error',
          });
          return;
        }

        // Unexpected error
        logger.error('Unexpected error updating task', { error });
        res.status(500).json({
          error: 'Internal server error',
        });
      }
    }
  )
);

/**
 * DELETE /api/tasks/:id
 * Delete a task
 *
 * @route DELETE /api/tasks/:id
 * @param {string} req.params.id - Task ID (UUID)
 * @returns 204 - No content (success)
 * @returns {object} 400 - Validation error
 * @returns {object} 404 - Task not found
 * @returns {object} 500 - Internal server error
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      // Validate ID format
      if (!isValidUUID(req.params.id)) {
        res.status(400).json({
          error: 'Invalid task ID format',
        });
        return;
      }

      // Delete task
      await taskService.deleteTask(req.params.id);

      // Return 204 No Content
      res.status(204).send();
    } catch (error) {
      // Handle service errors
      if (error instanceof Error) {
        if (error.message === 'Task not found') {
          res.status(404).json({
            error: 'Task not found',
          });
          return;
        }
        logger.error('Error deleting task', { error: error.message });
        res.status(500).json({
          error: 'Internal server error',
        });
        return;
      }

      // Unexpected error
      logger.error('Unexpected error deleting task', { error });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  })
);

/**
 * PATCH /api/tasks/:id/complete
 * Mark a task as complete
 *
 * @route PATCH /api/tasks/:id/complete
 * @param {string} req.params.id - Task ID (UUID)
 * @returns {object} 200 - Completed task
 * @returns {object} 400 - Validation error or already completed
 * @returns {object} 404 - Task not found
 * @returns {object} 500 - Internal server error
 */
router.patch(
  '/:id/complete',
  asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      // Validate ID format
      if (!isValidUUID(req.params.id)) {
        res.status(400).json({
          error: 'Invalid task ID format',
        });
        return;
      }

      // Complete task
      const task = await taskService.completeTask(req.params.id);

      // Return completed task
      res.status(200).json(task);
    } catch (error) {
      // Handle service errors
      if (error instanceof Error) {
        if (error.message === 'Task not found') {
          res.status(404).json({
            error: 'Task not found',
          });
          return;
        }
        if (error.message === 'Task is already completed') {
          res.status(400).json({
            error: 'Task is already completed',
          });
          return;
        }
        logger.error('Error completing task', { error: error.message });
        res.status(500).json({
          error: 'Internal server error',
        });
        return;
      }

      // Unexpected error
      logger.error('Unexpected error completing task', { error });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  })
);

export default router;
