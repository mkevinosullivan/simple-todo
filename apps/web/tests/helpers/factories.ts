import type { Task, TaskStatus } from '@simple-todo/shared/types';

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
