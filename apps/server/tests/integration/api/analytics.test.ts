import fs from 'fs/promises';
import path from 'path';

import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import type { Task } from '@simple-todo/shared/types';
import request from 'supertest';

const TEST_DATA_DIR = path.join(__dirname, '../../test-data-analytics');
const TEST_TASKS_FILE = path.join(TEST_DATA_DIR, 'tasks.json');

// Set environment variable BEFORE importing app
process.env.DATA_DIR = TEST_DATA_DIR;

import app from '../../../src/app.js';

/**
 * Helper function to create a test task
 */
function createTestTask(overrides: Partial<Task> = {}): Task {
  return {
    id: `test-${Math.random().toString(36).substring(7)}`,
    text: 'Test task',
    status: 'active',
    createdAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  };
}

describe('GET /api/analytics', () => {
  beforeAll(async () => {
    // Ensure test data directory exists
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  });

  beforeEach(async () => {
    // Clean and recreate test data directory for each test
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });

    // Create test tasks file with sample data
    const testTasks: Task[] = [
      createTestTask({ status: 'active' }),
      createTestTask({ status: 'active' }),
      createTestTask({ status: 'active' }),
      createTestTask({ status: 'completed', completedAt: new Date().toISOString() }),
      createTestTask({ status: 'completed', completedAt: new Date().toISOString() }),
      createTestTask({ status: 'completed', completedAt: new Date().toISOString() }),
      createTestTask({ status: 'completed', completedAt: new Date().toISOString() }),
      createTestTask({ status: 'completed', completedAt: new Date().toISOString() }),
    ];

    await fs.writeFile(TEST_TASKS_FILE, JSON.stringify(testTasks, null, 2), 'utf-8');
  });

  afterEach(async () => {
    // Clean up test data after each test
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
  });

  afterAll(async () => {
    // Final cleanup
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
  });

  it('should return task statistics', async () => {
    const response = await request(app).get('/api/analytics').expect(200);

    expect(response.body).toMatchObject({
      completedCount: 5,
      activeCount: 3,
    });
  });

  it('should handle empty task list', async () => {
    // Write empty tasks file
    await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([], null, 2), 'utf-8');

    const response = await request(app).get('/api/analytics').expect(200);

    expect(response.body).toMatchObject({
      completedCount: 0,
      activeCount: 0,
    });
  });

  it('should return only completed tasks count', async () => {
    // Create tasks with only completed tasks
    const testTasks: Task[] = [
      createTestTask({ status: 'completed', completedAt: new Date().toISOString() }),
      createTestTask({ status: 'completed', completedAt: new Date().toISOString() }),
    ];

    await fs.writeFile(TEST_TASKS_FILE, JSON.stringify(testTasks, null, 2), 'utf-8');

    const response = await request(app).get('/api/analytics').expect(200);

    expect(response.body).toMatchObject({
      completedCount: 2,
      activeCount: 0,
    });
  });

  it('should return only active tasks count', async () => {
    // Create tasks with only active tasks
    const testTasks: Task[] = [
      createTestTask({ status: 'active' }),
      createTestTask({ status: 'active' }),
      createTestTask({ status: 'active' }),
    ];

    await fs.writeFile(TEST_TASKS_FILE, JSON.stringify(testTasks, null, 2), 'utf-8');

    const response = await request(app).get('/api/analytics').expect(200);

    expect(response.body).toMatchObject({
      completedCount: 0,
      activeCount: 3,
    });
  });
});
