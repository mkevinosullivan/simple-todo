import React, { useCallback, useEffect, useState } from 'react';

import type { CelebrationMessage, CelebrationVariant } from '@simple-todo/shared/types';

import { announceToScreenReader } from '../utils/announceToScreenReader';
import styles from './CelebrationOverlay.module.css';

// Icon mapping for celebration variants
const VARIANT_ICON_MAP: Record<CelebrationVariant, string> = {
  enthusiastic: '🎉',
  supportive: '✓',
  motivational: '⭐',
  'data-driven': '📊',
};

interface CelebrationOverlayProps {
  message: string;
  variant: CelebrationVariant;
  duration?: number; // Duration in milliseconds (default 7000ms)
  onDismiss: () => void;
}

/**
 * CelebrationOverlay displays a celebratory message overlay when users complete tasks
 *
 * Features:
 * - Animated entrance and exit (500ms enter, 300ms exit)
 * - Confetti effect on mount
 * - User-dismissible via click or Escape key
 * - Auto-dismisses after configurable duration (default 7 seconds)
 * - Non-blocking interaction (backdrop allows clicks through)
 * - Accessible with ARIA attributes and screen reader announcements
 *
 * @example
 * <CelebrationOverlay
 *   message="Amazing work!"
 *   variant="enthusiastic"
 *   duration={7000}
 *   onDismiss={() => handleDismiss()}
 * />
 */
export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  message,
  variant,
  duration = 7000,
  onDismiss,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // Handle dismissal with exit animation
  // Memoized to prevent stale closures in event listeners
  const handleDismiss = useCallback((): void => {
    setIsExiting(true);
    // Wait for exit animation to complete (300ms) before calling onDismiss
    setTimeout(() => {
      onDismiss();
    }, 300);
  }, [onDismiss]);

  // Trigger confetti on mount
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // Delay confetti by 100ms after entrance animation starts for better visual impact
      const confettiTimeout = setTimeout(async () => {
        try {
          // Lazy-load canvas-confetti library
          const confettiModule = await import('canvas-confetti');
          const confetti = confettiModule.default;

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F97316', '#FCD34D', '#10B981', '#3B82F6'],
            ticks: 200,
            gravity: 1.2,
            scalar: 1.0,
          });
        } catch (error) {
          console.error('Failed to load confetti library:', error);
        }
      }, 100);

      return () => clearTimeout(confettiTimeout);
    }
  }, []);

  // Handle Escape key dismissal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  // Auto-dismiss timer
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  // Announce to screen readers
  useEffect(() => {
    announceToScreenReader(message);
  }, [message]);

  const icon = VARIANT_ICON_MAP[variant];
  const animationClass = isExiting ? styles.celebrationExit : styles.celebrationEnter;

  return (
    <div className={styles.backdrop}>
      <div
        className={`${styles.celebrationCard} ${animationClass}`}
        onClick={handleDismiss}
        role="alert"
        aria-live="polite"
        aria-label={message}
        tabIndex={0}
      >
        <div className={styles.icon}>{icon}</div>
        <div className={styles.message}>{message}</div>
      </div>
    </div>
  );
};
