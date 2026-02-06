import React, { useEffect, useState } from 'react';

import type { ProactivePrompt } from '@simple-todo/shared/types';

import styles from './PromptToast.module.css';

interface PromptToastProps {
  prompt: ProactivePrompt;
  onComplete: (taskId: string) => void;
  onDismiss: () => void;
  onSnooze: (taskId: string) => void;
  position?: 'top-right' | 'bottom-right';
}

/**
 * Non-blocking toast notification for proactive task prompts
 *
 * Displays a prompt suggesting a task for the user to complete.
 * Auto-dismisses after 30 seconds if no user interaction.
 * Supports truncation and expansion for long task text.
 *
 * @example
 * <PromptToast
 *   prompt={{ taskId: '123', taskText: 'Buy groceries', promptedAt: '...' }}
 *   onComplete={(taskId) => handleComplete(taskId)}
 *   onDismiss={() => handleDismiss()}
 *   onSnooze={(taskId) => handleSnooze(taskId)}
 * />
 */
export const PromptToast: React.FC<PromptToastProps> = ({
  prompt,
  onComplete,
  onDismiss,
  onSnooze,
  position = 'bottom-right',
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const MAX_CHARS = 60;
  const isTruncated = prompt.taskText.length > MAX_CHARS;
  const displayText = !isExpanded && isTruncated
    ? `${prompt.taskText.substring(0, MAX_CHARS)}...`
    : prompt.taskText;

  // Auto-dismiss timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleDismissWithAnimation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDismissWithAnimation = (): void => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300); // Match animation duration
  };

  const handleCompleteWithAnimation = (): void => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete(prompt.taskId);
    }, 300);
  };

  const handleSnoozeWithAnimation = (): void => {
    setIsExiting(true);
    setTimeout(() => {
      onSnooze(prompt.taskId);
    }, 300);
  };

  const handleToggleExpand = (): void => {
    if (isTruncated) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      handleDismissWithAnimation();
    }
  };

  const positionClass = position === 'top-right' ? styles.topRight : styles.bottomRight;
  const animationClass = isExiting ? styles.exit : styles.enter;
  const expandableClass = isTruncated ? styles.expandable : '';

  return (
    <div
      className={`${styles.toast} ${positionClass} ${animationClass}`}
      role="alert"
      aria-live="polite"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Icon */}
      <div className={styles.icon} aria-hidden="true">
        ⏰
      </div>

      {/* Message heading */}
      <h3 className={styles.heading}>Could you do this task now?</h3>

      {/* Task text - clickable if truncated */}
      <div
        className={`${styles.taskText} ${expandableClass}`}
        onClick={handleToggleExpand}
        role={isTruncated ? 'button' : undefined}
        aria-label={isTruncated ? (isExpanded ? 'Click to collapse' : 'Click to expand') : undefined}
        tabIndex={isTruncated ? 0 : undefined}
        onKeyDown={(e) => {
          if (isTruncated && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleToggleExpand();
          }
        }}
      >
        {displayText}
      </div>

      {isTruncated && !isExpanded && (
        <div className={styles.expandHint}>Click to expand</div>
      )}

      {/* Divider */}
      <div className={styles.divider} />

      {/* Auto-dismiss timer */}
      <div className={styles.timer}>Auto-dismiss: {secondsRemaining}s</div>

      {/* Progress bar */}
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${(secondsRemaining / 30) * 100}%` }}
        />
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.completeButton}`}
          onClick={handleCompleteWithAnimation}
          aria-label="Complete task"
          type="button"
        >
          <span className={styles.buttonIcon}>✓</span>
          <span>Complete</span>
        </button>

        <button
          className={`${styles.button} ${styles.dismissButton}`}
          onClick={handleDismissWithAnimation}
          aria-label="Dismiss prompt"
          type="button"
        >
          <span className={styles.buttonIcon}>✕</span>
          <span>Dismiss</span>
        </button>

        <button
          className={`${styles.button} ${styles.snoozeButton}`}
          onClick={handleSnoozeWithAnimation}
          aria-label="Snooze task"
          type="button"
        >
          <span className={styles.buttonIcon}>💤</span>
          <span>Snooze</span>
        </button>
      </div>
    </div>
  );
};
