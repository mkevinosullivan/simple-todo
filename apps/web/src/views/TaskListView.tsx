import type React from 'react';
import { useEffect, useState } from 'react';

import type { CelebrationMessage, Task } from '@simple-todo/shared/types';

import { AddTaskInput } from '../components/AddTaskInput';
import { ErrorToast } from '../components/ErrorToast';
import { TaskList } from '../components/TaskList';
import { celebrations } from '../services/celebrations';
import { tasks } from '../services/tasks';
import { announceToScreenReader } from '../utils/announceToScreenReader';

import styles from './TaskListView.module.css';

/**
 * TaskListView - Main page component for viewing task list
 *
 * Features:
 * - Page-level semantic heading
 * - Task creation via AddTaskInput
 * - TaskList component integration
 * - Calming color palette
 * - Responsive layout
 *
 * @example
 * <TaskListView />
 */
export const TaskListView: React.FC = () => {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const data: Task[] = await tasks.getAll('active');
        setTaskList(data);
      } catch (err: unknown) {
        setError('Failed to load tasks. Please refresh.');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchTasks();
  }, []);

  const handleTaskCreated = (newTask: Task): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
    setTaskList((prevTasks) => [newTask, ...prevTasks]);
  };

  const handleComplete = async (id: string): Promise<void> => {
    // Find task for rollback and announcement
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-member-access
    const task: Task | undefined = taskList.find((t: Task) => t.id === id);
    if (!task) {
      return;
    }

    // Optimistic update: remove from list immediately
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    setTaskList((prev: Task[]) => prev.filter((t: Task) => t.id !== id));

    try {
      // Call API to complete task
      await tasks.complete(id);

      // Announce to screen reader
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      announceToScreenReader(`Task completed: ${task.text}`, 'polite');

      // Fetch celebration message
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const celebration: CelebrationMessage = await celebrations.getMessage();
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access -- Intentional logging until CelebrationOverlay is implemented (future story)
      console.log('Celebration:', celebration.message);
      // TODO: Show CelebrationOverlay in future story
    } catch {
      // Rollback: restore task to list
      setTaskList((prev: Task[]) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
        [...prev, task].sort(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          (a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );

      // Show error toast
      setToastError('Failed to complete task. Please try again.');

      // Announce error to screen reader
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      announceToScreenReader(`Failed to complete task: ${task.text}`, 'assertive');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    // Find task for rollback and announcement
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-member-access
    const task: Task | undefined = taskList.find((t: Task) => t.id === id);
    if (!task) {
      return;
    }

    // Optimistic update: remove from list immediately
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    setTaskList((prev: Task[]) => prev.filter((t: Task) => t.id !== id));

    try {
      // Call API to delete task
      await tasks.delete(id);

      // Announce to screen reader
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      announceToScreenReader(`Task deleted: ${task.text}`, 'polite');
    } catch (err: unknown) {
      // Rollback: restore task to list
      setTaskList((prev: Task[]) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
        [...prev, task].sort(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          (a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );

      // Show error toast
      setToastError('Failed to delete task. Please try again.');

      // Announce error to screen reader
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      announceToScreenReader(`Failed to delete task: ${task.text}`, 'assertive');
    }
  };

  const handleEdit = async (id: string, newText: string): Promise<void> => {
    // Validation
    const trimmedText: string = newText.trim();
    if (trimmedText === '') {
      setToastError('Task cannot be empty');
      announceToScreenReader('Task cannot be empty', 'assertive');
      return;
    }

    // Find task for rollback
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-member-access
    const task: Task | undefined = taskList.find((t: Task) => t.id === id);
    if (!task) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const originalText: string = task.text;

    // Optimistic update: change text immediately
    setTaskList((prev: Task[]) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      prev.map((t: Task) => (t.id === id ? { ...t, text: trimmedText } : t))
    );

    // Exit edit mode
    setEditingTaskId(null);

    try {
      // Call API to update task
      await tasks.update(id, trimmedText);

      // Announce to screen reader
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      announceToScreenReader(`Task updated: ${trimmedText}`, 'polite');
    } catch (err: unknown) {
      // Rollback: restore original text
      setTaskList((prev: Task[]) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        prev.map((t: Task) => (t.id === id ? { ...t, text: originalText } : t))
      );

      // Determine error message based on error type
      const errorMessage: string =
        err instanceof Error && err.message.includes('exceeds maximum length')
          ? 'Task text is too long (max 500 characters)'
          : err instanceof Error && err.message.includes('cannot be empty')
            ? 'Task cannot be empty'
            : 'Failed to update task. Please try again.';

      // Show error toast
      setToastError(errorMessage);

      // Announce error to screen reader
      announceToScreenReader(errorMessage, 'assertive');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Tasks</h1>
      </header>
      <main className={styles.main}>
        <AddTaskInput onTaskCreated={handleTaskCreated} />
        <TaskList
          tasks={taskList}
          loading={loading}
          error={error}
          onComplete={(id) => void handleComplete(id)}
          onDelete={(id) => void handleDelete(id)}
          onEdit={(id, text) => void handleEdit(id, text)}
          editingTaskId={editingTaskId}
        />
      </main>
      {toastError && <ErrorToast message={toastError} onDismiss={() => setToastError(null)} />}
    </div>
  );
};
