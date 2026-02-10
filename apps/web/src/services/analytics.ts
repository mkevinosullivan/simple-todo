import type { PromptAnalytics } from '@simple-todo/shared/types';

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

/**
 * Get prompt analytics statistics
 *
 * Fetches aggregated prompt response data including response rate, breakdown by type,
 * and average response time from the analytics endpoint.
 *
 * @returns Promise resolving to prompt analytics
 * @throws Error if API request fails
 *
 * @example
 * const analytics = await getPromptAnalytics();
 * console.log(analytics.promptResponseRate); // 45.2
 * console.log(analytics.responseBreakdown); // { complete: 12, dismiss: 5, snooze: 3, timeout: 10 }
 * console.log(analytics.averageResponseTime); // 5420
 */
export async function getPromptAnalytics(): Promise<PromptAnalytics> {
  return apiGet<PromptAnalytics>('/api/analytics/prompts');
}
