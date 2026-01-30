import { useState } from 'react';

import { updateWipLimit } from '../services/config.js';

import styles from './FirstLaunchScreen.module.css';

export interface FirstLaunchScreenProps {
  onComplete: (wipLimit: number) => Promise<void>;
}

/**
 * FirstLaunchScreen displays the initial onboarding flow
 *
 * Features:
 * - Welcomes new users with app explanation
 * - Guides WIP limit selection (5-10)
 * - Default highlighted: 7
 * - Keyboard accessible (Tab, Enter, Space)
 * - Screen reader compatible with ARIA labels
 *
 * @example
 * <FirstLaunchScreen
 *   onComplete={async (limit) => {
 *     await updateWipLimit(limit);
 *     setConfig(prev => ({ ...prev, hasCompletedSetup: true }));
 *   }}
 * />
 */
export const FirstLaunchScreen: React.FC<FirstLaunchScreenProps> = ({ onComplete }) => {
  const [selectedLimit, setSelectedLimit] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetStarted = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onComplete(selectedLimit);
      // Parent component handles navigation after successful completion
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDefaults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onComplete(7); // Default WIP limit
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, limit: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedLimit(limit);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <h1 className={styles.heading}>Welcome to Simple To-Do App!</h1>

        {/* Feature Icons */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.icon} aria-hidden="true">
              🎯
            </span>
            <span className={styles.featureText}>Focus through limits</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon} aria-hidden="true">
              🎉
            </span>
            <span className={styles.featureText}>Celebrate progress</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon} aria-hidden="true">
              ⏰
            </span>
            <span className={styles.featureText}>Proactive prompts</span>
          </div>
        </div>

        {/* Divider */}
        <hr className={styles.divider} />

        {/* Explanation */}
        <p className={styles.explanation}>
          This app helps you focus by limiting how many tasks you can have active at once
        </p>

        {/* WIP Limit Selector */}
        <div className={styles.selectorSection}>
          <label className={styles.prompt}>How many active tasks feel manageable for you?</label>
          <fieldset className={styles.limitButtons} role="radiogroup" aria-label="Select WIP limit">
            {[5, 6, 7, 8, 9, 10].map((limit) => (
              <button
                key={limit}
                type="button"
                role="radio"
                aria-checked={selectedLimit === limit}
                aria-label={`Select WIP limit ${limit}`}
                className={`${styles.limitButton} ${selectedLimit === limit ? styles.selected : ''} ${limit === 7 ? styles.default : ''}`}
                onClick={() => setSelectedLimit(limit)}
                onKeyDown={(e) => handleKeyDown(e, limit)}
                disabled={isLoading}
                tabIndex={0}
              >
                {limit}
              </button>
            ))}
          </fieldset>
          <p className={styles.helperText}>
            Most users find 7 tasks works well. You can change this later in Settings.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {/* Primary CTA */}
        <button
          className={styles.primaryButton}
          onClick={handleGetStarted}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? 'Saving...' : 'Get Started'}
        </button>

        {/* Secondary CTA */}
        <button
          className={styles.secondaryButton}
          onClick={handleUseDefaults}
          disabled={isLoading}
          type="button"
        >
          Use Default Settings
        </button>

        {/* Pilot Feedback Message */}
        <p className={styles.pilotMessage}>
          This is a pilot version. We&apos;d love your feedback - find the Feedback link in
          Settings!
        </p>
      </div>
    </div>
  );
};
