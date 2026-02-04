import type React from 'react';
import { useEffect } from 'react';

import styles from './ErrorToast.module.css';

type ToastSeverity = 'error' | 'warning' | 'info' | 'success';

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
  severity?: ToastSeverity;
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
  severity = 'error',
}) => {
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoDismissMs, onDismiss]);

  const toastClassName = `${styles.errorToast} ${styles[severity]}`;

  return (
    <div role="alert" aria-live="assertive" aria-atomic="true" className={toastClassName}>
      <p className={styles.message}>{message}</p>
      <button onClick={onDismiss} aria-label="Dismiss message" className={styles.dismissButton}>
        ✕
      </button>
    </div>
  );
};
