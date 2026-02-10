import fs from 'fs/promises';
import path from 'path';

import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import type { Task, PromptEvent } from '@simple-todo/shared/types';
import request from 'supertest';

const TEST_DATA_DIR = path.join(__dirname, '../../test-data-analytics');
const TEST_TASKS_FILE = path.join(TEST_DATA_DIR, 'tasks.json');
const TEST_PROMPTS_FILE = path.join(TEST_DATA_DIR, 'prompts.json');

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

describe('GET /api/analytics/prompts', () => {
  beforeAll(async () => {
    // Ensure test data directory exists
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  });

  beforeEach(async () => {
    // Clean and recreate test data directory for each test
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test data after each test
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
  });

  afterAll(async () => {
    // Final cleanup
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
  });

  it('should return prompt analytics with correct structure', async () => {
    // Create test prompt events
    const now = new Date();
    const testPromptEvents: PromptEvent[] = [
      {
        promptId: 'prompt-1',
        taskId: 'task-1',
        promptedAt: new Date(now.getTime() - 10000).toISOString(),
        response: 'complete',
        respondedAt: now.toISOString(),
      },
      {
        promptId: 'prompt-2',
        taskId: 'task-2',
        promptedAt: new Date(now.getTime() - 8000).toISOString(),
        response: 'dismiss',
        respondedAt: new Date(now.getTime() - 3000).toISOString(),
      },
      {
        promptId: 'prompt-3',
        taskId: 'task-3',
        promptedAt: new Date(now.getTime() - 6000).toISOString(),
        response: 'snooze',
        respondedAt: new Date(now.getTime() - 2000).toISOString(),
      },
      {
        promptId: 'prompt-4',
        taskId: 'task-4',
        promptedAt: new Date(now.getTime() - 4000).toISOString(),
        response: 'timeout',
        respondedAt: null,
      },
    ];

    await fs.writeFile(TEST_PROMPTS_FILE, JSON.stringify(testPromptEvents, null, 2), 'utf-8');

    const response = await request(app).get('/api/analytics/prompts').expect(200);

    expect(response.body).toHaveProperty('promptResponseRate');
    expect(response.body).toHaveProperty('responseBreakdown');
    expect(response.body).toHaveProperty('averageResponseTime');

    // Verify response rate calculation (3 engaged out of 4 total = 75%)
    expect(response.body.promptResponseRate).toBe(75);

    // Verify breakdown structure
    expect(response.body.responseBreakdown).toMatchObject({
      complete: 1,
      dismiss: 1,
      snooze: 1,
      timeout: 1,
    });

    // Verify average response time is a number
    expect(typeof response.body.averageResponseTime).toBe('number');
    expect(response.body.averageResponseTime).toBeGreaterThan(0);
  });

  it('should handle empty prompt events', async () => {
    // Write empty prompts file
    await fs.writeFile(TEST_PROMPTS_FILE, JSON.stringify([], null, 2), 'utf-8');

    const response = await request(app).get('/api/analytics/prompts').expect(200);

    expect(response.body).toMatchObject({
      promptResponseRate: 0,
      responseBreakdown: {
        complete: 0,
        dismiss: 0,
        snooze: 0,
        timeout: 0,
      },
      averageResponseTime: 0,
    });
  });

  it('should calculate 40% response rate correctly', async () => {
    // Create exactly 40% engaged prompts (4 engaged out of 10 total)
    const now = new Date();
    const testPromptEvents: PromptEvent[] = [
      // 4 engaged prompts
      { promptId: 'p1', taskId: 't1', promptedAt: now.toISOString(), response: 'complete', respondedAt: now.toISOString() },
      { promptId: 'p2', taskId: 't2', promptedAt: now.toISOString(), response: 'dismiss', respondedAt: now.toISOString() },
      { promptId: 'p3', taskId: 't3', promptedAt: now.toISOString(), response: 'snooze', respondedAt: now.toISOString() },
      { promptId: 'p4', taskId: 't4', promptedAt: now.toISOString(), response: 'complete', respondedAt: now.toISOString() },
      // 6 timeout prompts
      { promptId: 'p5', taskId: 't5', promptedAt: now.toISOString(), response: 'timeout', respondedAt: null },
      { promptId: 'p6', taskId: 't6', promptedAt: now.toISOString(), response: 'timeout', respondedAt: null },
      { promptId: 'p7', taskId: 't7', promptedAt: now.toISOString(), response: 'timeout', respondedAt: null },
      { promptId: 'p8', taskId: 't8', promptedAt: now.toISOString(), response: 'timeout', respondedAt: null },
      { promptId: 'p9', taskId: 't9', promptedAt: now.toISOString(), response: 'timeout', respondedAt: null },
      { promptId: 'p10', taskId: 't10', promptedAt: now.toISOString(), response: 'timeout', respondedAt: null },
    ];

    await fs.writeFile(TEST_PROMPTS_FILE, JSON.stringify(testPromptEvents, null, 2), 'utf-8');

    const response = await request(app).get('/api/analytics/prompts').expect(200);

    // Verify 40% response rate (PRD target threshold)
    expect(response.body.promptResponseRate).toBe(40);
  });

  it('should return all timeout prompts with 0% response rate', async () => {
    // Create prompts with only timeout responses
    const now = new Date();
    const testPromptEvents: PromptEvent[] = [
      { promptId: 'p1', taskId: 't1', promptedAt: now.toISOString(), response: 'timeout', respondedAt: null },
      { promptId: 'p2', taskId: 't2', promptedAt: now.toISOString(), response: 'timeout', respondedAt: null },
      { promptId: 'p3', taskId: 't3', promptedAt: now.toISOString(), response: 'timeout', respondedAt: null },
    ];

    await fs.writeFile(TEST_PROMPTS_FILE, JSON.stringify(testPromptEvents, null, 2), 'utf-8');

    const response = await request(app).get('/api/analytics/prompts').expect(200);

    expect(response.body.promptResponseRate).toBe(0);
    expect(response.body.responseBreakdown).toMatchObject({
      complete: 0,
      dismiss: 0,
      snooze: 0,
      timeout: 3,
    });
    expect(response.body.averageResponseTime).toBe(0);
  });
});
