import type { Task, TaskStatus } from '@simple-todo/shared/types';

import { apiDelete, apiGet, apiPatch, apiPost } from './api';

/**
 * Task API service - handles all task-related API calls
 */
export const tasks = {
  /**
   * Fetch all tasks, optionally filtered by status
   *
   * @param status - Optional filter by task status ('active' | 'completed')
   * @returns Array of tasks
   * @throws {Error} If API request fails
   *
   * @example
   * const activeTasks = await tasks.getAll('active');
   * const allTasks = await tasks.getAll();
   */
  async getAll(status?: TaskStatus): Promise<Task[]> {
    const query = status ? `?status=${status}` : '';
    return apiGet<Task[]>(`/api/tasks${query}`);
  },

  /**
   * Create a new task
   *
   * @param text - Task description (1-500 characters)
   * @returns The newly created task
   * @throws {Error} If API request fails or validation fails
   */
  async create(text: string): Promise<Task> {
    return apiPost<{ text: string }, Task>('/api/tasks', { text });
  },

  /**
   * Complete a task by ID
   *
   * @param id - Task UUID
   * @returns The updated task
   * @throws {Error} If API request fails or task not found
   */
  async complete(id: string): Promise<Task> {
    return apiPatch<Task>(`/api/tasks/${id}/complete`);
  },

  /**
   * Delete a task by ID
   *
   * @param id - Task UUID
   * @throws {Error} If API request fails or task not found
   */
  async delete(id: string): Promise<void> {
    return apiDelete(`/api/tasks/${id}`);
  },
};
