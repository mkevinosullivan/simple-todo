import type React from 'react';

import styles from './EmptyState.module.css';

/**
 * EmptyState displays when no active tasks exist
 *
 * Features:
 * - Encouraging message for first task
 * - Calming visual design
 * - Responsive for all screen sizes
 *
 * @example
 * <EmptyState />
 */
export const EmptyState: React.FC = () => {
  return (
    <div className={styles.emptyState}>
      <p className={styles.message}>No tasks yet. Add your first task to get started!</p>
    </div>
  );
};
