import type React from 'react';

import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Task } from '@simple-todo/shared/types';
import { TaskHelpers } from '@simple-todo/shared/utils';

import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * TaskCard displays a single task with complete and delete actions
 *
 * Features:
 * - Shows task text and age indicator
 * - Complete and Delete action buttons
 * - Keyboard accessible (Tab, Enter, Space)
 * - Screen reader compatible with ARIA labels
 *
 * @example
 * <TaskCard
 *   task={task}
 *   onComplete={(id) => handleComplete(id)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 */
export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelete }) => {
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

  return (
    <li className={styles.taskCard}>
      {/* 12px circular age indicator on left */}
      <span
        className={`${styles.ageIndicator} ${styles[`age-${ageCategory}`]}`}
        title={tooltipText}
        aria-hidden="true"
      />

      {/* Task content: text and timestamp */}
      <div className={styles.taskContent}>
        <span className={styles.taskText}>{task.text}</span>
        <span className={styles.timestamp}>{timestampDisplay}</span>
      </div>

      {/* Action buttons */}
      <div className={styles.taskActions} role="group" aria-label="Task actions">
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
      </div>
    </li>
  );
};
