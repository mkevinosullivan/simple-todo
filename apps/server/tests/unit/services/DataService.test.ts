import { promises as fs } from 'fs';
import path from 'path';

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { DataService } from '../../../src/services/DataService.js';
import { createTestTask } from '../../helpers/factories.js';

// Mock the logger to avoid actual logging during tests
jest.mock('../../../src/utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('DataService', () => {
  let dataService: DataService;
  const testDataDir = path.join(process.cwd(), 'test-data');
  const testTasksFile = path.join(testDataDir, 'tasks.json');

  beforeEach(async () => {
    // Create a test instance with test directory
    dataService = new DataService(testDataDir);

    // Clean up test directory before each test
    await fs.rm(testDataDir, { recursive: true, force: true });
  });

  afterEach(async () => {
    // Clean up test directory after each test
    await fs.rm(testDataDir, { recursive: true, force: true });
  });

  describe('loadTasks', () => {
    it('should return empty array when file does not exist', async () => {
      const tasks = await dataService.loadTasks();

      expect(tasks).toEqual([]);
    });

    it('should parse and return existing tasks correctly', async () => {
      const testTasks = [
        createTestTask({ text: 'Task 1' }),
        createTestTask({ text: 'Task 2', status: 'completed' }),
      ];

      // Create the data directory and file
      await fs.mkdir(testDataDir, { recursive: true });
      await fs.writeFile(testTasksFile, JSON.stringify(testTasks, null, 2), 'utf-8');

      const tasks = await dataService.loadTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].text).toBe('Task 1');
      expect(tasks[1].text).toBe('Task 2');
      expect(tasks[1].status).toBe('completed');
    });

    it('should throw descriptive error for corrupted JSON', async () => {
      // Create the data directory and write corrupted JSON
      await fs.mkdir(testDataDir, { recursive: true });
      await fs.writeFile(testTasksFile, '{ invalid json }', 'utf-8');

      await expect(dataService.loadTasks()).rejects.toThrow(
        'Failed to load tasks: Corrupted JSON file'
      );
    });

    it('should return empty array when file is empty', async () => {
      // Create the data directory and write empty array
      await fs.mkdir(testDataDir, { recursive: true });
      await fs.writeFile(testTasksFile, '[]', 'utf-8');

      const tasks = await dataService.loadTasks();

      expect(tasks).toEqual([]);
    });

    it('should throw descriptive error for file system errors', async () => {
      // Mock fs.readFile to throw a non-SyntaxError
      const readFileSpy = jest.spyOn(fs, 'readFile').mockRejectedValue(new Error('Permission denied'));

      await expect(dataService.loadTasks()).rejects.toThrow(
        'Failed to load tasks: File system error'
      );

      readFileSpy.mockRestore();
    });
  });

  describe('saveTasks', () => {
    it('should write tasks to file with correct JSON formatting', async () => {
      const testTasks = [
        createTestTask({ text: 'Task 1' }),
        createTestTask({ text: 'Task 2' }),
      ];

      await dataService.saveTasks(testTasks);

      // Read the file and verify formatting
      const content = await fs.readFile(testTasksFile, 'utf-8');
      const parsed = JSON.parse(content) as Task[];

      expect(parsed).toHaveLength(2);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(parsed[0]?.text).toBe('Task 1');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(parsed[1]?.text).toBe('Task 2');

      // Verify 2-space indentation
      expect(content).toContain('  ');
      expect(content).not.toContain('\t');
    });

    it('should use atomic write pattern (temp file creation and rename)', async () => {
      const testTasks = [createTestTask({ text: 'Test Task' })];
      const tempFile = `${testTasksFile}.tmp`;

      // Spy on fs.writeFile and fs.rename
      const writeFileSpy = jest.spyOn(fs, 'writeFile');
      const renameSpy = jest.spyOn(fs, 'rename');

      await dataService.saveTasks(testTasks);

      // Verify temp file was written to
      expect(writeFileSpy).toHaveBeenCalledWith(
        tempFile,
        expect.any(String),
        'utf-8'
      );

      // Verify rename was called
      expect(renameSpy).toHaveBeenCalledWith(tempFile, testTasksFile);

      // Verify temp file does not exist after successful save
      await expect(fs.access(tempFile)).rejects.toThrow();

      writeFileSpy.mockRestore();
      renameSpy.mockRestore();
    });

    it('should clean up temp file on write error', async () => {
      const testTasks = [createTestTask()];
      const tempFile = `${testTasksFile}.tmp`;

      // Mock fs.rename to throw an error
      const renameSpy = jest.spyOn(fs, 'rename').mockRejectedValue(new Error('Rename failed'));

      await expect(dataService.saveTasks(testTasks)).rejects.toThrow('Failed to save tasks');

      // Verify temp file was cleaned up (unlink was called)
      // The temp file might not exist if it was cleaned up successfully
      await expect(fs.access(tempFile)).rejects.toThrow();

      renameSpy.mockRestore();
    });

    it('should create data directory if it does not exist', async () => {
      const testTasks = [createTestTask()];

      // Ensure directory doesn't exist
      await fs.rm(testDataDir, { recursive: true, force: true });

      await dataService.saveTasks(testTasks);

      // Verify directory was created
      const stats = await fs.stat(testDataDir);
      expect(stats.isDirectory()).toBe(true);

      // Verify file was created
      const content = await fs.readFile(testTasksFile, 'utf-8');
      const parsed = JSON.parse(content) as Task[];
      expect(parsed).toHaveLength(1);
    });
  });
});
