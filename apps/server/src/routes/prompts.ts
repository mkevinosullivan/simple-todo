import { Router, type Request, type Response } from 'express';

import type { ProactivePrompt } from '@simple-todo/shared/types';

import { dataService, promptingService } from '../services/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

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

export default router;
