/* eslint-disable @typescript-eslint/unbound-method */
import { DataService } from '../../../src/services/DataService';
import { TaskService } from '../../../src/services/TaskService';
import { createTestTask } from '../../helpers/factories';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
}));

// Mock DataService
jest.mock('../../../src/services/DataService');

describe('TaskService', () => {
  let taskService: TaskService;
  let mockDataService: jest.Mocked<DataService>;

  beforeEach(() => {
    // Create mock instance
    mockDataService = new DataService() as jest.Mocked<DataService>;
    taskService = new TaskService(mockDataService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create task with UUID, timestamps, and active status', async () => {
      mockDataService.loadTasks.mockResolvedValue([]);
      mockDataService.saveTasks.mockResolvedValue();

      const task = await taskService.createTask('Buy groceries');

      expect(task.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(task.text).toBe('Buy groceries');
      expect(task.status).toBe('active');
      expect(task.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
      expect(task.completedAt).toBeNull();
    });

    it('should save task to storage', async () => {
      mockDataService.loadTasks.mockResolvedValue([]);
      mockDataService.saveTasks.mockResolvedValue();

      await taskService.createTask('Buy groceries');

      expect(mockDataService.saveTasks).toHaveBeenCalledTimes(1);
      expect(mockDataService.saveTasks).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            text: 'Buy groceries',
            status: 'active',
          }),
        ])
      );
    });

    it('should throw error for empty text', async () => {
      await expect(taskService.createTask('')).rejects.toThrow(
        'Task text cannot be empty'
      );
    });

    it('should throw error for whitespace-only text', async () => {
      await expect(taskService.createTask('   ')).rejects.toThrow(
        'Task text cannot be empty'
      );
    });

    it('should throw error for text exceeding 500 characters', async () => {
      const longText = 'a'.repeat(501);
      await expect(taskService.createTask(longText)).rejects.toThrow(
        'Task text exceeds maximum length (500 characters)'
      );
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks when no filter provided', async () => {
      const tasks = [
        createTestTask({ text: 'Task 1', status: 'active' }),
        createTestTask({ text: 'Task 2', status: 'completed' }),
      ];
      mockDataService.loadTasks.mockResolvedValue(tasks);

      const result = await taskService.getAllTasks();

      expect(result).toEqual(tasks);
      expect(result).toHaveLength(2);
    });

    it('should return only active tasks when status="active"', async () => {
      const activeTask = createTestTask({ text: 'Active task', status: 'active' });
      const completedTask = createTestTask({
        text: 'Completed task',
        status: 'completed',
      });
      mockDataService.loadTasks.mockResolvedValue([activeTask, completedTask]);

      const result = await taskService.getAllTasks('active');

      expect(result).toEqual([activeTask]);
      expect(result).toHaveLength(1);
    });

    it('should return only completed tasks when status="completed"', async () => {
      const activeTask = createTestTask({ text: 'Active task', status: 'active' });
      const completedTask = createTestTask({
        text: 'Completed task',
        status: 'completed',
      });
      mockDataService.loadTasks.mockResolvedValue([activeTask, completedTask]);

      const result = await taskService.getAllTasks('completed');

      expect(result).toEqual([completedTask]);
      expect(result).toHaveLength(1);
    });
  });

  describe('getTaskById', () => {
    it('should return task when found', async () => {
      const task = createTestTask({ text: 'Find me' });
      mockDataService.loadTasks.mockResolvedValue([task]);

      const result = await taskService.getTaskById(task.id);

      expect(result).toEqual(task);
    });

    it('should return null when not found', async () => {
      mockDataService.loadTasks.mockResolvedValue([]);

      const result = await taskService.getTaskById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('should update task text successfully', async () => {
      const task = createTestTask({ text: 'Original text', status: 'active' });
      mockDataService.loadTasks.mockResolvedValue([task]);
      mockDataService.saveTasks.mockResolvedValue();

      const result = await taskService.updateTask(task.id, 'Updated text');

      expect(result.text).toBe('Updated text');
      expect(mockDataService.saveTasks).toHaveBeenCalledTimes(1);
    });

    it('should throw error for empty text', async () => {
      const task = createTestTask({ status: 'active' });
      mockDataService.loadTasks.mockResolvedValue([task]);

      await expect(taskService.updateTask(task.id, '')).rejects.toThrow(
        'Task text cannot be empty'
      );
    });

    it('should throw error for text exceeding 500 characters', async () => {
      const task = createTestTask({ status: 'active' });
      mockDataService.loadTasks.mockResolvedValue([task]);
      const longText = 'a'.repeat(501);

      await expect(taskService.updateTask(task.id, longText)).rejects.toThrow(
        'Task text exceeds maximum length (500 characters)'
      );
    });

    it('should throw error for invalid ID', async () => {
      mockDataService.loadTasks.mockResolvedValue([]);

      await expect(
        taskService.updateTask('nonexistent-id', 'New text')
      ).rejects.toThrow('Task not found');
    });

    it('should throw error for completed task', async () => {
      const task = createTestTask({ status: 'completed' });
      mockDataService.loadTasks.mockResolvedValue([task]);

      await expect(taskService.updateTask(task.id, 'New text')).rejects.toThrow(
        'Cannot update completed tasks'
      );
    });
  });

  describe('deleteTask', () => {
    it('should remove task successfully', async () => {
      const task1 = createTestTask({ text: 'Task 1' });
      const task2 = createTestTask({ text: 'Task 2' });
      mockDataService.loadTasks.mockResolvedValue([task1, task2]);
      mockDataService.saveTasks.mockResolvedValue();

      await taskService.deleteTask(task1.id);

      expect(mockDataService.saveTasks).toHaveBeenCalledTimes(1);
      expect(mockDataService.saveTasks).toHaveBeenCalledWith([task2]);
    });

    it('should throw error for invalid ID', async () => {
      mockDataService.loadTasks.mockResolvedValue([]);

      await expect(taskService.deleteTask('nonexistent-id')).rejects.toThrow(
        'Task not found'
      );
    });
  });

  describe('completeTask', () => {
    it('should set status to completed and add completedAt timestamp', async () => {
      const task = createTestTask({ status: 'active' });
      mockDataService.loadTasks.mockResolvedValue([task]);
      mockDataService.saveTasks.mockResolvedValue();

      const result = await taskService.completeTask(task.id);

      expect(result.status).toBe('completed');
      expect(result.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
      expect(mockDataService.saveTasks).toHaveBeenCalledTimes(1);
    });

    it('should throw error for invalid ID', async () => {
      mockDataService.loadTasks.mockResolvedValue([]);

      await expect(taskService.completeTask('nonexistent-id')).rejects.toThrow(
        'Task not found'
      );
    });

    it('should throw error for already completed task', async () => {
      const task = createTestTask({ status: 'completed' });
      mockDataService.loadTasks.mockResolvedValue([task]);

      await expect(taskService.completeTask(task.id)).rejects.toThrow(
        'Task is already completed'
      );
    });
  });

  describe('getActiveTaskCount', () => {
    it('should return correct count of active tasks', async () => {
      const tasks = [
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'completed' }),
      ];
      mockDataService.loadTasks.mockResolvedValue(tasks);

      const count = await taskService.getActiveTaskCount();

      expect(count).toBe(2);
    });

    it('should return 0 when no active tasks', async () => {
      const tasks = [createTestTask({ status: 'completed' })];
      mockDataService.loadTasks.mockResolvedValue(tasks);

      const count = await taskService.getActiveTaskCount();

      expect(count).toBe(0);
    });

    it('should exclude completed tasks from count', async () => {
      const tasks = [
        createTestTask({ status: 'active' }),
        createTestTask({ status: 'completed' }),
        createTestTask({ status: 'completed' }),
      ];
      mockDataService.loadTasks.mockResolvedValue(tasks);

      const count = await taskService.getActiveTaskCount();

      expect(count).toBe(1);
    });
  });
});
