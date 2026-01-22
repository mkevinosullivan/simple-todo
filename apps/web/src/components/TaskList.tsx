import type React from 'react';
import { useEffect, useState } from 'react';

import type { Task } from '@simple-todo/shared/types';

import { tasks } from '../services/tasks';

import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';

/**
 * TaskList component - displays all active tasks
 *
 * Features:
 * - Fetches tasks from API on mount
 * - Shows loading, error, and empty states
 * - Displays tasks in chronological order (newest first)
 * - Semantic HTML (unordered list)
 * - Responsive design
 *
 * @example
 * <TaskList />
 */
export const TaskList: React.FC = () => {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const data = await tasks.getAll('active');
        setTaskList(data);
      } catch (err) {
        setError('Failed to load tasks. Please refresh.');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchTasks();
  }, []);

  // Sort tasks by createdAt timestamp (newest first)
  const sortedTasks = [...taskList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (loading) {
    return <div className={styles.loadingState}>Loading tasks...</div>;
  }

  if (error) {
    return <div className={styles.errorState}>{error}</div>;
  }

  if (sortedTasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className={styles.taskList}>
      {sortedTasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </ul>
  );
};
