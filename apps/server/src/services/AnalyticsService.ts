import type { PromptResponse, Task } from '@simple-todo/shared/types';
import { TaskHelpers } from '@simple-todo/shared/utils';

import type { DataService } from './DataService.js';
import type { TaskService } from './TaskService.js';

/**
 * AnalyticsService - Behavioral metrics calculation layer
 *
 * Provides on-demand analytics calculations from task data without requiring
 * separate storage or caching infrastructure for MVP simplicity.
 *
 * Design Decisions:
 * - On-demand calculation (not cached) for MVP - acceptable performance for <10k tasks
 * - Reads data from TaskService for consistency with service layer abstraction
 * - Returns sensible defaults for edge cases (null, 0) to prevent NaN errors
 * - All methods are async to support future database migration
 *
 * @example
 * const analyticsService = new AnalyticsService(taskService);
 * const rate = await analyticsService.getCompletionRate();
 * console.log(`${rate}% of tasks completed`);
 */
export class AnalyticsService {
  private readonly taskService: TaskService;
  private readonly dataService: DataService;

  constructor(taskService: TaskService, dataService: DataService) {
    this.taskService = taskService;
    this.dataService = dataService;
  }

  /**
   * Calculates the task completion rate as a percentage
   *
   * Formula: (completed tasks / total tasks) × 100
   * Edge cases:
   * - Returns 0 when no tasks exist (prevents NaN from 0/0)
   * - Returns 0 when no completed tasks (0/total = 0)
   *
   * @returns Percentage of completed tasks (0-100)
   *
   * @example
   * const rate = await analyticsService.getCompletionRate();
   * console.log(rate); // 60.0 (if 3 of 5 tasks completed)
   */
  async getCompletionRate(): Promise<number> {
    const tasks = await this.taskService.getAllTasks();

    // Edge case: no tasks exist
    if (tasks.length === 0) {
      return 0;
    }

    const completedCount = tasks.filter((t) => t.status === 'completed').length;
    return (completedCount / tasks.length) * 100;
  }

  /**
   * Calculates the average task lifetime duration for completed tasks
   *
   * Uses TaskHelpers.getDuration() to calculate time from creation to completion.
   * Edge cases:
   * - Returns null when no tasks exist
   * - Returns null when no completed tasks (cannot average 0 items)
   *
   * @returns Average duration in milliseconds, or null if no completed tasks
   *
   * @example
   * const avgLifetime = await analyticsService.getAverageTaskLifetime();
   * if (avgLifetime !== null) {
   *   console.log(`Average task lifetime: ${avgLifetime}ms`);
   * }
   */
  async getAverageTaskLifetime(): Promise<number | null> {
    const tasks = await this.taskService.getAllTasks();
    const completedTasks = tasks.filter((t) => t.status === 'completed');

    // Edge case: no completed tasks
    if (completedTasks.length === 0) {
      return null;
    }

    // Calculate durations using TaskHelpers.getDuration()
    const durations = completedTasks.map((t) => TaskHelpers.getDuration(t.createdAt, t.completedAt));

    // Filter out null values (should not happen for completed tasks, but defensive)
    const validDurations = durations.filter((d): d is number => d !== null);

    if (validDurations.length === 0) {
      return null;
    }

    // Calculate average
    const sum = validDurations.reduce((acc, duration) => acc + duration, 0);
    return sum / validDurations.length;
  }

  /**
   * Returns task count breakdown by status
   *
   * @returns Object with active and completed task counts
   *
   * @example
   * const counts = await analyticsService.getTaskCountByStatus();
   * console.log(counts); // { active: 5, completed: 3 }
   */
  async getTaskCountByStatus(): Promise<{ active: number; completed: number }> {
    const tasks = await this.taskService.getAllTasks();

    const activeCount = tasks.filter((t) => t.status === 'active').length;
    const completedCount = tasks.filter((t) => t.status === 'completed').length;

    return {
      active: activeCount,
      completed: completedCount,
    };
  }

