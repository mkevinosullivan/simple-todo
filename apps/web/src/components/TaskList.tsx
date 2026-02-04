import type React from 'react';

import type { Task } from '@simple-todo/shared/types';

import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const sortedTasks: Task[] = [...tasks].sort(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    (a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (loading) {
    return (
      <div className={styles.taskList}>
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorState}>{error}</div>;
  }

  if (sortedTasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className={styles.taskList}>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */}
      {sortedTasks.map((task) => (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        <TaskCard
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          key={task.id}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          task={task}
          onComplete={onComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          isEditingDisabled={editingTaskId !== null && editingTaskId !== task.id}
        />
      ))}
    </ul>
  );
};
