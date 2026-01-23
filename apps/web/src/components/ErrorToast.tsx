import type React from 'react';
import { useEffect } from 'react';

import styles from './ErrorToast.module.css';

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/**
 * ErrorToast displays error messages with auto-dismiss and manual close
 *
 * Features:
 * - Auto-dismisses after 5 seconds (configurable)
 * - Manual dismiss via close button
 * - Keyboard accessible
 * - Screen reader compatible with ARIA live region
 *
 * @example
 * <ErrorToast
 *   message="Failed to delete task"
 *   onDismiss={() => setError(null)}
 * />
 */
export const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  onDismiss,
  autoDismissMs = 5000,
}) => {
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoDismissMs, onDismiss]);

  return (
    <div role="alert" aria-live="assertive" aria-atomic="true" className={styles.errorToast}>
      <p className={styles.message}>{message}</p>
      <button onClick={onDismiss} aria-label="Dismiss error" className={styles.dismissButton}>
        ✕
      </button>
    </div>
  );
};
