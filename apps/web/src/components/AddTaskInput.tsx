import type React from 'react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import type { Task } from '@simple-todo/shared/types';

import { tasks } from '../services/tasks.js';
import { announceToScreenReader } from '../utils/announceToScreenReader.js';

import styles from './AddTaskInput.module.css';

interface AddTaskInputProps {
  onTaskCreated: (task: Task) => void;
  onWipLimitReached?: () => void;
  canAddTask: boolean;
  currentCount: number;
  limit: number;
}

/**
 * AddTaskInput displays an input field and button for creating new tasks
 *
 * Features:
 * - Client-side validation (empty, whitespace, 500 char limit)
 * - WIP limit enforcement (disables when limit reached)
 * - Keyboard accessible (Tab, Enter, Space)
 * - Screen reader compatible with ARIA labels
 * - Error handling with user-friendly messages
 *
 * @example
 * <AddTaskInput
 *   onTaskCreated={(task) => handleNewTask(task)}
 *   onWipLimitReached={() => showWipMessage()}
 * />
 */
export const AddTaskInput: React.FC<AddTaskInputProps> = ({
  onTaskCreated,
  onWipLimitReached,
  canAddTask,
  currentCount,
  limit,
}) => {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const prevCanAddTask = useRef<boolean>(canAddTask);

  /**
   * Announce when space becomes available after being at limit
   */
  useEffect(() => {
    if (prevCanAddTask.current === false && canAddTask === true) {
      announceToScreenReader('Space available. You can now add a task.', 'polite');
    }
    prevCanAddTask.current = canAddTask;
  }, [canAddTask]);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    // WIP limit validation
    if (!canAddTask) {
      // Trigger WIP limit message with pulse animation
      if (onWipLimitReached) {
        onWipLimitReached();
      }
      return;
    }

    // Client-side validation
    const trimmedText = text.trim();
    if (!trimmedText) {
      setError('Task cannot be empty');
      return;
    }
    if (trimmedText.length > 500) {
      setError('Task too long (max 500 characters)');
      return;
    }

    // Reset error state
    setError(null);
    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const newTask: Task = await tasks.create(trimmedText);
      onTaskCreated(newTask);
      setText(''); // Clear input on success
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      // Keep text in input for user to retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className={styles.addTaskForm}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        disabled={loading || !canAddTask}
        aria-label="New task description"
        aria-invalid={!!error}
        aria-describedby={error ? 'task-input-error' : !canAddTask ? 'wip-limit-info' : undefined}
      />
      <button
        type="submit"
        className={styles.addButton}
        disabled={loading || !canAddTask}
        aria-label={
          canAddTask
            ? 'Add task'
            : `Cannot add task - ${currentCount} of ${limit} active tasks. Complete a task first.`
        }
        aria-disabled={!canAddTask}
      >
        {!canAddTask && '🔒 '}
        {loading ? 'Adding...' : 'Add Task'}
      </button>
      {!canAddTask && (
        <span id="wip-limit-info" className="sr-only">
          Cannot add task. You have {currentCount} active tasks. Complete a task before adding
          more.
        </span>
      )}
      {error && (
        <div id="task-input-error" className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}
    </form>
  );
};
