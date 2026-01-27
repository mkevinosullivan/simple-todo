/* eslint-disable @typescript-eslint/unbound-method */
import { DEFAULT_CONFIG } from '@simple-todo/shared/types';

import { DataService } from '../../../src/services/DataService.js';
import { TaskService } from '../../../src/services/TaskService.js';
import { WIPLimitService } from '../../../src/services/WIPLimitService.js';
import { createTestConfig } from '../../helpers/factories.js';

jest.mock('../../../src/services/TaskService');
jest.mock('../../../src/services/DataService');

describe('WIPLimitService', () => {
  let wipLimitService: WIPLimitService;
  let mockTaskService: jest.Mocked<TaskService>;
  let mockDataService: jest.Mocked<DataService>;

  beforeEach(() => {
    // Create mocked instances
    mockTaskService = new TaskService({} as DataService) as jest.Mocked<TaskService>;
    mockDataService = new DataService() as jest.Mocked<DataService>;

    // Create service with mocked dependencies
    wipLimitService = new WIPLimitService(mockTaskService, mockDataService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getWIPLimit', () => {
    it('should return limit from config', async () => {
      mockDataService.loadConfig.mockResolvedValue(createTestConfig({ wipLimit: 7 }));

      const result = await wipLimitService.getWIPLimit();

      expect(result).toBe(7);
      expect(mockDataService.loadConfig).toHaveBeenCalledTimes(1);
    });

    it('should return default limit when config uses default', async () => {
      mockDataService.loadConfig.mockResolvedValue(DEFAULT_CONFIG);

      const result = await wipLimitService.getWIPLimit();

      expect(result).toBe(7); // DEFAULT_CONFIG.wipLimit
    });

    it('should handle config read errors', async () => {
      mockDataService.loadConfig.mockRejectedValue(new Error('File system error'));

      await expect(wipLimitService.getWIPLimit()).rejects.toThrow('File system error');
    });
  });

  describe('setWIPLimit', () => {
    it('should accept valid limit of 5', async () => {
      const config = createTestConfig({ wipLimit: 7 });
      mockDataService.loadConfig.mockResolvedValue(config);
      mockDataService.saveConfig.mockResolvedValue();

      await wipLimitService.setWIPLimit(5);

      expect(mockDataService.saveConfig).toHaveBeenCalledWith(
        expect.objectContaining({ wipLimit: 5 })
      );
    });

    it('should accept valid limit of 7', async () => {
      const config = createTestConfig({ wipLimit: 5 });
      mockDataService.loadConfig.mockResolvedValue(config);
      mockDataService.saveConfig.mockResolvedValue();

      await wipLimitService.setWIPLimit(7);

      expect(mockDataService.saveConfig).toHaveBeenCalledWith(
        expect.objectContaining({ wipLimit: 7 })
      );
    });

    it('should accept valid limit of 10', async () => {
      const config = createTestConfig({ wipLimit: 7 });
      mockDataService.loadConfig.mockResolvedValue(config);
      mockDataService.saveConfig.mockResolvedValue();

      await wipLimitService.setWIPLimit(10);

      expect(mockDataService.saveConfig).toHaveBeenCalledWith(
        expect.objectContaining({ wipLimit: 10 })
      );
    });

    it('should reject limit below 5', async () => {
      await expect(wipLimitService.setWIPLimit(4)).rejects.toThrow(
        'WIP limit must be between 5 and 10'
      );

      expect(mockDataService.saveConfig).not.toHaveBeenCalled();
    });

    it('should reject limit above 10', async () => {
      await expect(wipLimitService.setWIPLimit(11)).rejects.toThrow(
        'WIP limit must be between 5 and 10'
      );

      expect(mockDataService.saveConfig).not.toHaveBeenCalled();
    });

    it('should reject limit of 0', async () => {
      await expect(wipLimitService.setWIPLimit(0)).rejects.toThrow(
        'WIP limit must be between 5 and 10'
      );
    });

    it('should reject negative limit', async () => {
      await expect(wipLimitService.setWIPLimit(-1)).rejects.toThrow(
        'WIP limit must be between 5 and 10'
      );
    });

    it('should reject non-number input (NaN)', async () => {
      await expect(wipLimitService.setWIPLimit(NaN)).rejects.toThrow('WIP limit must be a number');
    });

    it('should persist valid limit to config', async () => {
      const config = createTestConfig({ wipLimit: 7 });
      mockDataService.loadConfig.mockResolvedValue(config);
      mockDataService.saveConfig.mockResolvedValue();

      await wipLimitService.setWIPLimit(8);

      expect(mockDataService.loadConfig).toHaveBeenCalledTimes(1);
      expect(mockDataService.saveConfig).toHaveBeenCalledWith(
        expect.objectContaining({ wipLimit: 8 })
      );
    });

    it('should handle config write errors', async () => {
      const config = createTestConfig({ wipLimit: 7 });
      mockDataService.loadConfig.mockResolvedValue(config);
      mockDataService.saveConfig.mockRejectedValue(new Error('Failed to save config'));

      await expect(wipLimitService.setWIPLimit(8)).rejects.toThrow('Failed to save config');
    });
  });

  describe('getCurrentWIPCount', () => {
    it('should return count of active tasks', async () => {
      mockTaskService.getActiveTaskCount.mockResolvedValue(5);

      const result = await wipLimitService.getCurrentWIPCount();

      expect(result).toBe(5);
      expect(mockTaskService.getActiveTaskCount).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when no active tasks', async () => {
      mockTaskService.getActiveTaskCount.mockResolvedValue(0);

      const result = await wipLimitService.getCurrentWIPCount();

      expect(result).toBe(0);
    });

    it('should handle task service errors', async () => {
      mockTaskService.getActiveTaskCount.mockRejectedValue(
        new Error('Failed to get active task count')
      );

      await expect(wipLimitService.getCurrentWIPCount()).rejects.toThrow(
        'Failed to get active task count'
      );
    });
  });

  describe('canAddTask', () => {
    it('should return true when count < limit', async () => {
      mockDataService.loadConfig.mockResolvedValue(createTestConfig({ wipLimit: 7 }));
      mockTaskService.getActiveTaskCount.mockResolvedValue(5);

      const result = await wipLimitService.canAddTask();

      expect(result).toBe(true);
    });

    it('should return false when count >= limit', async () => {
      mockDataService.loadConfig.mockResolvedValue(createTestConfig({ wipLimit: 7 }));
      mockTaskService.getActiveTaskCount.mockResolvedValue(7);

      const result = await wipLimitService.canAddTask();

      expect(result).toBe(false);
    });

    it('should return false when count > limit', async () => {
      mockDataService.loadConfig.mockResolvedValue(createTestConfig({ wipLimit: 7 }));
      mockTaskService.getActiveTaskCount.mockResolvedValue(8);

      const result = await wipLimitService.canAddTask();

      expect(result).toBe(false);
    });

    it('should return true at exact threshold: count = limit - 1', async () => {
      mockDataService.loadConfig.mockResolvedValue(createTestConfig({ wipLimit: 7 }));
      mockTaskService.getActiveTaskCount.mockResolvedValue(6);

      const result = await wipLimitService.canAddTask();

      expect(result).toBe(true);
    });

    it('should return false at exact threshold: count = limit', async () => {
      mockDataService.loadConfig.mockResolvedValue(createTestConfig({ wipLimit: 7 }));
      mockTaskService.getActiveTaskCount.mockResolvedValue(7);

      const result = await wipLimitService.canAddTask();

      expect(result).toBe(false);
    });

    it('should return true when no active tasks', async () => {
      mockDataService.loadConfig.mockResolvedValue(createTestConfig({ wipLimit: 7 }));
      mockTaskService.getActiveTaskCount.mockResolvedValue(0);

      const result = await wipLimitService.canAddTask();

      expect(result).toBe(true);
    });
  });

  describe('getWIPLimitMessage', () => {
    it('should include current count in message', async () => {
      mockTaskService.getActiveTaskCount.mockResolvedValue(7);

      const result = await wipLimitService.getWIPLimitMessage();

      expect(result).toContain('7');
      expect(result).toContain('active tasks');
    });

    it('should match expected message format', async () => {
      mockTaskService.getActiveTaskCount.mockResolvedValue(5);

      const result = await wipLimitService.getWIPLimitMessage();

      expect(result).toBe(
        'You have 5 active tasks - complete one before adding more to maintain focus!'
      );
    });

    it('should handle count of 0', async () => {
      mockTaskService.getActiveTaskCount.mockResolvedValue(0);

      const result = await wipLimitService.getWIPLimitMessage();

      expect(result).toContain('0');
    });

    it('should handle large count', async () => {
      mockTaskService.getActiveTaskCount.mockResolvedValue(10);

      const result = await wipLimitService.getWIPLimitMessage();

      expect(result).toContain('10');
    });

    it('should handle count query errors', async () => {
      mockTaskService.getActiveTaskCount.mockRejectedValue(
        new Error('Failed to get active task count')
      );

      await expect(wipLimitService.getWIPLimitMessage()).rejects.toThrow(
        'Failed to get active task count'
      );
    });
  });
});
