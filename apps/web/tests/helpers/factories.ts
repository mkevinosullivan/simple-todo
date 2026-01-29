import type { Task, TaskStatus } from '@simple-todo/shared/types';

import type { WipConfig } from '../../src/services/config';

/**
 * Factory function to create test tasks
 */
export function createTestTask(overrides?: Partial<Task>): Task {
  return {
    id: 'test-id-123',
    text: 'Test task',
    status: 'active' as TaskStatus,
    createdAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  };
}

/**
 * Create a task with specific age
 */
export function createTestTaskWithAge(daysAgo: number): Task {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return createTestTask({
    createdAt: date.toISOString(),
  });
}

/**
 * Creates a test WIP config response object
 * @param overrides - Partial config to override defaults
 * @returns WIP config response object for testing
 */
export function createTestWipConfig(overrides?: Partial<WipConfig>): WipConfig {
  return {
    limit: 7,
    currentCount: 5,
    canAddTask: true,
    ...overrides,
  };
}
