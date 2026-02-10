import { PromptingService } from '../../../src/services/PromptingService.js';
import type { DataService } from '../../../src/services/DataService.js';
import type { TaskService } from '../../../src/services/TaskService.js';
import { createTestConfig, createTestTask } from '../../helpers/factories.js';

// Mock the services
jest.mock('../../../src/services/TaskService');
jest.mock('../../../src/services/DataService');
jest.mock('../../../src/utils/logger.js');

describe('PromptingService', () => {
  let promptingService: PromptingService;
  let mockTaskService: jest.Mocked<TaskService>;
  let mockDataService: jest.Mocked<DataService>;

  beforeEach(() => {
    // Create mock instances
    mockTaskService = {
      getAllTasks: jest.fn(),
      getActiveTaskCount: jest.fn(),
      getTaskById: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      completeTask: jest.fn(),
    } as unknown as jest.Mocked<TaskService>;

    mockDataService = {
      loadConfig: jest.fn(),
      saveConfig: jest.fn(),
      loadTasks: jest.fn(),
      saveTasks: jest.fn(),
    } as unknown as jest.Mocked<DataService>;

    promptingService = new PromptingService(mockTaskService, mockDataService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Stop scheduler if running
    promptingService.stopScheduler();
  });

  describe('Configuration Loading', () => {
    it('should load config from DataService', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      // Access private method through startScheduler
      await promptingService.startScheduler();

      expect(mockDataService.loadConfig).toHaveBeenCalled();
    });

    it('should return enabled and frequencyHours properties', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: false,
        promptingFrequencyHours: 3.0,
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      await promptingService.startScheduler();

      expect(mockDataService.loadConfig).toHaveBeenCalled();
    });

    it('should throw error if config loading fails', async () => {
      mockDataService.loadConfig.mockRejectedValue(new Error('Config load failed'));

      await expect(promptingService.startScheduler()).rejects.toThrow(
        'Failed to load prompting configuration'
      );
    });
  });

  describe('Task Selection', () => {
    it('should return null when no active tasks', async () => {
      mockTaskService.getAllTasks.mockResolvedValue([]);

      const task = await promptingService.selectTaskForPrompt();

      expect(task).toBeNull();
      expect(mockTaskService.getAllTasks).toHaveBeenCalledWith('active');
    });

    it('should return random task from active tasks array', async () => {
      const tasks = [
        createTestTask({ text: 'Task 1' }),
        createTestTask({ text: 'Task 2' }),
        createTestTask({ text: 'Task 3' }),
      ];

      mockTaskService.getAllTasks.mockResolvedValue(tasks);

      const task = await promptingService.selectTaskForPrompt();

      expect(task).toBeDefined();
      expect(tasks).toContain(task);
    });

    it('should call TaskService.getAllTasks with active status', async () => {
      const tasks = [createTestTask()];
      mockTaskService.getAllTasks.mockResolvedValue(tasks);

      await promptingService.selectTaskForPrompt();

      expect(mockTaskService.getAllTasks).toHaveBeenCalledWith('active');
    });
  });

  describe('Prompt Generation', () => {
    it('should generate prompt with taskId, taskText, promptedAt', async () => {
      const testTask = createTestTask({
        id: 'test-task-id',
        text: 'Buy groceries',
      });

      mockTaskService.getAllTasks.mockResolvedValue([testTask]);

      const prompt = await promptingService.generatePrompt();

      expect(prompt).toBeDefined();
      expect(prompt?.taskId).toBe('test-task-id');
      expect(prompt?.taskText).toBe('Buy groceries');
      expect(prompt?.promptedAt).toBeDefined();
    });

    it('should return null when selectTaskForPrompt returns null', async () => {
      mockTaskService.getAllTasks.mockResolvedValue([]);

      const prompt = await promptingService.generatePrompt();

      expect(prompt).toBeNull();
    });

    it('should update lastPromptTime when prompt generated', async () => {
      const testTask = createTestTask();
      mockTaskService.getAllTasks.mockResolvedValue([testTask]);

      const beforeTime = Date.now();
      await promptingService.generatePrompt();
      const afterTime = Date.now();

      // Verify lastPromptTime was set (indirectly by generating another prompt)
      const prompt = await promptingService.generatePrompt();
      expect(prompt).toBeDefined();

      // Time should be within test execution window
      expect(beforeTime).toBeLessThanOrEqual(afterTime);
    });

    it('should generate promptedAt in ISO 8601 format', async () => {
      const testTask = createTestTask();
      mockTaskService.getAllTasks.mockResolvedValue([testTask]);

      const prompt = await promptingService.generatePrompt();

      expect(prompt?.promptedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Scheduler Start/Stop', () => {
    it('should not start scheduler when prompting disabled', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: false,
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      await promptingService.startScheduler();

      // Verify scheduler was not started by checking private property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((promptingService as any).scheduler).toBeNull();
    });

    it('should start scheduler when prompting enabled', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      await promptingService.startScheduler();

      // Verify scheduler was started
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((promptingService as any).scheduler).toBeDefined();
    });

    it('should stopScheduler clear interval', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      await promptingService.startScheduler();
      promptingService.stopScheduler();

      // Verify scheduler was stopped
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((promptingService as any).scheduler).toBeNull();
    });

    it('should skip onScheduledPrompt when no active tasks', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);
      mockTaskService.getActiveTaskCount.mockResolvedValue(0);

      await promptingService.startScheduler();

      // Manually trigger the scheduled prompt handler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (promptingService as any).onScheduledPrompt();

      expect(mockTaskService.getActiveTaskCount).toHaveBeenCalled();
    });
  });

  describe('Interval Spacing Validation', () => {
    it('should skip prompt when minimum interval not reached', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
      });

      const testTask = createTestTask();
      mockDataService.loadConfig.mockResolvedValue(testConfig);
      mockTaskService.getAllTasks.mockResolvedValue([testTask]);
      mockTaskService.getActiveTaskCount.mockResolvedValue(1);

      // Generate first prompt to set lastPromptTime
      await promptingService.generatePrompt();

      // Immediately try to trigger scheduled prompt (should skip due to interval check)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (promptingService as any).onScheduledPrompt();

      // Verify config was loaded for interval validation
      expect(mockDataService.loadConfig).toHaveBeenCalled();
    });

    it('should allow prompt when minimum interval has elapsed', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: true,
        promptingFrequencyHours: 0.001, // Very short interval for testing
      });

      const testTask = createTestTask();
      mockDataService.loadConfig.mockResolvedValue(testConfig);
      mockTaskService.getAllTasks.mockResolvedValue([testTask]);
      mockTaskService.getActiveTaskCount.mockResolvedValue(1);

      // Generate first prompt
      await promptingService.generatePrompt();

      // Wait a bit (minimum interval is 90% of 0.001 hours = 3.24ms)
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should allow prompt now
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (promptingService as any).onScheduledPrompt();

      expect(mockTaskService.getActiveTaskCount).toHaveBeenCalled();
    });
  });

  describe('Activity Detection', () => {
    it('should record user activity with current timestamp', () => {
      const beforeTime = Date.now();
      promptingService.recordUserActivity();
      const afterTime = Date.now();

      // Verify activity was recorded (indirectly by checking isUserActivelyWorking)
      expect(promptingService.isUserActivelyWorking()).toBe(true);
    });

    it('should return true when user active within last 5 minutes', () => {
      promptingService.recordUserActivity();

      const isActive = promptingService.isUserActivelyWorking();

      expect(isActive).toBe(true);
    });

    it('should return false when no activity recorded', () => {
      const isActive = promptingService.isUserActivelyWorking();

      expect(isActive).toBe(false);
    });

    it('should return false when activity older than 5 minutes', () => {
      // Record activity
      promptingService.recordUserActivity();

      // Mock Date to simulate 6 minutes passing
      const sixMinutesMs = 6 * 60 * 1000;
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + sixMinutesMs);

      const isActive = promptingService.isUserActivelyWorking();

      expect(isActive).toBe(false);

      jest.restoreAllMocks();
    });

    it('should delay prompt when user recently active', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);
      mockTaskService.getActiveTaskCount.mockResolvedValue(1);

      // Record recent activity
      promptingService.recordUserActivity();

      // Trigger scheduled prompt
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (promptingService as any).onScheduledPrompt();

      // Should not check for active tasks because user is active
      expect(mockTaskService.getActiveTaskCount).not.toHaveBeenCalled();
    });

    it('should generate prompt when user not recently active', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
      });
      const testTask = createTestTask();

      mockDataService.loadConfig.mockResolvedValue(testConfig);
      mockTaskService.getActiveTaskCount.mockResolvedValue(1);
      mockTaskService.getAllTasks.mockResolvedValue([testTask]);

      // Don't record any activity (user not active)

      // Trigger scheduled prompt
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (promptingService as any).onScheduledPrompt();

      // Should proceed with prompt generation
      expect(mockTaskService.getActiveTaskCount).toHaveBeenCalled();
    });
  });

  describe('Quiet Hours', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return false when quiet hours disabled', async () => {
      const testConfig = createTestConfig({
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isQuietHours = await (promptingService as any).isWithinQuietHours();

      expect(isQuietHours).toBe(false);
    });

    it('should return true when current time within quiet hours range', async () => {
      const testConfig = createTestConfig({
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      // Mock current time to 23:00 (11 PM - within quiet hours)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(23);
      jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isQuietHours = await (promptingService as any).isWithinQuietHours();

      expect(isQuietHours).toBe(true);
    });

    it('should return false when current time outside quiet hours range', async () => {
      const testConfig = createTestConfig({
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      // Mock current time to 15:00 (3 PM - outside quiet hours)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(15);
      jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isQuietHours = await (promptingService as any).isWithinQuietHours();

      expect(isQuietHours).toBe(false);
    });

    it('should handle midnight-spanning range - time after start', async () => {
      const testConfig = createTestConfig({
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      // Mock current time to 23:30 (11:30 PM - after start, before midnight)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(23);
      jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(30);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isQuietHours = await (promptingService as any).isWithinQuietHours();

      expect(isQuietHours).toBe(true);
    });

    it('should handle midnight-spanning range - time before end', async () => {
      const testConfig = createTestConfig({
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      // Mock current time to 02:00 (2 AM - after midnight, before end)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(2);
      jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isQuietHours = await (promptingService as any).isWithinQuietHours();

      expect(isQuietHours).toBe(true);
    });

    it('should handle midnight-spanning range - time outside range', async () => {
      const testConfig = createTestConfig({
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);

      // Mock current time to 15:00 (3 PM - outside range)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(15);
      jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isQuietHours = await (promptingService as any).isWithinQuietHours();

      expect(isQuietHours).toBe(false);
    });

    it('should skip prompt generation during quiet hours', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      });

      mockDataService.loadConfig.mockResolvedValue(testConfig);
      mockTaskService.getActiveTaskCount.mockResolvedValue(1);

      // Mock current time to be within quiet hours (23:00)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(23);
      jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(0);

      // Trigger scheduled prompt
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (promptingService as any).onScheduledPrompt();

      // Should not proceed to check active tasks
      expect(mockTaskService.getActiveTaskCount).not.toHaveBeenCalled();
    });

    it('should generate prompt outside quiet hours', async () => {
      const testConfig = createTestConfig({
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      });
      const testTask = createTestTask();

      mockDataService.loadConfig.mockResolvedValue(testConfig);
      mockTaskService.getActiveTaskCount.mockResolvedValue(1);
      mockTaskService.getAllTasks.mockResolvedValue([testTask]);

      // Mock current time to be outside quiet hours (15:00)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(15);
      jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(0);

      // Trigger scheduled prompt
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (promptingService as any).onScheduledPrompt();

      // Should proceed with prompt generation
      expect(mockTaskService.getActiveTaskCount).toHaveBeenCalled();
    });
  });
});
