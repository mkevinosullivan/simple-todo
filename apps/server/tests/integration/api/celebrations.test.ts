import path from 'path';

// CRITICAL: Set DATA_DIR before importing app
process.env.DATA_DIR = path.join(process.cwd(), 'test-data-api-celebrations');

import { describe, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';

import app from '../../../src/app.js';

describe('Celebration API Integration Tests', () => {
  afterAll(() => {
    delete process.env.DATA_DIR;
  });

  describe('GET /api/celebrations/message', () => {
    it('should return 200 with celebration message structure', async () => {
      const response = await request(app).get('/api/celebrations/message').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('variant');
      expect(response.body).toHaveProperty('duration');
    });

    it('should return message as string', async () => {
      const response = await request(app).get('/api/celebrations/message').expect(200);

      expect(typeof response.body.message).toBe('string');
      expect(response.body.message.length).toBeGreaterThan(0);
    });

    it('should return valid variant type', async () => {
      const response = await request(app).get('/api/celebrations/message').expect(200);

      const validVariants = ['enthusiastic', 'supportive', 'motivational', 'data-driven'];
      expect(validVariants).toContain(response.body.variant);
    });

    it('should default duration to 5000ms', async () => {
      const response = await request(app).get('/api/celebrations/message').expect(200);

      expect(response.body.duration).toBe(5000);
    });

    it('should return varied messages across multiple calls', async () => {
      const messages = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const response = await request(app).get('/api/celebrations/message');
        messages.add(response.body.message);
      }

      // Should have at least 5 unique messages out of 10 calls (AC: 9)
      expect(messages.size).toBeGreaterThanOrEqual(5);
    });

    it('should accept optional taskId query parameter', async () => {
      const response = await request(app)
        .get('/api/celebrations/message?taskId=123e4567-e89b-12d3-a456-426614174000')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('variant');
      expect(response.body).toHaveProperty('duration');
    });

    it('should respond quickly (performance requirement)', async () => {
      const start = Date.now();

      await request(app).get('/api/celebrations/message').expect(200);

      const duration = Date.now() - start;

      // Allow 50ms in test environment (AC specifies <10ms in production)
      expect(duration).toBeLessThan(50);
    });

    it('should return fallback message if service fails', async () => {
      // Mock CelebrationService to throw error and verify fallback response
      const { CelebrationService } = await import('../../../src/services/CelebrationService.js');

      const originalGetMessage = CelebrationService.prototype.getCelebrationMessage;

      // Mock the method to throw an error
      CelebrationService.prototype.getCelebrationMessage = async () => {
        throw new Error('Service failure simulation');
      };

      const response = await request(app).get('/api/celebrations/message').expect(200);

      // Verify fallback response is returned (AC: 10)
      expect(response.body.message).toBe('Great job! Task completed.');
      expect(response.body.variant).toBe('supportive');
      expect(response.body.duration).toBe(5000);

      // Restore original method
      CelebrationService.prototype.getCelebrationMessage = originalGetMessage;
    });
  });
});