  /**
   * Finds the oldest active task (earliest createdAt timestamp)
   *
   * Useful for age indicators and identifying stale tasks.
   * Edge cases:
   * - Returns null when no tasks exist
   * - Returns null when no active tasks (all completed)
   *
   * @returns The oldest active task, or null if no active tasks
   *
   * @example
   * const oldest = await analyticsService.getOldestActiveTask();
   * if (oldest) {
   *   console.log(`Oldest task: "${oldest.text}"`);
   * }
   */
  async getOldestActiveTask(): Promise<Task | null> {
    const tasks = await this.taskService.getAllTasks();
    const activeTasks = tasks.filter((t) => t.status === 'active');

    // Edge case: no active tasks
    if (activeTasks.length === 0) {
      return null;
    }

    // Sort by createdAt ascending (oldest first)
    const sorted = activeTasks.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return sorted[0];
  }

  /**
   * Calculates the prompt response rate as a percentage
   *
   * Formula: (engaged prompts / total prompts) × 100
   * Engaged prompts = prompts with response 'complete', 'dismiss', or 'snooze' (excludes 'timeout')
   * Edge cases:
   * - Returns 0 when no prompt events exist
   * - Returns 0 when all prompts timed out
   *
   * @returns Percentage of prompts that received user engagement (0-100)
   *
   * @example
   * const rate = await analyticsService.getPromptResponseRate();
   * console.log(rate); // 45.2 (if 45 of 100 prompts were engaged)
   */
  async getPromptResponseRate(): Promise<number> {
    const events = await this.dataService.loadPromptEvents();

    // Edge case: no prompt events exist
    if (events.length === 0) {
      return 0;
    }

    // Count engaged prompts (exclude timeout)
    const engagedPrompts = events.filter(
      (e) => e.response === 'complete' || e.response === 'dismiss' || e.response === 'snooze',
    );

    // Calculate response rate
    return (engagedPrompts.length / events.length) * 100;
  }

  /**
   * Returns breakdown of prompt responses by type
   *
   * Counts all prompt events grouped by response type.
   * Always returns all four response types even if count is 0.
   *
   * @returns Object with counts for each response type (complete, dismiss, snooze, timeout)
   *
   * @example
   * const breakdown = await analyticsService.getPromptResponseBreakdown();
   * console.log(breakdown); // { complete: 12, dismiss: 5, snooze: 3, timeout: 10 }
   */
  async getPromptResponseBreakdown(): Promise<Record<PromptResponse, number>> {
    const events = await this.dataService.loadPromptEvents();

    // Initialize all response types to 0
    const breakdown: Record<PromptResponse, number> = {
      complete: 0,
      dismiss: 0,
      snooze: 0,
      timeout: 0,
    };

    // Count events by response type
    for (const event of events) {
      breakdown[event.response]++;
    }

    return breakdown;
  }

  /**
   * Calculates average response time for engaged prompts
   *
   * Only includes prompts where user actively responded (complete, dismiss, snooze).
   * Excludes timeout prompts (respondedAt is null for timeouts).
   * Edge cases:
   * - Returns 0 when no prompt events exist
   * - Returns 0 when no engaged prompts (all timeouts)
   *
   * @returns Average time in milliseconds from promptedAt to respondedAt, or 0 if no engaged prompts
   *
   * @example
   * const avgTime = await analyticsService.getAverageResponseTime();
   * console.log(avgTime); // 5420 (5.42 seconds average response time)
   */
  async getAverageResponseTime(): Promise<number> {
    const events = await this.dataService.loadPromptEvents();

    // Filter to engaged prompts only (exclude timeout, which has null respondedAt)
    const engagedPrompts = events.filter(
      (e) =>
        e.respondedAt !== null &&
        (e.response === 'complete' || e.response === 'dismiss' || e.response === 'snooze'),
    );

    // Edge case: no engaged prompts
    if (engagedPrompts.length === 0) {
      return 0;
    }

    // Calculate response times
    const responseTimes = engagedPrompts.map((e) => {
      const promptedAt = new Date(e.promptedAt).getTime();
      const respondedAt = new Date(e.respondedAt!).getTime(); // Non-null assertion safe due to filter
      return respondedAt - promptedAt;
    });

    // Calculate average
    const sum = responseTimes.reduce((acc, time) => acc + time, 0);
    return sum / responseTimes.length;
  }
}
