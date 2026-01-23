import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { CheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Task } from '@simple-todo/shared/types';
import { TaskHelpers } from '@simple-todo/shared/utils';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const ageCategory = TaskHelpers.getAgeCategory(task);
  const ageMs = TaskHelpers.getAge(task);

  // Convert age from milliseconds to friendly display
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
  const ageMinutes = Math.floor(ageMs / (1000 * 60));

  // Timestamp display (e.g., "Created 2 days ago")
  let timestampDisplay = '';
  let tooltipText = '';

  if (ageDays > 0) {
    timestampDisplay = `Created ${ageDays} day${ageDays > 1 ? 's' : ''} ago`;
    tooltipText = `Created ${ageDays} day${ageDays > 1 ? 's' : ''} ago`;
  } else if (ageHours > 0) {
    timestampDisplay = `Created ${ageHours} hour${ageHours > 1 ? 's' : ''} ago`;
    tooltipText = `Created ${ageHours} hour${ageHours > 1 ? 's' : ''} ago`;
  } else if (ageMinutes > 0) {
    timestampDisplay = `Created ${ageMinutes} minute${ageMinutes > 1 ? 's' : ''} ago`;
    tooltipText = `Created ${ageMinutes} minute${ageMinutes > 1 ? 's' : ''} ago`;
  } else {
    timestampDisplay = 'Created just now';
    tooltipText = 'Created just now';
  }

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditClick = (): void => {
    setIsEditing(true);
    setEditText(task.text);
  };

  const handleSave = (): void => {
    const trimmedText = editText.trim();
    if (trimmedText === '') {
      return;
    }
    onEdit(task.id, trimmedText);
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
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
      {/* 12px circular age indicator on left */}
      <span
        className={`${styles.ageIndicator} ${styles[`age-${ageCategory}`]}`}
        title={tooltipText}
        aria-hidden="true"
      />

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
            aria-label={`Edit task: ${task.text}`}
          />
        ) : (
          <>
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
              aria-label={`Edit task: ${task.text}`}
              className={styles.btnEdit}
            >
              <PencilIcon className={styles.icon} aria-hidden="true" />
              <span className={styles.srOnly}>Edit</span>
            </button>
            <button
              onClick={() => onComplete(task.id)}
              aria-label={`Complete task: ${task.text}`}
              className={styles.btnComplete}
            >
              <CheckIcon className={styles.icon} aria-hidden="true" />
              <span className={styles.buttonText}>Complete</span>
            </button>
            <button
              onClick={() => onDelete(task.id)}
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
