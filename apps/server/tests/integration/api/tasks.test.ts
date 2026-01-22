import { promises as fs } from 'fs';
import path from 'path';

// CRITICAL: Set DATA_DIR before importing app
process.env.DATA_DIR = path.join(process.cwd(), 'test-data-api-tasks');

import { describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
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
      const response = await request(app)
        .post('/api/tasks')
        .send({ text: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('empty');
    });

    it('should return 400 error when text is only whitespace', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ text: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('empty');
    });

    it('should return 400 error when text exceeds 500 characters', async () => {
      const longText = 'a'.repeat(501);
      const response = await request(app)
        .post('/api/tasks')
        .send({ text: longText })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('500');
    });

    it('should accept text exactly 500 characters long', async () => {
      const exactText = 'a'.repeat(500);
      const response = await request(app)
        .post('/api/tasks')
        .send({ text: exactText })
        .expect(201);

      expect(response.body.text).toBe(exactText);
    });

    it('should return 400 error when text field is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .expect(400);

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
      await fs.writeFile(
        testTasksFile,
        JSON.stringify([task1, task2]),
        'utf-8'
      );

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
      await fs.writeFile(
        testTasksFile,
        JSON.stringify([task1, task2, task3]),
        'utf-8'
      );

      const response = await request(app)
        .get('/api/tasks?status=active')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].text).toBe('Active task 1');
      expect(response.body[1].text).toBe('Active task 2');
      expect(response.body.every((t: any) => t.status === 'active')).toBe(true);
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
      await fs.writeFile(
        testTasksFile,
        JSON.stringify([task1, task2, task3]),
        'utf-8'
      );

      const response = await request(app)
        .get('/api/tasks?status=completed')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].text).toBe('Completed task 1');
      expect(response.body[1].text).toBe('Completed task 2');
      expect(
        response.body.every((t: any) => t.status === 'completed')
      ).toBe(true);
    });

    it('should return empty array when no tasks exist', async () => {
      const response = await request(app).get('/api/tasks').expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 400 error for invalid status value', async () => {
      const response = await request(app)
        .get('/api/tasks?status=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('status');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by valid ID', async () => {
      const task = createTestTask({ text: 'Test task', status: 'active' });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: task.id,
        text: 'Test task',
        status: 'active',
      });
    });

    it('should return 404 when task ID does not exist', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .get(`/api/tasks/${validUuid}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 error for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid-id')
        .expect(400);

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
      await fs.writeFile(
        testTasksFile,
        JSON.stringify([task1, task2, task3]),
        'utf-8'
      );

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
      const response = await request(app)
        .delete(`/api/tasks/${validUuid}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 error for invalid UUID format', async () => {
      const response = await request(app)
        .delete('/api/tasks/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    it('should mark a task as complete and return 200', async () => {
      const task = createTestTask({ text: 'Task to complete', status: 'active' });
      await fs.writeFile(testTasksFile, JSON.stringify([task]), 'utf-8');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/complete`)
        .expect(200);

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
      const response = await request(app)
        .patch(`/api/tasks/${validUuid}/complete`)
        .expect(404);

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

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/complete`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already completed');
    });

    it('should return 400 error for invalid UUID format', async () => {
      const response = await request(app)
        .patch('/api/tasks/invalid-id/complete')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('Error handling', () => {
    it('should return JSON error responses for all error cases', async () => {
      // Test various error cases and verify JSON error format
      const errors = [
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
        const response = await (request(app) as any)
          [method](path)
          .send(body);

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      }
    });
  });
});
