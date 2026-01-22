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
 * - Shows task text prominently
 * - Visual age indicator with color coding
 * - Semantic HTML (list item)
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

  let ageDisplay = '';
  if (ageDays > 0) {
    ageDisplay = `${ageDays} day${ageDays > 1 ? 's' : ''}`;
  } else if (ageHours > 0) {
    ageDisplay = `${ageHours} hour${ageHours > 1 ? 's' : ''}`;
  } else {
    ageDisplay = 'Just now';
  }

  return (
    <li className={styles.taskCard}>
      <span className={styles.taskText}>{task.text}</span>
      <span className={`${styles.ageIndicator} ${styles[`age-${ageCategory}`]}`}>
        {ageDisplay}
      </span>
    </li>
  );
};
