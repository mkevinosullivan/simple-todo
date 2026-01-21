import { randomUUID } from 'crypto';

import type { Task, TaskStatus } from '@simple-todo/shared/types';

/**
 * Creates a test task with default values
 * @param overrides - Partial task properties to override defaults
 * @returns A complete Task object for testing
 */
export function createTestTask(overrides: Partial<Task> = {}): Task {
  return {
    id: randomUUID(),
    text: 'Default test task',
    status: 'active' as TaskStatus,
    createdAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  };
}
