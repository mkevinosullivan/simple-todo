import type React from 'react';

import styles from './CelebrationConfig.module.css';

interface CelebrationConfigProps {
  celebrationsEnabled: boolean;
  celebrationDurationSeconds: number;
  onUpdate: (enabled: boolean, duration: number) => void;
  onPreview: () => void;
}

/**
 * CelebrationConfig displays celebration preferences settings
 *
 * Features:
 * - Toggle to enable/disable celebrations
 * - Slider to adjust celebration duration (3-10 seconds)
 * - Preview button to test celebration display
 * - Keyboard accessible (Tab, Space, Arrow keys, Enter)
 * - Screen reader compatible with ARIA labels
 *
 * @example
 * <CelebrationConfig
 *   celebrationsEnabled={true}
 *   celebrationDurationSeconds={7}
 *   onUpdate={(enabled, duration) => updateConfig(enabled, duration)}
 *   onPreview={() => showPreview()}
 * />
 */
export const CelebrationConfig: React.FC<CelebrationConfigProps> = ({
  celebrationsEnabled,
  celebrationDurationSeconds,
  onUpdate,
  onPreview,
}) => {
  const handleToggleChange = (newEnabled: boolean): void => {
    onUpdate(newEnabled, celebrationDurationSeconds);
  };

  const handleDurationChange = (newDuration: number): void => {
    onUpdate(celebrationsEnabled, newDuration);
  };

  return (
    <section className={styles.celebrationConfig} aria-labelledby="celebration-heading">
      <h2 id="celebration-heading" className={styles.heading}>
        Celebration Preferences
      </h2>

      <p className={styles.benefit}>
        Celebrations provide positive reinforcement to build momentum
      </p>

      <div className={styles.control}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            role="switch"
            aria-checked={celebrationsEnabled}
            checked={celebrationsEnabled}
            onChange={(e) => handleToggleChange(e.target.checked)}
            className={styles.toggle}
          />
          <span className={styles.toggleText}>Enable celebrations</span>
        </label>
        <p className={styles.description}>Show encouraging animations when completing tasks</p>
      </div>

      <div className={styles.control}>
        <label htmlFor="celebration-duration" className={styles.label}>
          Celebration duration
        </label>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            id="celebration-duration"
            min="3"
            max="10"
            step="1"
            value={celebrationDurationSeconds}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            disabled={!celebrationsEnabled}
            aria-label="Celebration duration in seconds"
            aria-valuemin={3}
            aria-valuemax={10}
            aria-valuenow={celebrationDurationSeconds}
            aria-disabled={!celebrationsEnabled}
            className={styles.slider}
          />
          <span className={styles.sliderValue}>{celebrationDurationSeconds} seconds</span>
        </div>
        <p className={styles.description}>
          How long celebrations display before auto-dismissing
        </p>
      </div>

      <button
        onClick={onPreview}
        disabled={!celebrationsEnabled}
        aria-label="Preview celebration animation"
        aria-disabled={!celebrationsEnabled}
        className={styles.previewButton}
      >
        Preview Celebration
      </button>
    </section>
  );
};
