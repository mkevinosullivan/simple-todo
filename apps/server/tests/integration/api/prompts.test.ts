import path from 'path';

// CRITICAL: Set DATA_DIR before importing app
process.env.DATA_DIR = path.join(process.cwd(), 'test-data-api-prompts');

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import type { AddressInfo } from 'net';
import request from 'supertest';

import app from '../../../src/app.js';
import type { ProactivePrompt } from '@simple-todo/shared/types';
import { DataService } from '../../../src/services/DataService.js';
import { PromptingService } from '../../../src/services/PromptingService.js';
import { TaskService } from '../../../src/services/TaskService.js';

describe('Prompts SSE API Integration Tests', () => {
  let dataService: DataService;
  let taskService: TaskService;
  let promptingService: PromptingService;

  beforeAll(async () => {
    // Initialize services for testing
    dataService = new DataService(process.env.DATA_DIR);
    taskService = new TaskService(dataService);
    promptingService = new PromptingService(taskService, dataService);

    // Ensure prompting is enabled for tests
    const config = await dataService.loadConfig();
    await dataService.saveConfig({ ...config, promptingEnabled: true });
  });

  afterAll(async () => {
    // Clean up test data directory
    delete process.env.DATA_DIR;
  });

  describe('GET /api/prompts/stream', () => {
    it('should establish SSE connection with correct headers', async () => {
      const response = await request(app)
        .get('/api/prompts/stream')
        .timeout(1000) // Short timeout for header check
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/event-stream/);
      expect(response.headers['cache-control']).toBe('no-cache');
      expect(response.headers['connection']).toBe('keep-alive');
    });

    it('should send keep-alive messages in SSE format', (done) => {
      const req = request(app)
        .get('/api/prompts/stream')
        .timeout(35000); // 35 seconds to receive keep-alive (sent every 30s)

      let receivedData = '';

      req.on('response', (res) => {
        res.on('data', (chunk) => {
          receivedData += chunk.toString();

          // Check if we received a keep-alive comment
          if (receivedData.includes(': keep-alive')) {
            // Success - received keep-alive
            req.abort();
            done();
          }
        });

        res.on('end', () => {
          // Connection ended before keep-alive received
          if (!receivedData.includes(': keep-alive')) {
            done(new Error('No keep-alive message received'));
          }
        });
      });

      req.on('error', (err: Error & { code?: string }) => {
        // Abort is expected after receiving keep-alive
        if (err.code === 'ECONNRESET') {
          done();
        } else {
          done(err);
        }
      });
    });

    it('should reject connection when prompting is disabled', async () => {
      // Disable prompting
      const config = await dataService.loadConfig();
      await dataService.saveConfig({ ...config, promptingEnabled: false });

      const response = await request(app).get('/api/prompts/stream').expect(503);

      expect(response.text).toContain('Prompting is currently disabled');

      // Re-enable for other tests
      await dataService.saveConfig({ ...config, promptingEnabled: true });
    });

    it('should broadcast prompt event when PromptingService emits', (done) => {
      // Create a test prompt
      const testPrompt: ProactivePrompt = {
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        taskText: 'Test prompt task',
        promptedAt: new Date().toISOString(),
      };

      const req = request(app)
        .get('/api/prompts/stream')
        .timeout(5000);

      let receivedData = '';

      req.on('response', (res) => {
        res.on('data', (chunk) => {
          receivedData += chunk.toString();

          // Check if we received the prompt event
          if (receivedData.includes('event: prompt')) {
            // Verify event format and data
            expect(receivedData).toContain('event: prompt');
            expect(receivedData).toContain(`data: ${JSON.stringify(testPrompt)}`);

            req.abort();
            done();
          }
        });

        // After connection established, emit a test prompt
        setTimeout(() => {
          promptingService.emit('prompt', testPrompt);
        }, 100);
      });

      req.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ECONNRESET') {
          // Expected after abort
          done();
        } else {
          done(err);
        }
      });
    });

    it('should support multiple simultaneous connections', (done) => {
      const testPrompt: ProactivePrompt = {
        taskId: '987e6543-e21b-43c1-b123-321456789000',
        taskText: 'Multi-connection test task',
        promptedAt: new Date().toISOString(),
      };

      let connection1Received = false;
      let connection2Received = false;

      const checkBothReceived = () => {
        if (connection1Received && connection2Received) {
          done();
        }
      };

      // Connection 1
      const req1 = request(app)
        .get('/api/prompts/stream')
        .timeout(5000);

      let receivedData1 = '';
      req1.on('response', (res) => {
        res.on('data', (chunk) => {
          receivedData1 += chunk.toString();
          if (receivedData1.includes('event: prompt') && receivedData1.includes(testPrompt.taskId)) {
            connection1Received = true;
            req1.abort();
            checkBothReceived();
          }
        });
      });

      // Connection 2
      const req2 = request(app)
        .get('/api/prompts/stream')
        .timeout(5000);

      let receivedData2 = '';
      req2.on('response', (res) => {
        res.on('data', (chunk) => {
          receivedData2 += chunk.toString();
          if (receivedData2.includes('event: prompt') && receivedData2.includes(testPrompt.taskId)) {
            connection2Received = true;
            req2.abort();
            checkBothReceived();
          }
        });
      });

      // Emit prompt after both connections established
      setTimeout(() => {
        promptingService.emit('prompt', testPrompt);
      }, 200);
    });
  });
});
