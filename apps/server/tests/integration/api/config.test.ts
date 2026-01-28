import { promises as fs } from 'fs';
import path from 'path';

// CRITICAL: Set DATA_DIR before importing app
process.env.DATA_DIR = path.join(process.cwd(), 'test-data-api-config');

import { describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import type { Config } from '@simple-todo/shared/types';
import { DEFAULT_CONFIG } from '@simple-todo/shared/types';
import request from 'supertest';

import app from '../../../src/app.js';

describe('Config API Integration Tests', () => {
  const testDataDir = path.join(process.cwd(), 'test-data-api-config');
  const testConfigFile = path.join(testDataDir, 'config.json');
  const testTasksFile = path.join(testDataDir, 'tasks.json');

  beforeEach(async () => {
    // Create test directory
    await fs.mkdir(testDataDir, { recursive: true });

    // Initialize config.json with default config
    const initialConfig: Config = { ...DEFAULT_CONFIG };
    await fs.writeFile(testConfigFile, JSON.stringify(initialConfig, null, 2), 'utf-8');

    // Initialize tasks.json with empty array
    await fs.writeFile(testTasksFile, JSON.stringify([]), 'utf-8');
  });

  afterEach(async () => {
    // Clean up test files after each test
    try {
      await fs.unlink(testConfigFile);
    } catch {
      // Ignore if file doesn't exist
    }
    try {
      await fs.unlink(testTasksFile);
    } catch {
      // Ignore if file doesn't exist
    }
  });

  afterAll(async () => {
    // Clean up test directory
    await fs.rm(testDataDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
  });

  describe('GET /api/config/wip-limit', () => {
    it('should return current WIP limit configuration with metadata', async () => {
      const response = await request(app).get('/api/config/wip-limit').expect(200);

      expect(response.body).toMatchObject({
        limit: 7, // Default WIP limit
        currentCount: 0, // No tasks initially
        canAddTask: true,
      });
    });

    it('should return correct currentCount when tasks exist', async () => {
      // Create some active tasks
      const tasks = [
        {
          id: '1',
          text: 'Task 1',
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
        {
          id: '2',
          text: 'Task 2',
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
        {
          id: '3',
          text: 'Task 3',
          status: 'completed',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      ];
      await fs.writeFile(testTasksFile, JSON.stringify(tasks, null, 2), 'utf-8');

      const response = await request(app).get('/api/config/wip-limit').expect(200);

      expect(response.body).toMatchObject({
        limit: 7,
        currentCount: 2, // Only active tasks count
        canAddTask: true,
      });
    });

    it('should return canAddTask false when at WIP limit', async () => {
      // Set WIP limit to 3
      const config: Config = { ...DEFAULT_CONFIG, wipLimit: 3 };
      await fs.writeFile(testConfigFile, JSON.stringify(config, null, 2), 'utf-8');

      // Create 3 active tasks
      const tasks = [
        {
          id: '1',
          text: 'Task 1',
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
        {
          id: '2',
          text: 'Task 2',
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
        {
          id: '3',
          text: 'Task 3',
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
      ];
      await fs.writeFile(testTasksFile, JSON.stringify(tasks, null, 2), 'utf-8');

      const response = await request(app).get('/api/config/wip-limit').expect(200);

      expect(response.body).toMatchObject({
        limit: 3,
        currentCount: 3,
        canAddTask: false,
      });
    });
  });

  describe('PUT /api/config/wip-limit', () => {
    it('should accept valid limit at minimum boundary (5)', async () => {
      const response = await request(app)
        .put('/api/config/wip-limit')
        .send({ limit: 5 })
        .expect(200);

      expect(response.body).toMatchObject({
        limit: 5,
        currentCount: 0,
        canAddTask: true,
      });

      // Verify persistence
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.wipLimit).toBe(5);
    });

    it('should accept valid limit at middle value (7)', async () => {
      const response = await request(app)
        .put('/api/config/wip-limit')
        .send({ limit: 7 })
        .expect(200);

      expect(response.body.limit).toBe(7);
    });

    it('should accept valid limit at maximum boundary (10)', async () => {
      const response = await request(app)
        .put('/api/config/wip-limit')
        .send({ limit: 10 })
        .expect(200);

      expect(response.body).toMatchObject({
        limit: 10,
        currentCount: 0,
        canAddTask: true,
      });

      // Verify persistence
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.wipLimit).toBe(10);
    });

    it('should reject limit below minimum (4) with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/wip-limit')
        .send({ limit: 4 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(response.body.details[0].message).toContain('at least 5');
    });

    it('should reject limit above maximum (11) with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/wip-limit')
        .send({ limit: 11 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(response.body.details[0].message).toContain('at most 10');
    });

    it('should reject limit of 0 with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/wip-limit')
        .send({ limit: 0 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject negative limit with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/wip-limit')
        .send({ limit: -1 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject non-integer limit with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/wip-limit')
        .send({ limit: 7.5 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.details).toBeDefined();
      expect(response.body.details[0].message).toContain('integer');
    });

    it('should reject string input with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/wip-limit')
        .send({ limit: '7' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject missing limit field with 400 status', async () => {
      const response = await request(app).put('/api/config/wip-limit').send({}).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('Config Persistence', () => {
    it('should persist updated limit across requests', async () => {
      // Update WIP limit to 8
      await request(app).put('/api/config/wip-limit').send({ limit: 8 }).expect(200);

      // Read limit in new request
      const response = await request(app).get('/api/config/wip-limit').expect(200);

      expect(response.body.limit).toBe(8);

      // Verify file content matches
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.wipLimit).toBe(8);
    });

    it('should preserve other config fields when updating WIP limit', async () => {
      // Update WIP limit
      await request(app).put('/api/config/wip-limit').send({ limit: 6 }).expect(200);

      // Verify other config fields are unchanged
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;

      expect(config.wipLimit).toBe(6);
      expect(config.promptingEnabled).toBe(DEFAULT_CONFIG.promptingEnabled);
      expect(config.celebrationsEnabled).toBe(DEFAULT_CONFIG.celebrationsEnabled);
      expect(config.hasCompletedSetup).toBe(DEFAULT_CONFIG.hasCompletedSetup);
    });
  });
});
