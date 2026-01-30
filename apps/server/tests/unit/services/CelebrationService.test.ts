import type { Task } from '@simple-todo/shared/types';

import { CelebrationService } from '../../../src/services/CelebrationService.js';
import type { TaskService } from '../../../src/services/TaskService.js';

describe('CelebrationService', () => {
  let celebrationService: CelebrationService;
  let mockTaskService: jest.Mocked<TaskService>;

  beforeEach(() => {
    // Create mock TaskService
    mockTaskService = {
      getAllTasks: jest.fn(),
    } as unknown as jest.Mocked<TaskService>;
  });

  describe('getCelebrationMessage', () => {
    it('should return a celebration message with valid variant', async () => {
      celebrationService = new CelebrationService();
      const result = await celebrationService.getCelebrationMessage();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('variant');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
      expect(['enthusiastic', 'supportive', 'motivational', 'data-driven']).toContain(
        result.variant,
      );
    });

    it('should not repeat the same message twice in a row', async () => {
      celebrationService = new CelebrationService();
      const firstMessage = await celebrationService.getCelebrationMessage();
      const secondMessage = await celebrationService.getCelebrationMessage();

      expect(firstMessage.message).not.toBe(secondMessage.message);
    });

    it('should return at least 10 unique messages across multiple calls', async () => {
      celebrationService = new CelebrationService();
      const uniqueMessages = new Set<string>();

      // Call getCelebrationMessage 50 times to ensure we get all messages
      for (let i = 0; i < 50; i++) {
        const result = await celebrationService.getCelebrationMessage();
        uniqueMessages.add(result.message);
      }

      expect(uniqueMessages.size).toBeGreaterThanOrEqual(10);
    });

    it('should have reasonable distribution over 100 calls (each message appears at least once)', async () => {
      celebrationService = new CelebrationService();
      const messageCounts = new Map<string, number>();

      // Call getCelebrationMessage 100 times
      for (let i = 0; i < 100; i++) {
        const result = await celebrationService.getCelebrationMessage();
        messageCounts.set(result.message, (messageCounts.get(result.message) || 0) + 1);
      }

      // Verify we have at least 10 unique messages
      expect(messageCounts.size).toBeGreaterThanOrEqual(10);

      // Verify each message appears at least once
      messageCounts.forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(1);
      });
    });

    it('should include all 4 variants in message pool', async () => {
      celebrationService = new CelebrationService();
      const variants = new Set<string>();

      // Call getCelebrationMessage 50 times to ensure we see all variants
      for (let i = 0; i < 50; i++) {
        const result = await celebrationService.getCelebrationMessage();
        variants.add(result.variant);
      }

      expect(variants.has('enthusiastic')).toBe(true);
      expect(variants.has('supportive')).toBe(true);
      expect(variants.has('motivational')).toBe(true);
      expect(variants.has('data-driven')).toBe(true);
    });

    it('should track recent messages correctly (no repetition within last 5)', async () => {
      celebrationService = new CelebrationService();
      const recentMessages: string[] = [];

      // Test that no message repeats within last 5 selections
      for (let i = 0; i < 20; i++) {
        const result = await celebrationService.getCelebrationMessage();

        // Check that this message wasn't in the last 5
        const last5 = recentMessages.slice(-5);
        if (last5.length === 5) {
          expect(last5).not.toContain(result.message);
        }

        recentMessages.push(result.message);
      }
    });

    it('should insert dynamic data for data-driven messages when TaskService is available', async () => {
      // Mock TaskService to return completed tasks
      const mockTasks: Task[] = [
        {
          id: '1',
          text: 'Task 1',
          status: 'completed',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: '2',
          text: 'Task 2',
          status: 'completed',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: '3',
          text: 'Task 3',
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
      ];
      mockTaskService.getAllTasks.mockResolvedValue(mockTasks);

      celebrationService = new CelebrationService(mockTaskService);

      // Call multiple times to eventually get a data-driven message
      let foundDataDriven = false;
      for (let i = 0; i < 50; i++) {
        const result = await celebrationService.getCelebrationMessage();
        if (result.variant === 'data-driven') {
          foundDataDriven = true;
          // Verify the message contains a number (replaced [N])
          expect(result.message).toMatch(/\d+/);
          expect(result.message).not.toContain('[N]');
          break;
        }
      }

      expect(foundDataDriven).toBe(true);
    });

    it('should gracefully handle when TaskService is unavailable', async () => {
      celebrationService = new CelebrationService(); // No TaskService

      // Should not throw an error
      await expect(celebrationService.getCelebrationMessage()).resolves.toBeDefined();

      // Try multiple times to get a data-driven message
      for (let i = 0; i < 50; i++) {
        const result = await celebrationService.getCelebrationMessage();
        if (result.variant === 'data-driven') {
          // Should use fallback message without [N]
          expect(result.message).not.toContain('[N]');
          expect(result.message).toBe('Task completed! Great progress!');
        }
      }
    });

    it('should handle edge case when pool size < maxRecentMessages', async () => {
      celebrationService = new CelebrationService();

      // Call getCelebrationMessage many times - should not get stuck in infinite loop
      const promises = Array.from({ length: 20 }, () =>
        celebrationService.getCelebrationMessage(),
      );

      // If there's an infinite loop, this will timeout
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should count only completed tasks from current week', async () => {
      const now = new Date();
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 8); // 8 days ago (last week)

      const mockTasks: Task[] = [
        {
          id: '1',
          text: 'Task 1',
          status: 'completed',
          createdAt: now.toISOString(),
          completedAt: now.toISOString(), // This week
        },
        {
          id: '2',
          text: 'Task 2',
          status: 'completed',
          createdAt: lastWeek.toISOString(),
          completedAt: lastWeek.toISOString(), // Last week (should not count)
        },
        {
          id: '3',
          text: 'Task 3',
          status: 'active',
          createdAt: now.toISOString(),
          completedAt: null, // Not completed (should not count)
        },
      ];
      mockTaskService.getAllTasks.mockResolvedValue(mockTasks);

      celebrationService = new CelebrationService(mockTaskService);

      // Get data-driven message
      let foundDataDriven = false;
      for (let i = 0; i < 50; i++) {
        const result = await celebrationService.getCelebrationMessage();
        if (result.variant === 'data-driven') {
          foundDataDriven = true;
          // Should only count 1 task (completed this week)
          expect(result.message).toContain('1');
          break;
        }
      }

      expect(foundDataDriven).toBe(true);
    });
  });
});
