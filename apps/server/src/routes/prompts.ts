import { Router, type Request, type Response } from 'express';

import type { ProactivePrompt, SnoozePromptDto } from '@simple-todo/shared/types';

import { dataService, promptingService } from '../services/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { isValidUuid } from '../utils/validation.js';

const router = Router();

// Keep-alive interval constant (30 seconds)
const KEEP_ALIVE_INTERVAL_MS = 30000;

// Store active SSE connections
const activeConnections = new Set<Response>();

/**
 * Establishes Server-Sent Events connection for real-time prompt delivery
 *
 * Streams proactive prompts from PromptingService to connected clients.
 * Sends keep-alive messages every 30 seconds to maintain connection.
 * Only allows connections when prompting is enabled in config.
 *
 * @route GET /api/prompts/stream
 * @returns Streaming SSE response (never completes until client disconnect)
 *
 * @example
 * // Client connects via EventSource
 * const eventSource = new EventSource('/api/prompts/stream');
 * eventSource.addEventListener('prompt', (event) => {
 *   const prompt = JSON.parse(event.data);
 *   console.log(prompt);
 * });
 */
router.get(
  '/stream',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check if prompting is enabled in config (use shared dataService instance)
    try {
      const config = await dataService.loadConfig();

      if (!config.promptingEnabled) {
        logger.info('SSE connection rejected - prompting disabled');
        res.status(503).send('Prompting is currently disabled');
        return;
      }
    } catch (err: unknown) {
      logger.error('Failed to load config for SSE connection', { error: err });
      res.status(500).send('Internal server error');
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Add to active connections
    activeConnections.add(res);
    logger.info('SSE connection established', {
      activeConnections: activeConnections.size,
    });

    // Send keep-alive messages every 30 seconds
    const keepAliveInterval = setInterval(() => {
      try {
        res.write(': keep-alive\n\n');
      } catch (err: unknown) {
        logger.error('Failed to send keep-alive', { error: err });
        clearInterval(keepAliveInterval);
      }
    }, KEEP_ALIVE_INTERVAL_MS);

    // Listen for prompt events from PromptingService
    const onPrompt = (prompt: ProactivePrompt): void => {
      try {
        res.write(`event: prompt\n`);
        res.write(`data: ${JSON.stringify(prompt)}\n\n`);
        logger.info('Prompt sent via SSE', {
          taskId: prompt.taskId,
          promptedAt: prompt.promptedAt,
        });
      } catch (err: unknown) {
        logger.error('Failed to send prompt via SSE', { error: err });
      }
    };

    promptingService.on('prompt', onPrompt);

    // Cleanup on client disconnect
    req.on('close', () => {
      clearInterval(keepAliveInterval);
      promptingService.off('prompt', onPrompt);
      activeConnections.delete(res);
      logger.info('SSE connection closed', {
        activeConnections: activeConnections.size,
      });
    });
  })
);

/**
 * Manually trigger a prompt for testing (development only)
 *
 * Generates a prompt for a random active task and broadcasts it via SSE.
 * Useful for testing the toast notification UI without waiting for scheduled prompts.
 *
 * @route POST /api/prompts/test
 * @returns 201 with generated prompt, or 404 if no active tasks
 *
 * @example
 * curl -X POST http://localhost:3001/api/prompts/test
 */
router.post(
  '/test',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    logger.info('Manual prompt test triggered');

    // Generate a prompt
    const prompt = await promptingService.generatePrompt();

    if (prompt === null) {
      logger.info('No active tasks available for test prompt');
      res.status(404).json({ error: 'No active tasks available' });
      return;
    }

    // Emit the prompt event so SSE clients receive it
    promptingService.emit('prompt', prompt);

    logger.info('Test prompt generated and emitted', { prompt });
    res.status(201).json(prompt);
  })
);

/**
 * Snooze a prompt for a specific task
 *
 * Reschedules the prompt for the same task to appear again in 1 hour.
 * If the task is completed or deleted before the snooze time, the prompt is cancelled.
 *
 * @route POST /api/prompts/snooze
 * @body { taskId: string }
 * @returns 200 OK on success
 *
 * @example
 * curl -X POST http://localhost:3001/api/prompts/snooze \
 *   -H "Content-Type: application/json" \
 *   -d '{"taskId": "123e4567-e89b-12d3-a456-426614174000"}'
 */
router.post(
  '/snooze',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as SnoozePromptDto;

    // Validate request body
    if (!dto.taskId || typeof dto.taskId !== 'string') {
      res.status(400).json({ error: 'Invalid or missing taskId' });
      return;
    }

    // Validate UUID format
    if (!isValidUuid(dto.taskId)) {
      res.status(400).json({ error: 'Invalid taskId format (must be UUID)' });
      return;
    }

    try {
      // Snooze the prompt
      await promptingService.snoozePrompt(dto.taskId);

      // Log prompt response
      await promptingService.logPromptResponse(dto.taskId, 'snooze');

      logger.info('Prompt snoozed', { taskId: dto.taskId });
      res.status(200).send();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Task not found') {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      logger.error('Failed to snooze prompt', { error: err, taskId: dto.taskId });
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

/**
 * Record prompt completion
 *
 * Records that the user completed a task from a prompt.
 * Used for analytics tracking. Does not actually complete the task
 * (task completion happens via PATCH /api/tasks/:id/complete).
 *
 * @route POST /api/prompts/complete
 * @body { taskId: string }
 * @returns 200 OK on success
 *
 * @example
 * curl -X POST http://localhost:3001/api/prompts/complete \
 *   -H "Content-Type: application/json" \
 *   -d '{"taskId": "123e4567-e89b-12d3-a456-426614174000"}'
 */
router.post(
  '/complete',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as { taskId?: string };

    // Validate request body
    if (!dto.taskId || typeof dto.taskId !== 'string') {
      res.status(400).json({ error: 'Invalid or missing taskId' });
      return;
    }

    // Validate UUID format
    if (!isValidUuid(dto.taskId)) {
      res.status(400).json({ error: 'Invalid taskId format (must be UUID)' });
      return;
    }

    try {
      // Log prompt response
      await promptingService.logPromptResponse(dto.taskId, 'complete');

      logger.info('Prompt completion tracked', { taskId: dto.taskId });
      res.status(200).send();
    } catch (err: unknown) {
      logger.error('Failed to track prompt completion', { error: err, taskId: dto.taskId });
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

/**
 * Dismiss a prompt
 *
 * Records that the user dismissed the prompt without taking action.
 * Used for analytics tracking.
 *
 * @route POST /api/prompts/dismiss
 * @body { taskId: string }
 * @returns 200 OK on success
 *
 * @example
 * curl -X POST http://localhost:3001/api/prompts/dismiss \
 *   -H "Content-Type: application/json" \
 *   -d '{"taskId": "123e4567-e89b-12d3-a456-426614174000"}'
 */
router.post(
  '/dismiss',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as { taskId?: string };

    // Validate request body
    if (!dto.taskId || typeof dto.taskId !== 'string') {
      res.status(400).json({ error: 'Invalid or missing taskId' });
      return;
    }

    // Validate UUID format
    if (!isValidUuid(dto.taskId)) {
      res.status(400).json({ error: 'Invalid taskId format (must be UUID)' });
      return;
    }

    try {
      // Log prompt response
      await promptingService.logPromptResponse(dto.taskId, 'dismiss');

      logger.info('Prompt dismissed', { taskId: dto.taskId });
      res.status(200).send();
    } catch (err: unknown) {
      logger.error('Failed to dismiss prompt', { error: err, taskId: dto.taskId });
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

export default router;
