import { AnalyticsService } from '../../../src/services/AnalyticsService.js';
import { TaskService } from '../../../src/services/TaskService.js';
import { createTestTask } from '../../helpers/factories.js';

// Mock TaskService
jest.mock('../../../src/services/TaskService.js');

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockTaskService: jest.Mocked<TaskService>;

  beforeEach(() => {
    // Create mocked TaskService instance
    mockTaskService = new TaskService({} as never) as jest.Mocked<TaskService>;
    analyticsService = new AnalyticsService(mockTaskService);

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
});
