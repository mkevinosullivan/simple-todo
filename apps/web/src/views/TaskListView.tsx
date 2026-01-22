import type React from 'react';

import { TaskList } from '../components/TaskList';

import styles from './TaskListView.module.css';

/**
 * TaskListView - Main page component for viewing task list
 *
 * Features:
 * - Page-level semantic heading
 * - TaskList component integration
 * - Calming color palette
 * - Responsive layout
 *
 * @example
 * <TaskListView />
 */
export const TaskListView: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Tasks</h1>
      </header>
      <main className={styles.main}>
        <TaskList />
      </main>
    </div>
  );
};
