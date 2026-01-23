import type React from 'react';
import { useState, type FormEvent } from 'react';

import type { Task } from '@simple-todo/shared/types';

import { tasks } from '../services/tasks';

import styles from './AddTaskInput.module.css';

interface AddTaskInputProps {
  onTaskCreated: (task: Task) => void;
}

/**
 * AddTaskInput displays an input field and button for creating new tasks
 *
 * Features:
 * - Client-side validation (empty, whitespace, 500 char limit)
 * - Keyboard accessible (Tab, Enter, Space)
 * - Screen reader compatible with ARIA labels
 * - Error handling with user-friendly messages
 *
 * @example
 * <AddTaskInput onTaskCreated={(task) => handleNewTask(task)} />
 */
export const AddTaskInput: React.FC<AddTaskInputProps> = ({ onTaskCreated }) => {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

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
      const newTask = await tasks.create(trimmedText);
      onTaskCreated(newTask);
      setText(''); // Clear input on success
    } catch (err) {
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
        disabled={loading}
        aria-label="New task description"
        aria-invalid={!!error}
        aria-describedby={error ? 'task-input-error' : undefined}
      />
      <button type="submit" className={styles.addButton} disabled={loading} aria-label="Add task">
        {loading ? 'Adding...' : 'Add Task'}
      </button>
      {error && (
        <div id="task-input-error" className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}
    </form>
  );
};
