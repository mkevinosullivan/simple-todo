import { promises as fs } from 'fs';
import path from 'path';

// CRITICAL: Set DATA_DIR before importing app
process.env.DATA_DIR = path.join(process.cwd(), 'test-data-api-tasks');

import { describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import type { Task } from '@simple-todo/shared/types';
import request from 'supertest';

import app from '../../../src/app.js';
import { createTestTask } from '../../helpers/factories.js';

describe('Task API Integration Tests', () => {
  const testDataDir = path.join(process.cwd(), 'test-data-api-tasks');
  const testTasksFile = path.join(testDataDir, 'tasks.json');

  beforeEach(async () => {
    // Create test directory and empty tasks file
    await fs.mkdir(testDataDir, { recursive: true });
    await fs.writeFile(testTasksFile, JSON.stringify([]), 'utf-8');
  });

  afterEach(async () => {
    // Clean up test files after each test
    try {
      await fs.unlink(testTasksFile);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  afterAll(async () => {
    // Clean up test directory
    await fs.rm(testDataDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
  });

  describe('POST /api/tasks', () => {
    it('should create a task with valid input and return 201', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ text: 'Buy groceries' })
        .expect(201);

      expect(response.body).toMatchObject({
        text: 'Buy groceries',
        status: 'active',
        completedAt: null,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();

      // Verify task was persisted to file
      const fileContent = await fs.readFile(testTasksFile, 'utf-8');
      const tasks = JSON.parse(fileContent);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].text).toBe('Buy groceries');
    });

    it('should trim whitespace from task text', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ text: '  Test task with spaces  ' })
        .expect(201);

      expect(response.body.text).toBe('Test task with spaces');
    });

    it('should return 400 error when text is empty', async () => {
      const response = await request(app).post('/api/tasks').send({ text: '' }).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('empty');
    });

    it('should return 400 error when text is only whitespace', async () => {
      const response = await request(app).post('/api/tasks').send({ text: '   ' }).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('empty');
    });

    it('should return 400 error when text exceeds 500 characters', async () => {
      const longText = 'a'.repeat(501);
      const response = await request(app).post('/api/tasks').send({ text: longText }).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('500');
    });

    it('should accept text exactly 500 characters long', async () => {
      const exactText = 'a'.repeat(500);
      const response = await request(app).post('/api/tasks').send({ text: exactText }).expect(201);

      expect(response.body.text).toBe(exactText);
    });

    it('should return 400 error when text field is missing', async () => {
      const response = await request(app).post('/api/tasks').send({}).expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks when no filter is provided', async () => {
      // Create test tasks
      const task1 = createTestTask({ text: 'Active task', status: 'active' });
      const task2 = createTestTask({
        text: 'Completed task',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      await fs.writeFile(testTasksFile, JSON.stringify([task1, task2]), 'utf-8');

      const response = await request(app).get('/api/tasks').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].text).toBe('Active task');
      expect(response.body[1].text).toBe('Completed task');
    });

    it('should filter tasks by status=active', async () => {
      const task1 = createTestTask({ text: 'Active task 1', status: 'active' });
      const task2 = createTestTask({
        text: 'Completed task',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      const task3 = createTestTask({ text: 'Active task 2', status: 'active' });
      await fs.writeFile(testTasksFile, JSON.stringify([task1, task2, task3]), 'utf-8');

      const response = await request(app).get('/api/tasks?status=active').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].text).toBe('Active task 1');
      expect(response.body[1].text).toBe('Active task 2');
      expect((response.body as Task[]).every((t: Task) => t.status === 'active')).toBe(true);
    });

    it('should filter tasks by status=completed', async () => {
      const task1 = createTestTask({ text: 'Active task', status: 'active' });
      const task2 = createTestTask({
        text: 'Completed task 1',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      const task3 = createTestTask({
        text: 'Completed task 2',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      await fs.writeFile(testTasksFile, JSON.stringify([task1, task2, task3]), 'utf-8');

      const response = await request(app).get('/api/tasks?status=completed').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].text).toBe('Completed task 1');
      expect(response.body[1].text).toBe('Completed task 2');
      expect((response.body as Task[]).every((t: Task) => t.status === 'completed')).toBe(true);
    });

    it('should return empty array when no tasks exist', async () => {
      const response = await request(app).get('/api/tasks').expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 400 error for invalid status value', async () => {
      const response = await request(app).get('/api/tasks?status=invalid').expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('status');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by valid ID', async () => {
      const task = createTestTask({ text: 'Test task', status: 'active' });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      const response = await request(app).get(`/api/tasks/${task.id}`).expect(200);

      expect(response.body).toMatchObject({
        id: task.id,
        text: 'Test task',
        status: 'active',
      });
    });

    it('should return 404 when task ID does not exist', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app).get(`/api/tasks/${validUuid}`).expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 error for invalid UUID format', async () => {
      const response = await request(app).get('/api/tasks/invalid-id').expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task text with valid input', async () => {
      const task = createTestTask({ text: 'Original text', status: 'active' });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ text: 'Updated text' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: task.id,
        text: 'Updated text',
        status: 'active',
      });

      // Verify persistence
      const fileContent = await fs.readFile(testTasksFile, 'utf-8');
      const tasks = JSON.parse(fileContent);
      expect(tasks[0].text).toBe('Updated text');
    });

    it('should trim whitespace from updated text', async () => {
      const task = createTestTask({ text: 'Original', status: 'active' });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ text: '  Updated with spaces  ' })
        .expect(200);

      expect(response.body.text).toBe('Updated with spaces');
    });

    it('should return 404 when task ID does not exist', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .put(`/api/tasks/${validUuid}`)
        .send({ text: 'New text' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 error when text is empty', async () => {
      const task = createTestTask({ text: 'Original', status: 'active' });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ text: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('empty');
    });

    it('should return 400 error when text exceeds 500 characters', async () => {
      const task = createTestTask({ text: 'Original', status: 'active' });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      const longText = 'a'.repeat(501);
      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ text: longText })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('500');
    });

    it('should return 400 error when trying to update completed task', async () => {
      const task = createTestTask({
        text: 'Completed task',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ text: 'Try to update' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('completed');
    });

    it('should return 400 error for invalid UUID format', async () => {
      const response = await request(app)
        .put('/api/tasks/invalid-id')
        .send({ text: 'New text' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task and return 204', async () => {
      const task = createTestTask({ text: 'Task to delete' });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      await request(app).delete(`/api/tasks/${task.id}`).expect(204);

      // Verify task was removed from file
      const fileContent = await fs.readFile(testTasksFile, 'utf-8');
      const tasks = JSON.parse(fileContent);
      expect(tasks).toHaveLength(0);
    });

    it('should delete only the specified task', async () => {
      const task1 = createTestTask({ text: 'Task 1' });
      const task2 = createTestTask({ text: 'Task 2' });
      const task3 = createTestTask({ text: 'Task 3' });
      await fs.writeFile(testTasksFile, JSON.stringify([task1, task2, task3]), 'utf-8');

      await request(app).delete(`/api/tasks/${task2.id}`).expect(204);

      // Verify only task2 was removed
      const fileContent = await fs.readFile(testTasksFile, 'utf-8');
      const tasks = JSON.parse(fileContent);
      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe(task1.id);
      expect(tasks[1].id).toBe(task3.id);
    });

    it('should return 404 when task ID does not exist', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app).delete(`/api/tasks/${validUuid}`).expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 error for invalid UUID format', async () => {
      const response = await request(app).delete('/api/tasks/invalid-id').expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    it('should mark a task as complete and return 200', async () => {
      const task = createTestTask({ text: 'Task to complete', status: 'active' });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      const response = await request(app).patch(`/api/tasks/${task.id}/complete`).expect(200);

      expect(response.body).toMatchObject({
        id: task.id,
        text: 'Task to complete',
        status: 'completed',
      });
      expect(response.body.completedAt).toBeDefined();
      expect(response.body.completedAt).not.toBeNull();

      // Verify persistence
      const fileContent = await fs.readFile(testTasksFile, 'utf-8');
      const tasks = JSON.parse(fileContent);
      expect(tasks[0].status).toBe('completed');
      expect(tasks[0].completedAt).toBeDefined();
    });

    it('should return 404 when task ID does not exist', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app).patch(`/api/tasks/${validUuid}/complete`).expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 error when task is already completed', async () => {
      const task = createTestTask({
        text: 'Already completed',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      const response = await request(app).patch(`/api/tasks/${task.id}/complete`).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already completed');
    });

    it('should return 400 error for invalid UUID format', async () => {
      const response = await request(app).patch('/api/tasks/invalid-id/complete').expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('WIP Limit Enforcement', () => {
    const testConfigFile = path.join(testDataDir, 'config.json');

    beforeEach(async () => {
      // Initialize config.json with default WIP limit of 7
      const config = {
        wipLimit: 7,
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
        celebrationsEnabled: true,
        celebrationDurationSeconds: 7,
        browserNotificationsEnabled: false,
        hasCompletedSetup: false,
        hasSeenPromptEducation: false,
      };
      await fs.writeFile(testConfigFile, JSON.stringify(config, null, 2), 'utf-8');
    });

    afterEach(async () => {
      try {
        await fs.unlink(testConfigFile);
      } catch {
        // Ignore if file doesn't exist
      }
    });

    it('should allow task creation when under WIP limit', async () => {
      // Create 3 active tasks (well under limit of 7)
      const tasks = [
        createTestTask({ text: 'Task 1' }),
        createTestTask({ text: 'Task 2' }),
        createTestTask({ text: 'Task 3' }),
      ];
      await fs.writeFile(testTasksFile, JSON.stringify(tasks), 'utf-8');

      // Should be able to create another task
      const response = await request(app).post('/api/tasks').send({ text: 'Task 4' }).expect(201);

      expect(response.body).toHaveProperty('text', 'Task 4');
      expect(response.body).toHaveProperty('status', 'active');
    });

    it('should block task creation when at WIP limit with 409 status', async () => {
      // Create 7 active tasks (exactly at limit)
      const tasks = Array.from({ length: 7 }, (_, i) => createTestTask({ text: `Task ${i + 1}` }));
      await fs.writeFile(testTasksFile, JSON.stringify(tasks), 'utf-8');

      // 8th task should be blocked with 409 Conflict
      const response = await request(app).post('/api/tasks').send({ text: 'Task 8' }).expect(409);

      expect(response.body).toHaveProperty('error', 'WIP limit reached');
      expect(response.body).toHaveProperty('wipLimitMessage');

      // Verify task was NOT created
      const fileContent = await fs.readFile(testTasksFile, 'utf-8');
      const persistedTasks = JSON.parse(fileContent);
      expect(persistedTasks).toHaveLength(7); // Still only 7 tasks
    });

    it('should include encouraging wipLimitMessage in 409 response', async () => {
      // Create 7 active tasks
      const tasks = Array.from({ length: 7 }, (_, i) => createTestTask({ text: `Task ${i + 1}` }));
      await fs.writeFile(testTasksFile, JSON.stringify(tasks), 'utf-8');

      // Attempt to create 8th task
      const response = await request(app).post('/api/tasks').send({ text: 'Task 8' }).expect(409);

      expect(response.body.wipLimitMessage).toBeDefined();
      expect(typeof response.body.wipLimitMessage).toBe('string');
      expect(response.body.wipLimitMessage).toContain('7 active tasks');
      expect(response.body.wipLimitMessage).toContain('complete one before adding more');
      // Message should be encouraging, not punitive
      expect(response.body.wipLimitMessage.toLowerCase()).toContain('focus');
    });

    it('should enforce updated limit immediately without restart', async () => {
      // Create 5 active tasks
      const tasks = Array.from({ length: 5 }, (_, i) => createTestTask({ text: `Task ${i + 1}` }));
      await fs.writeFile(testTasksFile, JSON.stringify(tasks), 'utf-8');

      // Task creation should succeed (5 < 7)
      await request(app).post('/api/tasks').send({ text: 'Task 6' }).expect(201);

      // Update WIP limit to 5
      await request(app).put('/api/config/wip-limit').send({ limit: 5 }).expect(200);

      // Task creation should now be blocked (6 >= 5) - no restart required
      const response = await request(app).post('/api/tasks').send({ text: 'Task 7' }).expect(409);

      expect(response.body).toHaveProperty('error', 'WIP limit reached');

      // Increase limit to 10
      await request(app).put('/api/config/wip-limit').send({ limit: 10 }).expect(200);

      // Task creation should now succeed again (6 < 10)
      await request(app).post('/api/tasks').send({ text: 'Task 7' }).expect(201);
    });

    it('should return 409 for WIP limit, distinct from 400 validation errors', async () => {
      // Part 1: Test WIP limit error (409)
      // Create tasks at WIP limit
      const tasksAtLimit = Array.from({ length: 7 }, (_, i) =>
        createTestTask({ text: `Task ${i + 1}` })
      );
      await fs.writeFile(testTasksFile, JSON.stringify(tasksAtLimit), 'utf-8');

      // WIP limit error: 409 Conflict with wipLimitMessage
      const wipLimitResponse = await request(app)
        .post('/api/tasks')
        .send({ text: 'Valid task text' })
        .expect(409);

      expect(wipLimitResponse.body).toEqual({
        error: 'WIP limit reached',
        wipLimitMessage: expect.any(String),
      });

      // Part 2: Test validation error (400)
      // Reset to fewer tasks so we're not at WIP limit
      const tasksUnderLimit = Array.from({ length: 3 }, (_, i) =>
        createTestTask({ text: `Task ${i + 1}` })
      );
      await fs.writeFile(testTasksFile, JSON.stringify(tasksUnderLimit), 'utf-8');

      // Validation error: 400 Bad Request without wipLimitMessage
      const validationResponse = await request(app)
        .post('/api/tasks')
        .send({ text: '' })
        .expect(400);

      expect(validationResponse.body).toHaveProperty('error');
      expect(validationResponse.body).not.toHaveProperty('wipLimitMessage');
      expect(validationResponse.body.error).toContain('empty');
    });

    it('should not count completed tasks against WIP limit', async () => {
      // Create 6 active tasks and 5 completed tasks (11 total)
      const tasks = [
        ...Array.from({ length: 6 }, (_, i) => createTestTask({ text: `Active ${i + 1}` })),
        ...Array.from({ length: 5 }, (_, i) =>
          createTestTask({
            text: `Completed ${i + 1}`,
            status: 'completed',
            completedAt: new Date().toISOString(),
          })
        ),
      ];
      await fs.writeFile(testTasksFile, JSON.stringify(tasks), 'utf-8');

      // Should be able to create one more task (6 active < 7 limit)
      const response = await request(app).post('/api/tasks').send({ text: 'Task 12' }).expect(201);

      expect(response.body).toHaveProperty('text', 'Task 12');
    });
  });

  describe('Error handling', () => {
    it('should return JSON error responses for all error cases', async () => {
      // Test various error cases and verify JSON error format
      const errors: Array<{
        method: 'get' | 'post' | 'put' | 'delete' | 'patch';
        path: string;
        body: object;
      }> = [
        { method: 'post', path: '/api/tasks', body: { text: '' } },
        { method: 'get', path: '/api/tasks?status=invalid', body: {} },
        { method: 'get', path: '/api/tasks/invalid-id', body: {} },
        {
          method: 'put',
          path: '/api/tasks/invalid-id',
          body: { text: 'test' },
        },
        { method: 'delete', path: '/api/tasks/invalid-id', body: {} },
        { method: 'patch', path: '/api/tasks/invalid-id/complete', body: {} },
      ];

      for (const { method, path, body } of errors) {
        let response;
        switch (method) {
          case 'get':
            response = await request(app).get(path).send(body);
            break;
          case 'post':
            response = await request(app).post(path).send(body);
            break;
          case 'put':
            response = await request(app).put(path).send(body);
            break;
          case 'delete':
            response = await request(app).delete(path).send(body);
            break;
          case 'patch':
            response = await request(app).patch(path).send(body);
            break;
        }

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      }
    });
  });
});
