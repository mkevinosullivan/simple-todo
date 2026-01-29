import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import type { Task } from '@simple-todo/shared/types';

import { tasks as tasksApi } from '../services/tasks.js';

/**
 * Task Context State
 */
export interface TaskContextState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

/**
 * Task Context - Global state for task list
 *
 * Provides:
 * - Current task list (active tasks)
 * - Loading and error states
 * - Methods to update task list optimistically
 * - Auto-refresh on mount
 */
const TaskContext = createContext<TaskContextState | undefined>(undefined);

export interface TaskProviderProps {
  children: React.ReactNode;
}

/**
 * TaskProvider - Context provider for task state
 *
 * Features:
 * - Fetches tasks on mount
 * - Provides task CRUD operations
 * - Automatic re-renders for subscribed components
 * - Optimistic updates for better UX
 *
 * @example
 * <TaskProvider>
 *   <App />
 * </TaskProvider>
 */
export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches tasks from API
   */
  const refreshTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.getAll('active');
      setTaskList(data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load tasks on mount
   */
  useEffect(() => {
    void refreshTasks();
  }, []);

  /**
   * Adds a task to the list (optimistic update)
   */
  const addTask = (task: Task): void => {
    setTaskList((prev) => [task, ...prev]);
  };

  /**
   * Removes a task from the list (optimistic update)
   */
  const removeTask = (id: string): void => {
    setTaskList((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Updates a task in the list (optimistic update)
   */
  const updateTask = (id: string, updates: Partial<Task>): void => {
    setTaskList((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const value: TaskContextState = {
    tasks: taskList,
    loading,
    error,
    refreshTasks,
    addTask,
    removeTask,
    updateTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

/**
 * useTaskContext - Hook to access task context
 *
 * @returns Task context state
 * @throws {Error} If used outside TaskProvider
 *
 * @example
 * const { tasks, loading, addTask } = useTaskContext();
 */
export const useTaskContext = (): TaskContextState => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
