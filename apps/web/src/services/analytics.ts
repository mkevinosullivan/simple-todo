import { apiGet } from './api.js';

/**
 * Get task statistics for displaying analytics
 *
 * Fetches completed and active task counts from the analytics endpoint.
 * Used to display statistics in the InboxZeroState component.
 *
 * @returns Promise resolving to task statistics
 * @throws Error if API request fails
 *
 * @example
 * const stats = await getTaskStats();
 * console.log(stats); // { completedCount: 5, activeCount: 0 }
 */
export async function getTaskStats(): Promise<{
  completedCount: number;
  activeCount: number;
}> {
  return apiGet<{ completedCount: number; activeCount: number }>('/api/analytics');
}
