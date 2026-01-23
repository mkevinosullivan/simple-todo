import type React from 'react';
import { useEffect, useState } from 'react';

import type { Task } from '@simple-todo/shared/types';

import { AddTaskInput } from '../components/AddTaskInput';
import { TaskList } from '../components/TaskList';
import { tasks } from '../services/tasks';

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

  useEffect(() => {
    const fetchTasks = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const data = await tasks.getAll('active');
        setTaskList(data);
      } catch (err) {
        setError('Failed to load tasks. Please refresh.');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchTasks();
  }, []);

  const handleTaskCreated = (newTask: Task): void => {
    setTaskList((prevTasks) => [newTask, ...prevTasks]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Tasks</h1>
      </header>
      <main className={styles.main}>
        <AddTaskInput onTaskCreated={handleTaskCreated} />
        <TaskList tasks={taskList} loading={loading} error={error} />
      </main>
    </div>
  );
};
