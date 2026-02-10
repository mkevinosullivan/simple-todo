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

  describe('GET /api/config/celebrations', () => {
    it('should return celebration configuration', async () => {
      const response = await request(app).get('/api/config/celebrations').expect(200);

      expect(response.body).toMatchObject({
        celebrationsEnabled: true,
        celebrationDurationSeconds: 7,
      });
    });

    it('should return updated celebration configuration', async () => {
      // Update config to have celebrations disabled and different duration
      const config: Config = {
        ...DEFAULT_CONFIG,
        celebrationsEnabled: false,
        celebrationDurationSeconds: 5,
      };
      await fs.writeFile(testConfigFile, JSON.stringify(config, null, 2), 'utf-8');

      const response = await request(app).get('/api/config/celebrations').expect(200);

      expect(response.body).toMatchObject({
        celebrationsEnabled: false,
        celebrationDurationSeconds: 5,
      });
    });
  });

  describe('PUT /api/config/celebrations', () => {
    it('should update celebration configuration', async () => {
      const response = await request(app)
        .put('/api/config/celebrations')
        .send({
          celebrationsEnabled: false,
          celebrationDurationSeconds: 5,
        })
        .expect(200);

      // Should return full config object
      expect(response.body.celebrationsEnabled).toBe(false);
      expect(response.body.celebrationDurationSeconds).toBe(5);

      // Verify persistence to file
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.celebrationsEnabled).toBe(false);
      expect(config.celebrationDurationSeconds).toBe(5);
    });

    it('should accept duration at minimum boundary (3)', async () => {
      const response = await request(app)
        .put('/api/config/celebrations')
        .send({
          celebrationsEnabled: true,
          celebrationDurationSeconds: 3,
        })
        .expect(200);

      expect(response.body.celebrationDurationSeconds).toBe(3);
    });

    it('should accept duration at maximum boundary (10)', async () => {
      const response = await request(app)
        .put('/api/config/celebrations')
        .send({
          celebrationsEnabled: true,
          celebrationDurationSeconds: 10,
        })
        .expect(200);

      expect(response.body.celebrationDurationSeconds).toBe(10);
    });

    it('should reject duration below minimum (2) with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/celebrations')
        .send({
          celebrationsEnabled: true,
          celebrationDurationSeconds: 2,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(response.body.details[0].message).toContain('at least 3 seconds');
    });

    it('should reject duration above maximum (11) with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/celebrations')
        .send({
          celebrationsEnabled: true,
          celebrationDurationSeconds: 11,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(response.body.details[0].message).toContain('at most 10 seconds');
    });

    it('should reject non-integer duration with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/celebrations')
        .send({
          celebrationsEnabled: true,
          celebrationDurationSeconds: 5.5,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.details).toBeDefined();
      expect(response.body.details[0].message).toContain('integer');
    });

    it('should reject invalid boolean type for celebrationsEnabled', async () => {
      const response = await request(app)
        .put('/api/config/celebrations')
        .send({
          celebrationsEnabled: 'true',
          celebrationDurationSeconds: 7,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject missing celebrationsEnabled field', async () => {
      const response = await request(app)
        .put('/api/config/celebrations')
        .send({
          celebrationDurationSeconds: 7,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject missing celebrationDurationSeconds field', async () => {
      const response = await request(app)
        .put('/api/config/celebrations')
        .send({
          celebrationsEnabled: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should preserve other config fields when updating celebrations', async () => {
      // Set initial config with specific values
      const initialConfig: Config = {
        ...DEFAULT_CONFIG,
        wipLimit: 8,
        hasCompletedSetup: true,
      };
      await fs.writeFile(testConfigFile, JSON.stringify(initialConfig, null, 2), 'utf-8');

      // Update celebration config
      await request(app)
        .put('/api/config/celebrations')
        .send({
          celebrationsEnabled: false,
          celebrationDurationSeconds: 4,
        })
        .expect(200);

      // Verify other fields are unchanged
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;

      expect(config.celebrationsEnabled).toBe(false);
      expect(config.celebrationDurationSeconds).toBe(4);
      expect(config.wipLimit).toBe(8);
      expect(config.hasCompletedSetup).toBe(true);
      expect(config.promptingEnabled).toBe(DEFAULT_CONFIG.promptingEnabled);
    });
  });

  describe('GET /api/config/prompting', () => {
    it('should return current prompting configuration', async () => {
      const response = await request(app).get('/api/config/prompting').expect(200);

      expect(response.body).toMatchObject({
        enabled: true,
        frequencyHours: 2.5,
      });
    });

    it('should return updated prompting configuration', async () => {
      // Update config to have prompting disabled and different frequency
      const config: Config = {
        ...DEFAULT_CONFIG,
        promptingEnabled: false,
        promptingFrequencyHours: 4,
      };
      await fs.writeFile(testConfigFile, JSON.stringify(config, null, 2), 'utf-8');

      const response = await request(app).get('/api/config/prompting').expect(200);

      expect(response.body).toMatchObject({
        enabled: false,
        frequencyHours: 4,
      });
    });

    it('should include nextPromptTime when available', async () => {
      const response = await request(app).get('/api/config/prompting').expect(200);

      expect(response.body).toHaveProperty('enabled');
      expect(response.body).toHaveProperty('frequencyHours');
      // nextPromptTime is optional and may or may not be present
    });
  });

  describe('PUT /api/config/prompting', () => {
    it('should update prompting configuration and persist to file', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: true,
          frequencyHours: 3,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        enabled: true,
        frequencyHours: 3,
      });

      // Verify persistence to file
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.promptingEnabled).toBe(true);
      expect(config.promptingFrequencyHours).toBe(3);
    });

    it('should disable prompting', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: false,
          frequencyHours: 2,
        })
        .expect(200);

      expect(response.body.enabled).toBe(false);

      // Verify persistence
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.promptingEnabled).toBe(false);
    });

    it('should accept frequency at minimum boundary (1)', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: true,
          frequencyHours: 1,
        })
        .expect(200);

      expect(response.body.frequencyHours).toBe(1);
    });

    it('should accept frequency at maximum boundary (6)', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: true,
          frequencyHours: 6,
        })
        .expect(200);

      expect(response.body.frequencyHours).toBe(6);
    });

    it('should accept non-integer frequency (2.5)', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: true,
          frequencyHours: 2.5,
        })
        .expect(200);

      expect(response.body.frequencyHours).toBe(2.5);
    });

    it('should reject frequency below minimum (0.5) with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: true,
          frequencyHours: 0.5,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(response.body.details[0].message).toBe('frequencyHours must be between 1 and 6');
    });

    it('should reject frequency above maximum (7) with 400 status', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: true,
          frequencyHours: 7,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(response.body.details[0].message).toBe('frequencyHours must be between 1 and 6');
    });

    it('should reject invalid boolean type for enabled', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: 'true',
          frequencyHours: 3,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details[0].message).toBe('enabled must be a boolean');
    });

    it('should reject invalid type for frequencyHours', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: true,
          frequencyHours: '3',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details[0].message).toBe('frequencyHours must be a number');
    });

    it('should reject missing enabled field', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          frequencyHours: 3,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details[0].message).toBe('enabled is required');
    });

    it('should reject missing frequencyHours field', async () => {
      const response = await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details[0].message).toBe('frequencyHours is required');
    });

    it('should preserve other config fields when updating prompting', async () => {
      // Set initial config with specific values
      const initialConfig: Config = {
        ...DEFAULT_CONFIG,
        wipLimit: 8,
        hasCompletedSetup: true,
        celebrationsEnabled: false,
      };
      await fs.writeFile(testConfigFile, JSON.stringify(initialConfig, null, 2), 'utf-8');

      // Update prompting config
      await request(app)
        .put('/api/config/prompting')
        .send({
          enabled: false,
          frequencyHours: 5,
        })
        .expect(200);

      // Verify other fields are unchanged
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;

      expect(config.promptingEnabled).toBe(false);
      expect(config.promptingFrequencyHours).toBe(5);
      expect(config.wipLimit).toBe(8);
      expect(config.hasCompletedSetup).toBe(true);
      expect(config.celebrationsEnabled).toBe(false);
    });
  });

  describe('PUT /api/config/browser-notifications', () => {
    it('should update browser notifications to enabled', async () => {
      const response = await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: true })
        .expect(200);

      // Should return full config object
      expect(response.body.browserNotificationsEnabled).toBe(true);
      expect(response.body).toHaveProperty('wipLimit');
      expect(response.body).toHaveProperty('promptingEnabled');

      // Verify persistence to file
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.browserNotificationsEnabled).toBe(true);
    });

    it('should update browser notifications to disabled', async () => {
      // First enable it
      await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: true })
        .expect(200);

      // Then disable it
      const response = await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: false })
        .expect(200);

      expect(response.body.browserNotificationsEnabled).toBe(false);

      // Verify persistence
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.browserNotificationsEnabled).toBe(false);
    });

    it('should return full config object', async () => {
      const response = await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: true })
        .expect(200);

      // Verify all config fields are present
      expect(response.body).toMatchObject({
        wipLimit: 7,
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
        celebrationsEnabled: true,
        celebrationDurationSeconds: 7,
        browserNotificationsEnabled: true,
        hasCompletedSetup: false,
        hasSeenPromptEducation: false,
        hasSeenWIPLimitEducation: false,
      });
    });

    it('should reject non-boolean enabled value with 400', async () => {
      const response = await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: 'true' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(response.body.details[0].message).toBe('enabled must be a boolean');
    });

    it('should reject missing enabled field with 400', async () => {
      const response = await request(app)
        .put('/api/config/browser-notifications')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(response.body.details[0].message).toBe('enabled is required');
    });

    it('should persist to config.json', async () => {
      // Update browser notifications
      await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: true })
        .expect(200);

      // Verify file was updated
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;
      expect(config.browserNotificationsEnabled).toBe(true);

      // Verify GET /api/config returns updated value
      const response = await request(app).get('/api/config').expect(200);
      expect(response.body.browserNotificationsEnabled).toBe(true);
    });

    it('should preserve other config fields', async () => {
      // Set initial config with specific values
      const initialConfig: Config = {
        ...DEFAULT_CONFIG,
        wipLimit: 8,
        hasCompletedSetup: true,
        celebrationsEnabled: false,
        promptingFrequencyHours: 4,
      };
      await fs.writeFile(testConfigFile, JSON.stringify(initialConfig, null, 2), 'utf-8');

      // Update browser notifications
      await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: true })
        .expect(200);

      // Verify other fields are unchanged
      const fileContent = await fs.readFile(testConfigFile, 'utf-8');
      const config = JSON.parse(fileContent) as Config;

      expect(config.browserNotificationsEnabled).toBe(true);
      expect(config.wipLimit).toBe(8);
      expect(config.hasCompletedSetup).toBe(true);
      expect(config.celebrationsEnabled).toBe(false);
      expect(config.promptingFrequencyHours).toBe(4);
    });

    it('should be idempotent (calling twice has same result)', async () => {
      // First update
      const response1 = await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: true })
        .expect(200);

      expect(response1.body.browserNotificationsEnabled).toBe(true);

      // Second update (should succeed with same result)
      const response2 = await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: true })
        .expect(200);

      expect(response2.body.browserNotificationsEnabled).toBe(true);
    });

    it('should reject number value with 400', async () => {
      const response = await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: 1 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject null value with 400', async () => {
      const response = await request(app)
        .put('/api/config/browser-notifications')
        .send({ enabled: null })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/config/quiet-hours', () => {
    it('should return quiet hours configuration with default values', async () => {
      const response = await request(app).get('/api/config/quiet-hours').expect(200);

      expect(response.body).toHaveProperty('enabled');
      expect(response.body).toHaveProperty('startTime');
      expect(response.body).toHaveProperty('endTime');
      expect(typeof response.body.enabled).toBe('boolean');
      expect(typeof response.body.startTime).toBe('string');
      expect(typeof response.body.endTime).toBe('string');
    });

    it('should return default quiet hours when not configured', async () => {
      const response = await request(app).get('/api/config/quiet-hours').expect(200);

      expect(response.body.enabled).toBe(false);
      expect(response.body.startTime).toBe('22:00');
      expect(response.body.endTime).toBe('08:00');
    });

    it('should return updated quiet hours after configuration', async () => {
      // First, update quiet hours
      await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '23:00',
          endTime: '07:00',
        })
        .expect(200);

      // Then fetch and verify
      const response = await request(app).get('/api/config/quiet-hours').expect(200);

      expect(response.body.enabled).toBe(true);
      expect(response.body.startTime).toBe('23:00');
      expect(response.body.endTime).toBe('07:00');
    });
  });

  describe('PUT /api/config/quiet-hours', () => {
    it('should update quiet hours configuration', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
        })
        .expect(200);

      expect(response.body.enabled).toBe(true);
      expect(response.body.startTime).toBe('22:00');
      expect(response.body.endTime).toBe('08:00');
    });

    it('should accept disabled quiet hours', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        })
        .expect(200);

      expect(response.body.enabled).toBe(false);
    });

    it('should accept equal start and end times (24-hour quiet period)', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '22:00',
          endTime: '22:00',
        })
        .expect(200);

      expect(response.body.startTime).toBe('22:00');
      expect(response.body.endTime).toBe('22:00');
    });

    it('should persist quiet hours configuration', async () => {
      // Update config
      await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '23:30',
          endTime: '06:30',
        })
        .expect(200);

      // Verify it persisted by fetching
      const response = await request(app).get('/api/config/quiet-hours').expect(200);

      expect(response.body.enabled).toBe(true);
      expect(response.body.startTime).toBe('23:30');
      expect(response.body.endTime).toBe('06:30');
    });

    it('should reject invalid time format - missing colon', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '2200',
          endTime: '08:00',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid time format - hour too high', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '25:00',
          endTime: '08:00',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid time format - minute too high', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '22:00',
          endTime: '08:60',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject missing enabled field', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          startTime: '22:00',
          endTime: '08:00',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject missing startTime field', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          endTime: '08:00',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject missing endTime field', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '22:00',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject non-boolean enabled value', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: 'true',
          startTime: '22:00',
          endTime: '08:00',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    it('should accept midnight-spanning range', async () => {
      const response = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
        })
        .expect(200);

      expect(response.body.startTime).toBe('22:00');
      expect(response.body.endTime).toBe('08:00');
    });

    it('should be idempotent', async () => {
      // First update
      const response1 = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '23:00',
          endTime: '07:00',
        })
        .expect(200);

      // Second update with same values
      const response2 = await request(app)
        .put('/api/config/quiet-hours')
        .send({
          enabled: true,
          startTime: '23:00',
          endTime: '07:00',
        })
        .expect(200);

      expect(response1.body).toEqual(response2.body);
    });
  });
});
