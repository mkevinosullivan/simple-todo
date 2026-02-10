import type { ProactivePrompt } from '@simple-todo/shared/types';

import { apiPost } from './api.js';

interface PromptActionRequest {
  taskId: string;
  promptId?: string; // Optional for backward compatibility
}

/**
 * Prompts service - handles proactive prompt interactions
 *
 * Methods:
 * - snooze: Request to snooze a prompt for 1 hour
 * - complete: Track that user completed a task from a prompt
 * - dismiss: Track that user dismissed a prompt without action
 */
export const prompts = {
  /**
   * Snooze a proactive prompt
   *
   * Tells the backend to reschedule this prompt for 1 hour later.
   * If the task is completed or deleted before the snooze time, the prompt is cancelled.
   *
   * @param taskId - ID of the task to snooze
   * @param promptId - Optional unique prompt ID for tracking
   * @throws {Error} If API request fails or task not found
   *
   * @example
   * await prompts.snooze('123e4567-e89b-12d3-a456-426614174000', 'prompt-uuid');
   */
  snooze: async (taskId: string, promptId?: string): Promise<void> => {
    await apiPost<PromptActionRequest, void>('/api/prompts/snooze', { taskId, promptId });
  },

  /**
   * Track prompt completion
   *
   * Records that the user completed a task from a prompt for analytics.
   * This does NOT complete the task - use tasks.complete() for that.
   *
   * @param taskId - ID of the task that was completed via prompt
   * @param promptId - Optional unique prompt ID for tracking
   * @throws {Error} If API request fails
   *
   * @example
   * await prompts.complete('123e4567-e89b-12d3-a456-426614174000', 'prompt-uuid');
   */
  complete: async (taskId: string, promptId?: string): Promise<void> => {
    await apiPost<PromptActionRequest, void>('/api/prompts/complete', { taskId, promptId });
  },

  /**
   * Track prompt dismissal
   *
   * Records that the user dismissed a prompt without taking action for analytics.
   *
   * @param taskId - ID of the task that was prompted
   * @param promptId - Optional unique prompt ID for tracking
   * @throws {Error} If API request fails
   *
   * @example
   * await prompts.dismiss('123e4567-e89b-12d3-a456-426614174000', 'prompt-uuid');
   */
  dismiss: async (taskId: string, promptId?: string): Promise<void> => {
    await apiPost<PromptActionRequest, void>('/api/prompts/dismiss', { taskId, promptId });
  },

  /**
   * Trigger an immediate test prompt
   *
   * Generates a prompt immediately for testing purposes, bypassing the regular schedule.
   * Returns null if no active tasks are available.
   *
   * @returns ProactivePrompt object or null if no active tasks
   * @throws {Error} If API request fails
   *
   * @example
   * const prompt = await prompts.test();
   * if (prompt) {
   *   console.log('Test prompt generated:', prompt);
   * }
   */
  test: async (): Promise<ProactivePrompt | null> => {
    try {
      const response = await apiPost<object, ProactivePrompt>('/api/prompts/test', {});
      return response;
    } catch (error) {
      // 204 No Content indicates no active tasks - return null
      if (error instanceof Error && error.message.includes('204')) {
        return null;
      }
      throw error;
    }
  },
};
