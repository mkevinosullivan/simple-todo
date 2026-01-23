import type React from 'react';

import type { Task } from '@simple-todo/shared/types';

import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  editingTaskId?: string | null;
}

/**
 * TaskList component - displays all active tasks
 *
 * Features:
 * - Shows loading, error, and empty states
 * - Displays tasks in chronological order (newest first)
 * - Semantic HTML (unordered list)
 * - Responsive design
 * - Passes action callbacks to TaskCard components
 *
 * @example
 * <TaskList
 *   tasks={tasks}
 *   loading={loading}
 *   error={error}
 *   onComplete={handleComplete}
 *   onDelete={handleDelete}
 *   onEdit={handleEdit}
 *   editingTaskId={editingTaskId}
 * />
 */
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  error,
  onComplete,
  onDelete,
  onEdit,
  editingTaskId = null,
}) => {
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
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          isEditingDisabled={editingTaskId !== null && editingTaskId !== task.id}
        />
      ))}
    </ul>
  );
};
