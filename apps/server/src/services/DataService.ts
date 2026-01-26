import { promises as fs } from 'fs';
import path from 'path';

import type { Task } from '@simple-todo/shared/types';

import { logger } from '../utils/logger.js';

/**
 * Data persistence layer for JSON file storage
 * Handles reading and writing task data with atomic file operations
 */
export class DataService {
  private readonly dataDir: string;
  private readonly tasksFilePath: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data');
    this.tasksFilePath = path.join(this.dataDir, 'tasks.json');
  }

  /**
   * Ensures the data directory and tasks.json file exist
   * Creates them if missing with empty array as default content
   *
   * @throws {Error} If directory or file creation fails
   */
  private async ensureDataFileExists(): Promise<void> {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });

      // Check if tasks.json exists
      try {
        await fs.access(this.tasksFilePath);
      } catch {
        // File doesn't exist, create it with empty array
        await fs.writeFile(this.tasksFilePath, '[]', 'utf-8');
      }
    } catch (error) {
      logger.error('Failed to ensure data file exists', { error });
      throw new Error('Failed to ensure data file exists');
    }
  }

  /**
   * Loads all tasks from the JSON storage file
   *
   * @returns Array of tasks, or empty array if file doesn't exist
   * @throws {Error} If JSON is corrupted or file system error occurs
   *
   * @example
   * const tasks = await dataService.loadTasks();
   * console.log(tasks.length); // Number of tasks
   */
  async loadTasks(): Promise<Task[]> {
    try {
      // Ensure file exists before reading
      await this.ensureDataFileExists();

      // Read file contents
      const content = await fs.readFile(this.tasksFilePath, 'utf-8');

      // Parse and return tasks (explicitly validate as array)
      const parsed: unknown = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid tasks data: expected array');
      }
      return parsed as Task[];
    } catch (error) {
      logger.error('Failed to load tasks', { error });

      if (error instanceof SyntaxError) {
        throw new Error('Failed to load tasks: Corrupted JSON file');
      }
      throw new Error('Failed to load tasks: File system error');
    }
  }

  /**
   * Saves tasks to JSON file using atomic write pattern
   *
   * Uses temp file + rename strategy to prevent data corruption if process crashes
   * during write. This ensures either old data or new data exists, never corrupted state.
   *
   * @param tasks - Array of tasks to save
   * @throws {Error} If file write operation fails
   *
   * @example
   * await dataService.saveTasks(tasks);
   */
  async saveTasks(tasks: Task[]): Promise<void> {
    const tempFile = `${this.tasksFilePath}.tmp`;

    try {
      // Ensure data directory exists
      await fs.mkdir(this.dataDir, { recursive: true });

      // Step 1: Write to temporary file first (2-space indentation)
      const content = JSON.stringify(tasks, null, 2);
      await fs.writeFile(tempFile, content, 'utf-8');

      // Step 2: Atomic rename (POSIX guarantees atomicity)
      await fs.rename(tempFile, this.tasksFilePath);

      // If process crashes here, worst case: temp file remains, data file is intact
    } catch (error) {
      // Step 3: Clean up temp file on error
      await fs.unlink(tempFile).catch(() => {
        // Ignore cleanup errors
      });
      logger.error('Failed to save tasks', { error });
      throw new Error('Failed to save tasks');
    }
  }
}
