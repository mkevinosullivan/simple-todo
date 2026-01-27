import { randomUUID } from 'crypto';

import type { Config, Task, TaskStatus } from '@simple-todo/shared/types';
import { DEFAULT_CONFIG } from '@simple-todo/shared/types';

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

/**
 * Creates a test config with default values
 * @param overrides - Partial config properties to override defaults
 * @returns A complete Config object for testing
 */
export function createTestConfig(overrides: Partial<Config> = {}): Config {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
  };
}
