import type React from 'react';
import { useEffect, useState } from 'react';

import type { CelebrationMessage, Task } from '@simple-todo/shared/types';

import { AddTaskInput } from '../components/AddTaskInput.js';
import { CelebrationOverlay } from '../components/CelebrationOverlay.js';
import { ErrorToast } from '../components/ErrorToast.js';
import { SettingsModal } from '../components/SettingsModal.js';
import { TaskList } from '../components/TaskList.js';
import { WIPCountIndicator } from '../components/WIPCountIndicator.js';
import { WIPLimitMessage } from '../components/WIPLimitMessage.js';
import { useConfig } from '../context/ConfigContext.js';
import { useTaskContext } from '../context/TaskContext.js';
import { useCelebrationQueue } from '../hooks/useCelebrationQueue.js';
import { useWipStatus } from '../hooks/useWipStatus.js';
import { celebrations } from '../services/celebrations.js';
import { updateEducationFlag } from '../services/config.js';
import { tasks } from '../services/tasks.js';
import { announceToScreenReader } from '../utils/announceToScreenReader.js';

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
  const { config } = useConfig();
  const { tasks: taskList, loading, error: contextError, addTask, removeTask, updateTask } = useTaskContext();
  const { canAddTask, currentCount, limit, hasSeenWIPLimitEducation, refreshLimit } = useWipStatus();
  const { currentCelebration, queueCelebration, dismissCelebration } = useCelebrationQueue();
  const [toastError, setToastError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [wipLimitPulse, setWipLimitPulse] = useState<boolean>(false);
  const [isFirstCompletion, setIsFirstCompletion] = useState<boolean>(true);
  const [, setForceRender] = useState<number>(0);
  const error = contextError;

  // Force re-render every 60 seconds to update age indicators
  useEffect(() => {
    const intervalId = setInterval(() => {
      setForceRender((prev) => prev + 1);
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleTaskCreated = (newTask: Task): void => {
    addTask(newTask);
  };

  /**
   * Handles WIP limit reached when user tries to add task
   */
  const handleWipLimitReached = (): void => {
    setWipLimitPulse(true);
    setTimeout(() => setWipLimitPulse(false), 300);
  };

  /**
   * Handles settings modal limit update
   */
  const handleLimitUpdated = (): void => {
    refreshLimit();
  };

  /**
   * Handles education dismissal - persists flag to backend
   */
  const handleEducationDismissed = async (): Promise<void> => {
    try {
      await updateEducationFlag(true);
      // Refresh to update local state
      refreshLimit();
    } catch (err) {
      console.error('Failed to persist education dismissal:', err);
      // Non-critical error - user can still use the app
    }
  };

  const handleComplete = async (id: string): Promise<void> => {
    // Find task for rollback and announcement
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-member-access
    const task: Task | undefined = taskList.find((t: Task) => t.id === id);
    if (!task) {
      return;
    }

    // Optimistic update: remove from list immediately
    removeTask(id);

    try {
      // Call API to complete task
      await tasks.complete(id);

      // Announce to screen reader
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      announceToScreenReader(`Task completed: ${task.text}`, 'polite');
    } catch {
      // Rollback: restore task to list
      addTask(task);

      // Show error toast
      setToastError('Failed to complete task. Please try again.');

      // Announce error to screen reader
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      announceToScreenReader(`Failed to complete task: ${task.text}`, 'assertive');
      return; // Exit early - no celebration on failure
    }

    // Add natural timing delay (300ms) for better UX feel
    setTimeout(() => {
      // Only show celebration if enabled in config (AC: 6)
      if (!config.celebrationsEnabled) {
        return; // Skip celebration if disabled
      }

      // Handle first completion special case
      if (isFirstCompletion) {
        queueCelebration({
          message: 'First task done! Keep it up!',
          variant: 'enthusiastic',
          duration: config.celebrationDurationSeconds * 1000,
        });
        setIsFirstCompletion(false);
        return;
      }

      // Fetch celebration message (non-critical)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const truncatedTaskText: string = task.text.length > 50 ? `${task.text.substring(0, 47)}...` : task.text;

      void (async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const celebration: CelebrationMessage = await celebrations.getMessage();

          // Enhance message with task context if not already included
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const enhancedMessage: string = celebration.message.includes(task.text)
            ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              celebration.message
            : `You completed '${truncatedTaskText}'!`;

          // Queue celebration with duration from config (AC: 3, 8)
          queueCelebration({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            ...celebration,
            message: enhancedMessage,
            duration: config.celebrationDurationSeconds * 1000,
          });
        } catch (err) {
          // Fallback celebration if API fails
          console.error('Failed to fetch celebration message:', err);

          queueCelebration({
            message: 'Great job! Task completed.',
            variant: 'supportive',
            duration: config.celebrationDurationSeconds * 1000,
          });
        }
      })();
    }, 300); // Natural pause before celebration
  };

  const handleDelete = async (id: string): Promise<void> => {
    // Find task for rollback and announcement
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-member-access
    const task: Task | undefined = taskList.find((t: Task) => t.id === id);
    if (!task) {
      return;
    }

    // Optimistic update: remove from list immediately
    removeTask(id);

    try {
      // Call API to delete task
      await tasks.delete(id);

      // Announce to screen reader
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      announceToScreenReader(`Task deleted: ${task.text}`, 'polite');
    } catch (err: unknown) {
      // Rollback: restore task to list
      addTask(task);

      // Show error toast
      setToastError('Failed to delete task. Please try again.');

      // Announce error to screen reader
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      announceToScreenReader(`Failed to delete task: ${task.text}`, 'assertive');
    }
  };

  const handleEdit = async (id: string, newText: string): Promise<void> => {
    // Validation
    const trimmedText: string = newText.trim();
    if (trimmedText === '') {
      setToastError('Task cannot be empty');
      announceToScreenReader('Task cannot be empty', 'assertive');
      return;
    }

    // Find task for rollback
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-member-access
    const task: Task | undefined = taskList.find((t: Task) => t.id === id);
    if (!task) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const originalText: string = task.text;

    // Optimistic update: change text immediately
    updateTask(id, { text: trimmedText });

    // Exit edit mode
    setEditingTaskId(null);

    try {
      // Call API to update task
      await tasks.update(id, trimmedText);

      // Announce to screen reader
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      announceToScreenReader(`Task updated: ${trimmedText}`, 'polite');
    } catch (err: unknown) {
      // Rollback: restore original text
      updateTask(id, { text: originalText });

      // Determine error message based on error type
      const errorMessage: string =
        err instanceof Error && err.message.includes('exceeds maximum length')
          ? 'Task text is too long (max 500 characters)'
          : err instanceof Error && err.message.includes('cannot be empty')
            ? 'Task cannot be empty'
            : 'Failed to update task. Please try again.';

      // Show error toast
      setToastError(errorMessage);

      // Announce error to screen reader
      announceToScreenReader(errorMessage, 'assertive');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Tasks</h1>
        <div className={styles.headerActions}>
          <WIPCountIndicator
            currentCount={currentCount}
            limit={limit}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className={styles.settingsButton}
            aria-label="Open settings"
            title="Settings"
          >
            <svg
              className={styles.settingsIcon}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <AddTaskInput
          onTaskCreated={handleTaskCreated}
          onWipLimitReached={handleWipLimitReached}
          canAddTask={canAddTask}
          currentCount={currentCount}
          limit={limit}
        />
        <WIPLimitMessage
          canAddTask={canAddTask}
          currentCount={currentCount}
          limit={limit}
          onOpenSettings={() => setIsSettingsOpen(true)}
          shouldPulse={wipLimitPulse}
          hasSeenEducation={hasSeenWIPLimitEducation}
          onEducationDismissed={() => void handleEducationDismissed()}
        />
        <TaskList
          tasks={taskList}
          loading={loading}
          error={error}
          onComplete={(id) => void handleComplete(id)}
          onDelete={(id) => void handleDelete(id)}
          onEdit={(id, text) => void handleEdit(id, text)}
          editingTaskId={editingTaskId}
        />
      </main>
      {toastError && <ErrorToast message={toastError} onDismiss={() => setToastError(null)} />}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLimitUpdated={handleLimitUpdated}
      />
      {currentCelebration && (
        <CelebrationOverlay
          message={currentCelebration.message}
          variant={currentCelebration.variant}
          duration={currentCelebration.duration}
          onDismiss={dismissCelebration}
        />
      )}
    </div>
  );
};
