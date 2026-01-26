import type { Task, TaskStatus } from '@simple-todo/shared/types';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../utils/logger.js';

import type { DataService } from './DataService.js';

/**
 * TaskService - Core business logic for task CRUD operations
 * Encapsulates task management rules and metadata calculation
 */
export class TaskService {
  private readonly dataService: DataService;

  constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  /**
   * Creates a new task and adds it to the task list
   *
   * @param text - The task description (1-500 characters)
   * @returns The newly created task with generated ID and timestamps
   * @throws {Error} If text is empty or exceeds 500 characters
   *
   * @example
   * const task = await taskService.createTask('Buy groceries');
   * console.log(task.id); // "123e4567-e89b-12d3-a456-426614174000"
   */
  async createTask(text: string): Promise<Task> {
    // Validate text is not empty
    if (!text || text.trim().length === 0) {
      throw new Error('Task text cannot be empty');
    }

    // Validate text length
    if (text.length > 500) {
      throw new Error('Task text exceeds maximum length (500 characters)');
    }

    try {
      // Create new task
      const task: Task = {
        id: uuidv4(),
        text,
        status: 'active',
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      // Load existing tasks
      const tasks = await this.dataService.loadTasks();

      // Add new task
      tasks.push(task);

      // Save updated tasks
      await this.dataService.saveTasks(tasks);

      return task;
    } catch (err: unknown) {
      logger.error('Failed to create task', { error: err, text });
      throw new Error('Failed to create task');
    }
  }

  /**
   * Retrieves all tasks with optional filtering by status
   *
   * @param status - Optional filter by task status ('active' or 'completed')
   * @returns Array of tasks matching the filter, or all tasks if no filter provided
   *
   * @example
   * const allTasks = await taskService.getAllTasks();
   * const activeTasks = await taskService.getAllTasks('active');
   */
  async getAllTasks(status?: TaskStatus): Promise<Task[]> {
    try {
      // Load all tasks
      const tasks = await this.dataService.loadTasks();

      // Filter by status if provided
      if (status) {
        return tasks.filter((t) => t.status === status);
      }

      // Return all tasks
      return tasks;
    } catch (err: unknown) {
      logger.error('Failed to get tasks', { error: err, status });
      throw new Error('Failed to get tasks');
    }
  }

  /**
   * Retrieves a single task by its ID
   *
   * @param id - The task ID to find
   * @returns The task if found, or null if not found
   *
   * @example
   * const task = await taskService.getTaskById('123e4567-e89b-12d3-a456-426614174000');
   * if (task) {
   *   console.log(task.text);
   * }
   */
  async getTaskById(id: string): Promise<Task | null> {
    try {
      // Load all tasks
      const tasks = await this.dataService.loadTasks();

      // Find task by ID
      const task = tasks.find((t) => t.id === id);

      // Return found task or null
      return task ?? null;
    } catch (err: unknown) {
      logger.error('Failed to get task by ID', { error: err, id });
      throw new Error('Failed to get task by ID');
    }
  }

  /**
   * Updates the text of an existing task
   * Only active tasks can be updated (completed tasks are immutable)
   *
   * @param id - The task ID to update
   * @param text - The new task text (1-500 characters)
   * @returns The updated task
   * @throws {Error} If text is empty, exceeds 500 characters, task not found, or task is completed
   *
   * @example
   * const task = await taskService.updateTask('123e4567-e89b-12d3-a456-426614174000', 'Buy milk and bread');
   */
  async updateTask(id: string, text: string): Promise<Task> {
    // Validate text is not empty
    if (!text || text.trim().length === 0) {
      throw new Error('Task text cannot be empty');
    }

    // Validate text length
    if (text.length > 500) {
      throw new Error('Task text exceeds maximum length (500 characters)');
    }

    try {
      // Load all tasks
      const tasks = await this.dataService.loadTasks();

      // Find task by ID
      const task = tasks.find((t) => t.id === id);

      // Check if task exists
      if (!task) {
        throw new Error('Task not found');
      }

      // Check if task is completed
      if (task.status === 'completed') {
        throw new Error('Cannot update completed tasks');
      }

      // Update task text
      task.text = text;

      // Save updated tasks
      await this.dataService.saveTasks(tasks);

      return task;
    } catch (err: unknown) {
      // Re-throw validation errors with original message
      if (
        err instanceof Error &&
        (err.message === 'Task not found' || err.message === 'Cannot update completed tasks')
      ) {
        throw err;
      }
      logger.error('Failed to update task', { error: err, id, text });
      throw new Error('Failed to update task');
    }
  }

  /**
   * Deletes a task from storage
   *
   * @param id - The task ID to delete
   * @throws {Error} If task is not found
   *
   * @example
   * await taskService.deleteTask('123e4567-e89b-12d3-a456-426614174000');
   */
  async deleteTask(id: string): Promise<void> {
    try {
      // Load all tasks
      const tasks = await this.dataService.loadTasks();

      // Find task index
      const index = tasks.findIndex((t) => t.id === id);

      // Check if task exists
      if (index === -1) {
        throw new Error('Task not found');
      }

      // Remove task from array
      tasks.splice(index, 1);

      // Save updated tasks
      await this.dataService.saveTasks(tasks);
    } catch (err: unknown) {
      // Re-throw validation errors with original message
      if (err instanceof Error && err.message === 'Task not found') {
        throw err;
      }
      logger.error('Failed to delete task', { error: err, id });
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Marks a task as completed
   * Sets status to 'completed' and records completedAt timestamp
   *
   * @param id - The task ID to complete
   * @returns The completed task
   * @throws {Error} If task is not found or already completed
   *
   * @example
   * const task = await taskService.completeTask('123e4567-e89b-12d3-a456-426614174000');
   * console.log(task.status); // 'completed'
   */
  async completeTask(id: string): Promise<Task> {
    try {
      // Load all tasks
      const tasks = await this.dataService.loadTasks();

      // Find task by ID
      const task = tasks.find((t) => t.id === id);

      // Check if task exists
      if (!task) {
        throw new Error('Task not found');
      }

      // Check if task is already completed
      if (task.status === 'completed') {
        throw new Error('Task is already completed');
      }

      // Mark task as completed
      task.status = 'completed';
      task.completedAt = new Date().toISOString();

      // Save updated tasks
      await this.dataService.saveTasks(tasks);

      return task;
    } catch (err: unknown) {
      // Re-throw validation errors with original message
      if (
        err instanceof Error &&
        (err.message === 'Task not found' || err.message === 'Task is already completed')
      ) {
        throw err;
      }
      logger.error('Failed to complete task', { error: err, id });
      throw new Error('Failed to complete task');
    }
  }

  /**
   * Gets the count of active tasks
   * Used by WIPLimitService for WIP limit enforcement (future story)
   *
   * @returns Count of active tasks
   *
   * @example
   * const count = await taskService.getActiveTaskCount();
   * console.log(`You have ${count} active tasks`);
   */
  async getActiveTaskCount(): Promise<number> {
    try {
      // Load all tasks
      const tasks = await this.dataService.loadTasks();

      // Filter active tasks
      const activeTasks = tasks.filter((t) => t.status === 'active');

      // Return count
      return activeTasks.length;
    } catch (err: unknown) {
      logger.error('Failed to get active task count', { error: err });
      throw new Error('Failed to get active task count');
    }
  }
}
