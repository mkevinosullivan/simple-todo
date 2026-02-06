import { apiPost } from './api.js';

interface SnoozeRequest {
  taskId: string;
}

interface SnoozeResponse {
  success: boolean;
}

/**
 * Prompts service - handles proactive prompt interactions
 *
 * Methods:
 * - snooze: Request to snooze a prompt for later
 */
export const prompts = {
  /**
   * Snooze a proactive prompt
   *
   * Tells the backend to reschedule this prompt for later.
   * The backend will determine the snooze duration based on configuration.
   *
   * @param request - Object containing taskId to snooze
   * @returns Promise resolving to success response
   * @throws {Error} If API request fails
   *
   * @example
   * await prompts.snooze({ taskId: '123e4567-e89b-12d3-a456-426614174000' });
   */
  snooze: async (request: SnoozeRequest): Promise<SnoozeResponse> => {
    return apiPost<SnoozeRequest, SnoozeResponse>('/api/prompts/snooze', request);
  },
};
