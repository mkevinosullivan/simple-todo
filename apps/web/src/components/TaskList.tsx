import type React from 'react';

import type { Task } from '@simple-todo/shared/types';

import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

/**
 * TaskList component - displays all active tasks
 *
 * Features:
 * - Shows loading, error, and empty states
 * - Displays tasks in chronological order (newest first)
 * - Semantic HTML (unordered list)
 * - Responsive design
 *
 * @example
 * <TaskList tasks={tasks} loading={loading} error={error} />
 */
export const TaskList: React.FC<TaskListProps> = ({ tasks, loading, error }) => {
  // Sort tasks by createdAt timestamp (newest first)
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
