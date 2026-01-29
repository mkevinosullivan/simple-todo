import type React from 'react';
import { useEffect, useState } from 'react';

import styles from './WIPLimitMessage.module.css';

export interface WIPLimitMessageProps {
  canAddTask: boolean;
  currentCount: number;
  limit: number;
  onOpenSettings: () => void;
  shouldPulse?: boolean;
  hasSeenEducation?: boolean;
  onEducationDismissed?: () => void;
}

/**
 * WIPLimitMessage - Encouraging message when WIP limit is reached
 *
 * Features:
 * - Displays when user reaches WIP limit
 * - Calming blue color scheme (supportive, not restrictive)
 * - Educational messaging about WIP benefits
 * - Link to settings for limit adjustment
 * - First-time user education mode
 * - Slide-in animation on appear
 * - Pulse animation on submit attempt at limit
 * - Fully accessible with screen reader support
 *
 * @example
 * <WIPLimitMessage
 *   canAddTask={false}
 *   currentCount={7}
 *   limit={7}
 *   onOpenSettings={() => setIsSettingsOpen(true)}
 *   shouldPulse={isPulsing}
 *   hasSeenEducation={false}
 *   onEducationDismissed={() => markEducationSeen()}
 * />
 */
export const WIPLimitMessage: React.FC<WIPLimitMessageProps> = ({
  canAddTask,
  currentCount,
  limit,
  onOpenSettings,
  shouldPulse = false,
  hasSeenEducation = true,
  onEducationDismissed,
}) => {
  const [showEducation, setShowEducation] = useState(!hasSeenEducation);

  // Don't render if user can add tasks
  if (canAddTask) {
    return null;
  }

  /**
   * Handles "Got it!" button click for first-time education
   */
  const handleEducationDismiss = (): void => {
    setShowEducation(false);
    if (onEducationDismissed) {
      onEducationDismissed();
    }
  };

  /**
   * Handles settings link click
   */
  const handleSettingsClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    onOpenSettings();
  };

  return (
    <div
      className={`${styles.container} ${shouldPulse ? styles.pulse : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Cannot add task. You have ${currentCount} active tasks. Complete a task before adding more.`}
    >
      {/* First-time education mode */}
      {showEducation ? (
        <>
          <div className={styles.educationHeader}>
            <span className={styles.icon} aria-hidden="true">
              💡
            </span>
            <h3 className={styles.educationTitle}>Focus Feature</h3>
          </div>
          <div className={styles.content}>
            <p className={styles.headline}>You have {currentCount} active tasks</p>
            <p className={styles.body}>
              This helps you focus. Research shows limiting WIP improves completion rates.
            </p>
            <p className={styles.body}>
              By keeping active tasks manageable, you'll complete more and feel less overwhelmed.
            </p>
            <p className={styles.body}>
              Complete or delete a task before adding more to maintain focus!
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleEducationDismiss}
                className={styles.gotItButton}
                aria-label="Dismiss WIP limit education"
              >
                Got it!
              </button>
              <a
                href="#settings"
                onClick={handleSettingsClick}
                className={styles.settingsLink}
                aria-label="Open settings to adjust WIP limit"
              >
                Adjust your limit in Settings →
              </a>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Standard message mode */}
          <span className={styles.icon} aria-hidden="true">
            💡
          </span>
          <div className={styles.content}>
            <p className={styles.headline}>You have {currentCount} active tasks</p>
            <p className={styles.body}>
              Complete or delete a task before adding more to maintain focus!
            </p>
            <p className={styles.rationale}>
              Research shows limiting WIP improves completion rates.
            </p>
            <a
              href="#settings"
              onClick={handleSettingsClick}
              className={styles.settingsLink}
              aria-label="Open settings to adjust WIP limit"
            >
              Adjust your limit in Settings →
            </a>
          </div>
        </>
      )}
    </div>
  );
};
