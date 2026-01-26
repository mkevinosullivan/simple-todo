import type { Task } from '../types/Task.js';

export type AgeCategory = 'fresh' | 'recent' | 'aging' | 'old' | 'stale';

/**
 * Utility functions for task metadata calculations
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

  /**
   * Calculate the character count of task text
   *
   * @param text - The task text string
   * @returns Character count including spaces and special characters
   *
   * @example
   * const length = TaskHelpers.getTextLength('Buy groceries');
   * console.log(length); // 14
   */
  getTextLength(text: string): number {
    return text.length;
  },

  /**
   * Calculate task lifetime duration from creation to completion
   *
   * @param createdAt - ISO 8601 timestamp when task was created
   * @param completedAt - ISO 8601 timestamp when task was completed, or null if active
   * @returns Duration in milliseconds, or null if task not completed
   *
   * @example
   * const duration = TaskHelpers.getDuration('2026-01-20T10:00:00.000Z', '2026-01-21T15:30:00.000Z');
   * console.log(duration); // 106200000 (29.5 hours in milliseconds)
   *
   * @example
   * const activeDuration = TaskHelpers.getDuration('2026-01-20T10:00:00.000Z', null);
   * console.log(activeDuration); // null (task not completed)
   */
  getDuration(createdAt: string, completedAt: string | null): number | null {
    if (completedAt === null) {
      return null;
    }
    return new Date(completedAt).getTime() - new Date(createdAt).getTime();
  },

  /**
   * Validate that a timestamp string is in valid ISO 8601 format
   *
   * @param timestamp - The timestamp string to validate
   * @returns True if timestamp is valid ISO 8601 format, false otherwise
   *
   * @example
   * TaskHelpers.isValidISOTimestamp('2026-01-20T10:00:00.000Z'); // true
   * TaskHelpers.isValidISOTimestamp('2026-01-20'); // false (incomplete format)
   * TaskHelpers.isValidISOTimestamp('invalid'); // false
   */
  isValidISOTimestamp(timestamp: string): boolean {
    // Check if Date.parse can parse it
    const parsed = Date.parse(timestamp);
    if (isNaN(parsed)) {
      return false;
    }

    // Validate strict ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    return iso8601Regex.test(timestamp);
  },
};
