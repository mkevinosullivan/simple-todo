import type { Task } from '../types/Task.js';

export type AgeCategory = 'fresh' | 'recent' | 'aging' | 'old' | 'stale';

/**
 * Utility functions for task age calculations
 */
export const TaskHelpers = {
  /**
   * Calculate task age in milliseconds
   *
   * @param task - The task to calculate age for
   * @returns Age in milliseconds since creation
   */
  getAge(task: Task): number {
    const now = new Date().getTime();
    const created = new Date(task.createdAt).getTime();
    return now - created;
  },

  /**
   * Get age category for visual indicator
   *
   * @param task - The task to categorize
   * @returns Age category string
   *
   * Categories:
   * - fresh: < 1 day
   * - recent: 1-3 days
   * - aging: 3-7 days
   * - old: 7-14 days
   * - stale: > 14 days
   */
  getAgeCategory(task: Task): AgeCategory {
    const ageMs = TaskHelpers.getAge(task);
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    if (ageDays < 1) {
      return 'fresh';
    } else if (ageDays < 3) {
      return 'recent';
    } else if (ageDays < 7) {
      return 'aging';
    } else if (ageDays < 14) {
      return 'old';
    } else {
      return 'stale';
    }
  },
};
