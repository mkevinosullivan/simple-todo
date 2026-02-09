import { apiPost } from './api.js';

interface PromptActionRequest {
  taskId: string;
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
   * @throws {Error} If API request fails or task not found
   *
   * @example
   * await prompts.snooze('123e4567-e89b-12d3-a456-426614174000');
   */
  snooze: async (taskId: string): Promise<void> => {
    await apiPost<PromptActionRequest, void>('/api/prompts/snooze', { taskId });
  },

  /**
   * Track prompt completion
   *
   * Records that the user completed a task from a prompt for analytics.
   * This does NOT complete the task - use tasks.complete() for that.
   *
   * @param taskId - ID of the task that was completed via prompt
   * @throws {Error} If API request fails
   *
   * @example
   * await prompts.complete('123e4567-e89b-12d3-a456-426614174000');
   */
  complete: async (taskId: string): Promise<void> => {
    await apiPost<PromptActionRequest, void>('/api/prompts/complete', { taskId });
  },

  /**
   * Track prompt dismissal
   *
   * Records that the user dismissed a prompt without taking action for analytics.
   *
   * @param taskId - ID of the task that was prompted
   * @throws {Error} If API request fails
   *
   * @example
   * await prompts.dismiss('123e4567-e89b-12d3-a456-426614174000');
   */
  dismiss: async (taskId: string): Promise<void> => {
    await apiPost<PromptActionRequest, void>('/api/prompts/dismiss', { taskId });
  },
};
