import type React from 'react';

import styles from './QuickStartGuide.module.css';

/**
 * Props for QuickStartGuide component
 */
interface QuickStartGuideProps {
  /** Current WIP limit from config (default: 7) */
  wipLimit: number;
  /** Callback when user clicks "Got it!" button */
  onDismiss: () => void;
  /** Optional: Force show guide even if hasCompletedSetup is true (for re-access from Help menu in Story 3.11) */
  forceShow?: boolean;
}

/**
 * QuickStartGuide Component
 *
 * First-time user empty state with quick start guide that educates new users
 * about the app's core features (WIP Limits, Celebrations, Proactive Prompts)
 * and provides step-by-step instructions to get started.
 *
 * @param props - Component props
 * @returns QuickStartGuide component
 */
export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  wipLimit,
  onDismiss,
}) => {
  return (
    <section
      className={styles.quickStartGuide}
      aria-labelledby="quick-start-heading"
    >
      <h1 id="quick-start-heading" className={styles.heading}>
        Welcome! 🎉
      </h1>
      <p className={styles.subheading}>
        This app helps you stay focused with smart task management.
      </p>

      <section aria-labelledby="features-heading" className={styles.section}>
        <h2 id="features-heading" className={styles.sectionHeading}>
          Core Features
        </h2>
        <ul className={styles.featureList}>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon} aria-hidden="true">
              🎯
            </span>
            <div>
              <h3 className={styles.featureTitle}>WIP Limits</h3>
              <p className={styles.featureDescription}>
                Limit active tasks to maintain focus. Research shows fewer tasks
                = better completion rates.
              </p>
            </div>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon} aria-hidden="true">
              🎉
            </span>
            <div>
              <h3 className={styles.featureTitle}>Celebrations</h3>
              <p className={styles.featureDescription}>
                Get positive reinforcement when you complete tasks. Build
                momentum with encouragement.
              </p>
            </div>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon} aria-hidden="true">
              💬
            </span>
            <div>
              <h3 className={styles.featureTitle}>
                Proactive Prompts (Coming Soon)
              </h3>
              <p className={styles.featureDescription}>
                The app will gently remind you about tasks when you're ready.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section aria-labelledby="steps-heading" className={styles.section}>
        <h2 id="steps-heading" className={styles.sectionHeading}>
          Getting Started
        </h2>
        <ol className={styles.stepsList}>
          <li className={styles.step}>Add your first task above</li>
          <li className={styles.step}>Complete it to see a celebration</li>
          <li className={styles.step}>
            Your WIP limit is set to {wipLimit} tasks
          </li>
        </ol>
      </section>

      <button
        className={styles.dismissButton}
        onClick={onDismiss}
        aria-label="Dismiss quick start guide and get started"
      >
        Got it!
      </button>
    </section>
  );
};
