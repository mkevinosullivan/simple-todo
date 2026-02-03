import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { CheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Task } from '@simple-todo/shared/types';
import { TaskHelpers } from '@simple-todo/shared/utils';

import { formatRelativeTime } from '../utils/formatRelativeTime.js';

import { AgeIndicator } from './AgeIndicator.js';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  isEditingDisabled?: boolean;
}

/**
 * TaskCard displays a single task with edit, complete and delete actions
 *
 * Features:
 * - Shows task text and age indicator
 * - Edit, Complete and Delete action buttons
 * - Edit mode with inline text editing
 * - Keyboard accessible (Tab, Enter, Space, Escape)
 * - Screen reader compatible with ARIA labels
 *
 * @example
 * <TaskCard
 *   task={task}
 *   onComplete={(id) => handleComplete(id)}
 *   onDelete={(id) => handleDelete(id)}
 *   onEdit={(id, text) => handleEdit(id, text)}
 *   isEditingDisabled={false}
 * />
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onDelete,
  onEdit,
  isEditingDisabled = false,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const [editText, setEditText] = useState<string>(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate age category and display text
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const ageCategory = TaskHelpers.getAgeCategory(task);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const ageMs: number = TaskHelpers.getAge(task);

  // Timestamp display using formatRelativeTime utility
  const timestampDisplay = `Created ${formatRelativeTime(ageMs)}`;

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditClick = (): void => {
    setIsEditing(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    setEditText(task.text);
  };

  const handleSave = (): void => {
    const trimmedText = editText.trim();
    if (trimmedText === '') {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    onEdit(task.id, trimmedText);
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    setEditText(task.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <li className={styles.taskCard}>
      {/* Age indicator badge */}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <AgeIndicator ageCategory={ageCategory} createdAt={task.createdAt} />

      {/* Screen reader only text for age announcement */}
      <span className={styles.srOnly}>{timestampDisplay}</span>

      {/* Task content: text and timestamp OR edit input */}
      <div className={styles.taskContent}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            className={styles.editInput}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            aria-label={`Edit task: ${task.text}`}
          />
        ) : (
          <>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            <span className={styles.taskText}>{task.text}</span>
            <span className={styles.timestamp}>{timestampDisplay}</span>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className={styles.taskActions} role="group" aria-label="Task actions">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={editText.trim() === ''}
              aria-label="Save changes"
              className={styles.btnSave}
            >
              <span>Save</span>
            </button>
            <button onClick={handleCancel} aria-label="Cancel editing" className={styles.btnCancel}>
              <span>Cancel</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEditClick}
              disabled={isEditingDisabled}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              aria-label={`Edit task: ${task.text}`}
              className={styles.btnEdit}
            >
              <PencilIcon className={styles.icon} aria-hidden="true" />
              <span className={styles.srOnly}>Edit</span>
            </button>
            <button
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
              onClick={() => onComplete(task.id)}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              aria-label={`Complete task: ${task.text}`}
              className={styles.btnComplete}
            >
              <CheckIcon className={styles.icon} aria-hidden="true" />
              <span className={styles.buttonText}>Complete</span>
            </button>
            <button
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
              onClick={() => onDelete(task.id)}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              aria-label={`Delete task: ${task.text}`}
              className={styles.btnDelete}
            >
              <TrashIcon className={styles.icon} aria-hidden="true" />
              <span className={styles.srOnly}>Delete</span>
            </button>
          </>
        )}
      </div>
    </li>
  );
};
