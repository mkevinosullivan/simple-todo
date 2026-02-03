import { useEffect } from 'react';
import type React from 'react';

import styles from './InboxZeroState.module.css';

/**
 * Props for InboxZeroState component
 */
interface InboxZeroStateProps {
  /** Number of tasks completed (from analytics) */
  completedCount: number;
  /** Callback when "Add New Tasks" button clicked */
  onAddNewTask: () => void;
  /** Optional: True if this is first time reaching inbox zero (for message variation) */
  isFirstInboxZero?: boolean;
}

/**
 * InboxZeroState Component
 *
 * Returning user empty state with completion celebration and statistics.
 * Displays when a returning user (hasCompletedSetup = true) has zero active tasks.
 *
 * Features:
 * - Celebratory heading with variant messages
 * - Task completion statistics
 * - "Add New Tasks" CTA button
 * - Vibrant gradient design
 * - Optional confetti animation
 * - Entrance animation (fade + scale)
 * - Accessible with semantic HTML and ARIA labels
 * - Responsive design
 *
 * @param props - Component props
 * @returns InboxZeroState component
 *
 * @example
 * <InboxZeroState
 *   completedCount={5}
 *   onAddNewTask={() => handleAddTask()}
 *   isFirstInboxZero={true}
 * />
 */
export const InboxZeroState: React.FC<InboxZeroStateProps> = ({
  completedCount,
  onAddNewTask,
  isFirstInboxZero = true,
}) => {
  // Optional confetti animation on mount
  useEffect(() => {
    // Lazy-load confetti library
    void import('canvas-confetti')
      .then((confetti) => {
        setTimeout(() => {
          void confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F97316', '#FCD34D', '#10B981', '#3B82F6'],
            duration: 1000,
            gravity: 1.2,
          });
        }, 100); // Delay 100ms after component appears
      })
      .catch((error) => {
        // Silently fail if confetti library can't be loaded
        console.warn('Failed to load confetti library:', error);
      });
  }, []);

  // Determine celebration message based on isFirstInboxZero prop
  const celebrationMessage = isFirstInboxZero
    ? 'You completed everything! 🎉'
    : "Back to zero! You're on fire! 🔥";

  return (
    <section className={styles.inboxZeroState} aria-labelledby="inbox-zero-heading">
      <h1 id="inbox-zero-heading" className={styles.heading}>
        {celebrationMessage}
      </h1>

      <p className={styles.stats}>
        You completed <strong className={styles.count}>{completedCount}</strong>{' '}
        {completedCount === 1 ? 'task' : 'tasks'} this session
      </p>

      {/* TODO: Add completion streak display (AC: 5) */}
      {/* Track consecutive days of hitting inbox zero */}
      {/* Display: "🔥 3-day streak!" or similar */}

      <button
        className={styles.ctaButton}
        onClick={onAddNewTask}
        aria-label="Add new tasks to your list"
      >
        Add New Tasks
      </button>
    </section>
  );
};
