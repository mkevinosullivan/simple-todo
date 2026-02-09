import { promises as fs } from 'fs';
import path from 'path';

import type { Config, PromptEvent, Task } from '@simple-todo/shared/types';
import { DEFAULT_CONFIG } from '@simple-todo/shared/types';

import { logger } from '../utils/logger.js';

/**
 * Data persistence layer for JSON file storage
 * Handles reading and writing task data with atomic file operations
 */
export class DataService {
  private readonly dataDir: string;
  private readonly tasksFilePath: string;
  private readonly configFilePath: string;
  private readonly promptsFilePath: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data');
    this.tasksFilePath = path.join(this.dataDir, 'tasks.json');
    this.configFilePath = path.join(this.dataDir, 'config.json');
    this.promptsFilePath = path.join(this.dataDir, 'prompts.json');
  }

  /**
   * Ensures the data directory, tasks.json, and config.json files exist
   * Creates them if missing with default content
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

      // Check if config.json exists
      try {
        await fs.access(this.configFilePath);
      } catch {
        // File doesn't exist, create it with DEFAULT_CONFIG
        const content = JSON.stringify(DEFAULT_CONFIG, null, 2);
        await fs.writeFile(this.configFilePath, content, 'utf-8');
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
   * Includes retry logic for Windows file locking issues.
   *
   * @param tasks - Array of tasks to save
   * @throws {Error} If file write operation fails after retries
   *
   * @example
   * await dataService.saveTasks(tasks);
   */
  async saveTasks(tasks: Task[]): Promise<void> {
    const tempFile = `${this.tasksFilePath}.tmp`;
    const maxRetries = 3;
    const retryDelay = 100; // ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Ensure data directory exists
        await fs.mkdir(this.dataDir, { recursive: true });

        // Step 1: Write to temporary file first (2-space indentation)
        const content = JSON.stringify(tasks, null, 2);
        await fs.writeFile(tempFile, content, 'utf-8');

        // Step 2: Atomic rename (POSIX guarantees atomicity)
        // On Windows, this can temporarily fail due to file locking (antivirus, indexing, etc.)
        await fs.rename(tempFile, this.tasksFilePath);

        // Success! Exit the retry loop
        return;
      } catch (error) {
        // Log the attempt
        logger.warn(`Failed to save tasks (attempt ${attempt}/${maxRetries})`, { error });

        // Step 3: Clean up temp file on error
        await fs.unlink(tempFile).catch(() => {
          // Ignore cleanup errors
        });

        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          logger.error('Failed to save tasks after all retries', { error });
          throw new Error('Failed to save tasks');
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  /**
   * Loads configuration from the JSON storage file
   *
   * @returns Config object, or DEFAULT_CONFIG if file doesn't exist
   * @throws {Error} If JSON is corrupted or file system error occurs
   *
   * @example
   * const config = await dataService.loadConfig();
   * console.log(config.wipLimit); // 7 (default)
   */
  async loadConfig(): Promise<Config> {
    try {
      // Ensure file exists before reading
      await this.ensureDataFileExists();

      // Read file contents
      const content = await fs.readFile(this.configFilePath, 'utf-8');

      // Parse and return config
      const parsed: unknown = JSON.parse(content);
      // Type assertion is safe here as we trust the stored JSON format
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return parsed as Config;
    } catch (error) {
      logger.error('Failed to load config', { error });

      if (error instanceof SyntaxError) {
        throw new Error('Failed to load config: Corrupted JSON file');
      }
      throw new Error('Failed to load config: File system error');
    }
  }

  /**
   * Saves configuration to JSON file using atomic write pattern
   *
   * Uses temp file + rename strategy to prevent data corruption if process crashes
   * during write. This ensures either old data or new data exists, never corrupted state.
   * Includes retry logic for Windows file locking issues.
   *
   * @param config - Configuration object to save
   * @throws {Error} If file write operation fails after retries
   *
   * @example
   * await dataService.saveConfig(config);
   */
  async saveConfig(config: Config): Promise<void> {
    const tempFile = `${this.configFilePath}.tmp`;
    const maxRetries = 3;
    const retryDelay = 100; // ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Ensure data directory exists
        await fs.mkdir(this.dataDir, { recursive: true });

        // Step 1: Write to temporary file first (2-space indentation)
        const content = JSON.stringify(config, null, 2);
        await fs.writeFile(tempFile, content, 'utf-8');

        // Step 2: Atomic rename (POSIX guarantees atomicity)
        // On Windows, this can temporarily fail due to file locking (antivirus, indexing, etc.)
        await fs.rename(tempFile, this.configFilePath);

        // Success! Exit the retry loop
        return;
      } catch (error) {
        // Log the attempt
        logger.warn(`Failed to save config (attempt ${attempt}/${maxRetries})`, { error });

        // Step 3: Clean up temp file on error
        await fs.unlink(tempFile).catch(() => {
          // Ignore cleanup errors
        });

        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          logger.error('Failed to save config after all retries', { error });
          throw new Error('Failed to save config');
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  /**
   * Loads prompt events from the JSON storage file
   *
   * @returns Array of prompt events, or empty array if file doesn't exist
   * @throws {Error} If JSON is corrupted or file system error occurs
   *
   * @example
   * const events = await dataService.loadPromptEvents();
   * console.log(events.length); // Number of prompt events
   */
  async loadPromptEvents(): Promise<PromptEvent[]> {
    try {
      // Check if file exists
      try {
        await fs.access(this.promptsFilePath);
      } catch {
        // File doesn't exist, return empty array
        return [];
      }

      // Read file contents
      const content = await fs.readFile(this.promptsFilePath, 'utf-8');

      // Parse and return events (explicitly validate as array)
      const parsed: unknown = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid prompt events data: expected array');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return parsed as PromptEvent[];
    } catch (error) {
      logger.error('Failed to load prompt events', { error });

      if (error instanceof SyntaxError) {
        throw new Error('Failed to load prompt events: Corrupted JSON file');
      }
      throw new Error('Failed to load prompt events: File system error');
    }
  }

  /**
   * Saves prompt events to JSON file using atomic write pattern
   *
   * Uses temp file + rename strategy to prevent data corruption if process crashes
   * during write. This ensures either old data or new data exists, never corrupted state.
   * Includes retry logic for Windows file locking issues.
   *
   * @param events - Array of prompt events to save
   * @throws {Error} If file write operation fails after retries
   *
   * @example
   * await dataService.savePromptEvents(events);
   */
  async savePromptEvents(events: PromptEvent[]): Promise<void> {
    const tempFile = `${this.promptsFilePath}.tmp`;
    const maxRetries = 3;
    const retryDelay = 100; // ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Ensure data directory exists
        await fs.mkdir(this.dataDir, { recursive: true });

        // Step 1: Write to temporary file first (2-space indentation)
        const content = JSON.stringify(events, null, 2);
        await fs.writeFile(tempFile, content, 'utf-8');

        // Step 2: Atomic rename (POSIX guarantees atomicity)
        // On Windows, this can temporarily fail due to file locking (antivirus, indexing, etc.)
        await fs.rename(tempFile, this.promptsFilePath);

        // Success! Exit the retry loop
        return;
      } catch (error) {
        // Log the attempt
        logger.warn(`Failed to save prompt events (attempt ${attempt}/${maxRetries})`, { error });

        // Step 3: Clean up temp file on error
        await fs.unlink(tempFile).catch(() => {
          // Ignore cleanup errors
        });

        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          logger.error('Failed to save prompt events after all retries', { error });
          throw new Error('Failed to save prompt events');
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }
}
