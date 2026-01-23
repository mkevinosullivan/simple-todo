import type React from 'react';

import type { Task } from '@simple-todo/shared/types';
import { TaskHelpers } from '@simple-todo/shared/utils';

import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
}

/**
 * TaskCard displays a single task with text and age indicator
 *
 * Features:
 * - Shows task text prominently with timestamp below
 * - 12px circular age indicator with color coding (left side)
 * - Tooltip showing task age on hover
 * - Semantic HTML (list item)
 * - Exact styling per front-end spec
 *
 * @example
 * <TaskCard task={task} />
 */
export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
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
        aria-label={tooltipText}
      />

      {/* Task content: text and timestamp */}
      <div className={styles.taskContent}>
        <span className={styles.taskText}>{task.text}</span>
        <span className={styles.timestamp}>{timestampDisplay}</span>
      </div>
    </li>
  );
};
