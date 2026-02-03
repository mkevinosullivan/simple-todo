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

  describe('GET /api/config', () => {
    it('should return full configuration object', async () => {
      const response = await request(app).get('/api/config').expect(200);

      expect(response.body).toMatchObject({
        wipLimit: 7,
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
        celebrationsEnabled: true,
        celebrationDurationSeconds: 7,
        browserNotificationsEnabled: false,
        hasCompletedSetup: false,
        hasSeenPromptEducation: false,
        hasSeenWIPLimitEducation: false,
      });
    });

    it('should return hasCompletedSetup false on first launch', async () => {
      const response = await request(app).get('/api/config').expect(200);

      expect(response.body.hasCompletedSetup).toBe(false);
    });

    it('should return hasCompletedSetup true after setup completed', async () => {
      // Set hasCompletedSetup to true
      const config: Config = { ...DEFAULT_CONFIG, hasCompletedSetup: true };
      await fs.writeFile(testConfigFile, JSON.stringify(config, null, 2), 'utf-8');

      const response = await request(app).get('/api/config').expect(200);

      expect(response.body.hasCompletedSetup).toBe(true);
    });

    it('should handle missing config.json by returning DEFAULT_CONFIG', async () => {
      // Delete config.json
      await fs.unlink(testConfigFile);

      const response = await request(app).get('/api/config').expect(200);

      // Should return DEFAULT_CONFIG values
      expect(response.body).toMatchObject({
        wipLimit: 7,
        hasCompletedSetup: false,
      });
    });
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

    it('should set hasCompletedSetup to true after updating WIP limit', async () => {
      // Ensure hasCompletedSetup starts as false
      const initialConfig: Config = { ...DEFAULT_CONFIG, hasCompletedSetup: false };
      await fs.writeFile(testConfigFile, JSON.stringify(initialConfig, null, 2), 'utf-8');

      // Update WIP limit
      const response = await request(app)
        .put('/api/config/wip-limit')
        .send({ limit: 8 })
        .expect(200);

      // Verify response includes hasCompletedSetup: true
      expect(response.body.hasCompletedSetup).toBe(true);

      // Verify persistence in config.json
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.hasCompletedSetup).toBe(true);
      expect(config.wipLimit).toBe(8);
    });

    it('should persist hasCompletedSetup across app restarts', async () => {
      // Set hasCompletedSetup to false initially
      const initialConfig: Config = { ...DEFAULT_CONFIG, hasCompletedSetup: false };
      await fs.writeFile(testConfigFile, JSON.stringify(initialConfig, null, 2), 'utf-8');

      // Update WIP limit (sets hasCompletedSetup to true)
      await request(app).put('/api/config/wip-limit').send({ limit: 7 }).expect(200);

      // Verify hasCompletedSetup persists in file
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.hasCompletedSetup).toBe(true);

      // Verify GET /api/config returns hasCompletedSetup: true
      const response = await request(app).get('/api/config').expect(200);
      expect(response.body.hasCompletedSetup).toBe(true);
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
      // hasCompletedSetup should now be true (set by the endpoint)
      expect(config.hasCompletedSetup).toBe(true);
    });
  });

  describe('PATCH /api/config - Partial Config Updates', () => {
    it('should update hasCompletedSetup flag to true', async () => {
      // Ensure hasCompletedSetup starts as false
      const initialConfig: Config = { ...DEFAULT_CONFIG, hasCompletedSetup: false };
      await fs.writeFile(testConfigFile, JSON.stringify(initialConfig, null, 2), 'utf-8');

      // Update hasCompletedSetup via PATCH
      const response = await request(app)
        .patch('/api/config')
        .send({ hasCompletedSetup: true })
        .expect(200);

      // Verify response includes updated flag
      expect(response.body.hasCompletedSetup).toBe(true);

      // Verify full config is returned
      expect(response.body).toMatchObject({
        wipLimit: 7,
        promptingEnabled: true,
        hasCompletedSetup: true,
      });

      // Verify persistence to file
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.hasCompletedSetup).toBe(true);
    });

    it('should be idempotent (calling twice has same result)', async () => {
      // First PATCH
      const response1 = await request(app)
        .patch('/api/config')
        .send({ hasCompletedSetup: true })
        .expect(200);

      expect(response1.body.hasCompletedSetup).toBe(true);

      // Second PATCH (should succeed with same result)
      const response2 = await request(app)
        .patch('/api/config')
        .send({ hasCompletedSetup: true })
        .expect(200);

      expect(response2.body.hasCompletedSetup).toBe(true);
    });

    it('should update multiple config fields in single request', async () => {
      const response = await request(app)
        .patch('/api/config')
        .send({
          hasCompletedSetup: true,
          wipLimit: 5,
          celebrationsEnabled: false,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        hasCompletedSetup: true,
        wipLimit: 5,
        celebrationsEnabled: false,
      });

      // Verify persistence
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.hasCompletedSetup).toBe(true);
      expect(config.wipLimit).toBe(5);
      expect(config.celebrationsEnabled).toBe(false);
    });

    it('should preserve other fields when updating single field', async () => {
      // Update only hasCompletedSetup
      await request(app).patch('/api/config').send({ hasCompletedSetup: true }).expect(200);

      // Verify other fields are unchanged
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;

      expect(config.hasCompletedSetup).toBe(true);
      expect(config.wipLimit).toBe(DEFAULT_CONFIG.wipLimit);
      expect(config.promptingEnabled).toBe(DEFAULT_CONFIG.promptingEnabled);
      expect(config.celebrationsEnabled).toBe(DEFAULT_CONFIG.celebrationsEnabled);
    });

    it('should reject empty body with 400 status', async () => {
      const response = await request(app).patch('/api/config').send({}).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid wipLimit value', async () => {
      const response = await request(app)
        .patch('/api/config')
        .send({ wipLimit: 3 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details[0].message).toContain('at least 5');
    });

    it('should reject invalid boolean type for hasCompletedSetup', async () => {
      const response = await request(app)
        .patch('/api/config')
        .send({ hasCompletedSetup: 'true' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should update hasSeenPromptEducation flag', async () => {
      const response = await request(app)
        .patch('/api/config')
        .send({ hasSeenPromptEducation: true })
        .expect(200);

      expect(response.body.hasSeenPromptEducation).toBe(true);

      // Verify persistence
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.hasSeenPromptEducation).toBe(true);
    });
  });
});
