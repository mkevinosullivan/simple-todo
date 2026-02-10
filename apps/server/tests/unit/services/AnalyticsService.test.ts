import type { PromptEvent } from '@simple-todo/shared/types';

import { AnalyticsService } from '../../../src/services/AnalyticsService.js';
import { DataService } from '../../../src/services/DataService.js';
import { TaskService } from '../../../src/services/TaskService.js';
import { createTestTask } from '../../helpers/factories.js';

// Mock TaskService and DataService
jest.mock('../../../src/services/TaskService.js');
jest.mock('../../../src/services/DataService.js');

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockTaskService: jest.Mocked<TaskService>;
  let mockDataService: jest.Mocked<DataService>;

  beforeEach(() => {
    // Create mocked service instances
    mockTaskService = new TaskService({} as never) as jest.Mocked<TaskService>;
    mockDataService = new DataService() as jest.Mocked<DataService>;
    analyticsService = new AnalyticsService(mockTaskService, mockDataService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getCompletionRate', () => {
    it('should return 0 when no tasks exist', async () => {
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue([]);

      const rate = await analyticsService.getCompletionRate();

      expect(rate).toBe(0);
    });

    it('should return 0 when total tasks > 0 but no completed tasks', async () => {
      const tasks = [
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const rate = await analyticsService.getCompletionRate();

      expect(rate).toBe(0);
    });

    it('should return 100 when all tasks are completed', async () => {
      const tasks = [
        createTestTask({ status: 'completed', completedAt: '2026-01-20T10:00:00.000Z' }),
        createTestTask({ status: 'completed', completedAt: '2026-01-21T10:00:00.000Z' }),
        createTestTask({ status: 'completed', completedAt: '2026-01-22T10:00:00.000Z' }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const rate = await analyticsService.getCompletionRate();

      expect(rate).toBe(100);
    });

    it('should calculate correct percentage for mixed dataset', async () => {
      const tasks = [
        createTestTask({ status: 'completed', completedAt: '2026-01-20T10:00:00.000Z' }),
        createTestTask({ status: 'completed', completedAt: '2026-01-21T10:00:00.000Z' }),
        createTestTask({ status: 'completed', completedAt: '2026-01-22T10:00:00.000Z' }),
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const rate = await analyticsService.getCompletionRate();

      // 3 completed out of 7 total = 42.857...%
      expect(rate).toBeCloseTo(42.857, 2);
    });
  });

  describe('getAverageTaskLifetime', () => {
    it('should return null when no tasks exist', async () => {
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue([]);

      const avgLifetime = await analyticsService.getAverageTaskLifetime();

      expect(avgLifetime).toBeNull();
    });

    it('should return null when no completed tasks (all active)', async () => {
      const tasks = [
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const avgLifetime = await analyticsService.getAverageTaskLifetime();

      expect(avgLifetime).toBeNull();
    });

    it('should return correct average for single completed task', async () => {
      const tasks = [
        createTestTask({
          status: 'completed',
          createdAt: '2026-01-20T10:00:00.000Z',
          completedAt: '2026-01-21T15:30:00.000Z',
        }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const avgLifetime = await analyticsService.getAverageTaskLifetime();

      // Duration: 29.5 hours = 106,200,000 milliseconds
      const expectedDuration = 29.5 * 60 * 60 * 1000;
      expect(avgLifetime).toBe(expectedDuration);
    });

    it('should return correct average for multiple completed tasks with varying durations', async () => {
      const tasks = [
        createTestTask({
          status: 'completed',
          createdAt: '2026-01-20T10:00:00.000Z',
          completedAt: '2026-01-20T12:00:00.000Z', // 2 hours
        }),
        createTestTask({
          status: 'completed',
          createdAt: '2026-01-21T10:00:00.000Z',
          completedAt: '2026-01-21T14:00:00.000Z', // 4 hours
        }),
        createTestTask({
          status: 'completed',
          createdAt: '2026-01-22T10:00:00.000Z',
          completedAt: '2026-01-22T16:00:00.000Z', // 6 hours
        }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const avgLifetime = await analyticsService.getAverageTaskLifetime();

      // Average: (2 + 4 + 6) / 3 = 4 hours = 14,400,000 milliseconds
      const expectedDuration = 4 * 60 * 60 * 1000;
      expect(avgLifetime).toBe(expectedDuration);
    });

    it('should ignore active tasks when calculating average', async () => {
      const tasks = [
        createTestTask({
          status: 'completed',
          createdAt: '2026-01-20T10:00:00.000Z',
          completedAt: '2026-01-20T12:00:00.000Z', // 2 hours
        }),
        createTestTask({ status: 'active' }), // Should be ignored
        createTestTask({
          status: 'completed',
          createdAt: '2026-01-21T10:00:00.000Z',
          completedAt: '2026-01-21T14:00:00.000Z', // 4 hours
        }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const avgLifetime = await analyticsService.getAverageTaskLifetime();

      // Average: (2 + 4) / 2 = 3 hours = 10,800,000 milliseconds
      const expectedDuration = 3 * 60 * 60 * 1000;
      expect(avgLifetime).toBe(expectedDuration);
    });
  });

  describe('getTaskCountByStatus', () => {
    it('should return {active: 0, completed: 0} when no tasks exist', async () => {
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue([]);

      const counts = await analyticsService.getTaskCountByStatus();

      expect(counts).toEqual({ active: 0, completed: 0 });
    });

    it('should return correct counts for all active tasks', async () => {
      const tasks = [
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const counts = await analyticsService.getTaskCountByStatus();

      expect(counts).toEqual({ active: 3, completed: 0 });
    });

    it('should return correct counts for all completed tasks', async () => {
      const tasks = [
        createTestTask({ status: 'completed', completedAt: '2026-01-20T10:00:00.000Z' }),
        createTestTask({ status: 'completed', completedAt: '2026-01-21T10:00:00.000Z' }),
        createTestTask({ status: 'completed', completedAt: '2026-01-22T10:00:00.000Z' }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const counts = await analyticsService.getTaskCountByStatus();

      expect(counts).toEqual({ active: 0, completed: 3 });
    });

    it('should return correct counts for mixed dataset', async () => {
      const tasks = [
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'completed', completedAt: '2026-01-20T10:00:00.000Z' }),
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'completed', completedAt: '2026-01-21T10:00:00.000Z' }),
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'completed', completedAt: '2026-01-22T10:00:00.000Z' }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const counts = await analyticsService.getTaskCountByStatus();

      expect(counts).toEqual({ active: 4, completed: 3 });
    });
  });

  describe('getOldestActiveTask', () => {
    it('should return null when no tasks exist', async () => {
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue([]);

      const oldest = await analyticsService.getOldestActiveTask();

      expect(oldest).toBeNull();
    });

    it('should return null when all tasks are completed (no active)', async () => {
      const tasks = [
        createTestTask({ status: 'completed', completedAt: '2026-01-20T10:00:00.000Z' }),
        createTestTask({ status: 'completed', completedAt: '2026-01-21T10:00:00.000Z' }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const oldest = await analyticsService.getOldestActiveTask();

      expect(oldest).toBeNull();
    });

    it('should return correct task when only one active task exists', async () => {
      const activeTask = createTestTask({
        status: 'active',
        text: 'Only active task',
        createdAt: '2026-01-20T10:00:00.000Z',
      });
      const tasks = [activeTask];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const oldest = await analyticsService.getOldestActiveTask();

      expect(oldest).toEqual(activeTask);
    });

    it('should return oldest task when multiple active tasks exist', async () => {
      const oldestTask = createTestTask({
        status: 'active',
        text: 'Oldest task',
        createdAt: '2026-01-15T10:00:00.000Z',
      });
      const tasks = [
        createTestTask({
          status: 'active',
          text: 'Newer task',
          createdAt: '2026-01-20T10:00:00.000Z',
        }),
        oldestTask,
        createTestTask({
          status: 'active',
          text: 'Newest task',
          createdAt: '2026-01-25T10:00:00.000Z',
        }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const oldest = await analyticsService.getOldestActiveTask();

      expect(oldest).toEqual(oldestTask);
    });

    it('should ignore completed tasks when finding oldest', async () => {
      const oldestActiveTask = createTestTask({
        status: 'active',
        text: 'Oldest active task',
        createdAt: '2026-01-20T10:00:00.000Z',
      });
      const tasks = [
        createTestTask({
          status: 'completed',
          text: 'Older but completed',
          createdAt: '2026-01-10T10:00:00.000Z', // Older, but completed
          completedAt: '2026-01-11T10:00:00.000Z',
        }),
        oldestActiveTask,
        createTestTask({
          status: 'active',
          text: 'Newer active task',
          createdAt: '2026-01-25T10:00:00.000Z',
        }),
      ];
      mockTaskService.getAllTasks = jest.fn().mockResolvedValue(tasks);

      const oldest = await analyticsService.getOldestActiveTask();

      expect(oldest).toEqual(oldestActiveTask);
    });
  });

  describe('getPromptResponseRate', () => {
    it('should return 0 when no prompt events exist', async () => {
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue([]);

      const rate = await analyticsService.getPromptResponseRate();

      expect(rate).toBe(0);
    });

    it('should return 0 when all prompts timed out', async () => {
      const events: PromptEvent[] = [
        {
          promptId: '1',
          taskId: 'task-1',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'timeout',
          respondedAt: null,
        },
        {
          promptId: '2',
          taskId: 'task-2',
          promptedAt: '2026-01-20T10:05:00.000Z',
          response: 'timeout',
          respondedAt: null,
        },
      ];
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue(events);

      const rate = await analyticsService.getPromptResponseRate();

      expect(rate).toBe(0);
    });

    it('should calculate correct percentage for 40% response rate', async () => {
      const events: PromptEvent[] = [
        // 40 engaged prompts
        ...Array.from({ length: 12 }, (_, i) => ({
          promptId: `complete-${i}`,
          taskId: `task-${i}`,
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'complete' as const,
          respondedAt: '2026-01-20T10:01:00.000Z',
        })),
        ...Array.from({ length: 18 }, (_, i) => ({
          promptId: `dismiss-${i}`,
          taskId: `task-dismiss-${i}`,
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'dismiss' as const,
          respondedAt: '2026-01-20T10:01:00.000Z',
        })),
        ...Array.from({ length: 10 }, (_, i) => ({
          promptId: `snooze-${i}`,
          taskId: `task-snooze-${i}`,
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'snooze' as const,
          respondedAt: '2026-01-20T10:01:00.000Z',
        })),
        // 60 timeout prompts
        ...Array.from({ length: 60 }, (_, i) => ({
          promptId: `timeout-${i}`,
          taskId: `task-timeout-${i}`,
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'timeout' as const,
          respondedAt: null,
        })),
      ];
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue(events);

      const rate = await analyticsService.getPromptResponseRate();

      // 40 engaged out of 100 total = 40%
      expect(rate).toBe(40);
    });

    it('should exclude timeout from engagement calculation', async () => {
      const events: PromptEvent[] = [
        {
          promptId: '1',
          taskId: 'task-1',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'complete',
          respondedAt: '2026-01-20T10:01:00.000Z',
        },
        {
          promptId: '2',
          taskId: 'task-2',
          promptedAt: '2026-01-20T10:05:00.000Z',
          response: 'timeout',
          respondedAt: null,
        },
      ];
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue(events);

      const rate = await analyticsService.getPromptResponseRate();

      // 1 engaged out of 2 total = 50%
      expect(rate).toBe(50);
    });
  });

  describe('getPromptResponseBreakdown', () => {
    it('should return all zeros when no prompt events exist', async () => {
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue([]);

      const breakdown = await analyticsService.getPromptResponseBreakdown();

      expect(breakdown).toEqual({
        complete: 0,
        dismiss: 0,
        snooze: 0,
        timeout: 0,
      });
    });

    it('should return correct counts for each response type', async () => {
      const events: PromptEvent[] = [
        {
          promptId: '1',
          taskId: 'task-1',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'complete',
          respondedAt: '2026-01-20T10:01:00.000Z',
        },
        {
          promptId: '2',
          taskId: 'task-2',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'complete',
          respondedAt: '2026-01-20T10:01:00.000Z',
        },
        {
          promptId: '3',
          taskId: 'task-3',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'dismiss',
          respondedAt: '2026-01-20T10:01:00.000Z',
        },
        {
          promptId: '4',
          taskId: 'task-4',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'snooze',
          respondedAt: '2026-01-20T10:01:00.000Z',
        },
        {
          promptId: '5',
          taskId: 'task-5',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'snooze',
          respondedAt: '2026-01-20T10:01:00.000Z',
        },
        {
          promptId: '6',
          taskId: 'task-6',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'snooze',
          respondedAt: '2026-01-20T10:01:00.000Z',
        },
        {
          promptId: '7',
          taskId: 'task-7',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'timeout',
          respondedAt: null,
        },
      ];
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue(events);

      const breakdown = await analyticsService.getPromptResponseBreakdown();

      expect(breakdown).toEqual({
        complete: 2,
        dismiss: 1,
        snooze: 3,
        timeout: 1,
      });
    });
  });

  describe('getAverageResponseTime', () => {
    it('should return 0 when no prompt events exist', async () => {
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue([]);

      const avgTime = await analyticsService.getAverageResponseTime();

      expect(avgTime).toBe(0);
    });

    it('should return 0 when no engaged prompts (all timeouts)', async () => {
      const events: PromptEvent[] = [
        {
          promptId: '1',
          taskId: 'task-1',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'timeout',
          respondedAt: null,
        },
        {
          promptId: '2',
          taskId: 'task-2',
          promptedAt: '2026-01-20T10:05:00.000Z',
          response: 'timeout',
          respondedAt: null,
        },
      ];
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue(events);

      const avgTime = await analyticsService.getAverageResponseTime();

      expect(avgTime).toBe(0);
    });

    it('should calculate correct average for single engaged prompt', async () => {
      const events: PromptEvent[] = [
        {
          promptId: '1',
          taskId: 'task-1',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'complete',
          respondedAt: '2026-01-20T10:00:05.420Z', // 5.42 seconds later
        },
      ];
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue(events);

      const avgTime = await analyticsService.getAverageResponseTime();

      // 5420 milliseconds
      expect(avgTime).toBe(5420);
    });

    it('should calculate correct average for multiple engaged prompts', async () => {
      const events: PromptEvent[] = [
        {
          promptId: '1',
          taskId: 'task-1',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'complete',
          respondedAt: '2026-01-20T10:00:02.000Z', // 2 seconds
        },
        {
          promptId: '2',
          taskId: 'task-2',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'dismiss',
          respondedAt: '2026-01-20T10:00:04.000Z', // 4 seconds
        },
        {
          promptId: '3',
          taskId: 'task-3',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'snooze',
          respondedAt: '2026-01-20T10:00:06.000Z', // 6 seconds
        },
      ];
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue(events);

      const avgTime = await analyticsService.getAverageResponseTime();

      // Average: (2000 + 4000 + 6000) / 3 = 4000 milliseconds
      expect(avgTime).toBe(4000);
    });

    it('should exclude timeout prompts from average calculation', async () => {
      const events: PromptEvent[] = [
        {
          promptId: '1',
          taskId: 'task-1',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'complete',
          respondedAt: '2026-01-20T10:00:02.000Z', // 2 seconds
        },
        {
          promptId: '2',
          taskId: 'task-2',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'timeout',
          respondedAt: null, // Should be excluded
        },
        {
          promptId: '3',
          taskId: 'task-3',
          promptedAt: '2026-01-20T10:00:00.000Z',
          response: 'dismiss',
          respondedAt: '2026-01-20T10:00:04.000Z', // 4 seconds
        },
      ];
      mockDataService.loadPromptEvents = jest.fn().mockResolvedValue(events);

      const avgTime = await analyticsService.getAverageResponseTime();

      // Average: (2000 + 4000) / 2 = 3000 milliseconds (timeout excluded)
      expect(avgTime).toBe(3000);
    });
  });
});
