import type React from 'react';

import type { WipConfig } from '../services/config.js';

import styles from './WipLimitConfig.module.css';

interface WipLimitConfigProps {
  wipConfig: WipConfig | null;
  sliderValue: number;
  onSliderChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage: string | null;
}

/**
 * WipLimitConfig displays WIP (Work In Progress) limit configuration settings
 *
 * Features:
 * - Shows current active task count
 * - Slider to adjust WIP limit (5-10 tasks)
 * - Visual feedback with large value display
 * - Help text explaining the purpose
 * - Error message display
 * - Keyboard accessible (Tab, Arrow keys, Enter)
 * - Screen reader compatible with ARIA labels
 *
 * @example
 * <WipLimitConfig
 *   wipConfig={config}
 *   sliderValue={7}
 *   onSliderChange={(e) => handleChange(e)}
 *   errorMessage={null}
 * />
 */
export const WipLimitConfig: React.FC<WipLimitConfigProps> = ({
  wipConfig,
  sliderValue,
  onSliderChange,
  errorMessage,
}) => {
  return (
    <section className={styles.wipLimitConfig} aria-labelledby="wip-limit-heading">
      <h2 id="wip-limit-heading" className={styles.heading}>
        WIP Limit Configuration
      </h2>

      {/* Current active task count */}
      {wipConfig && (
        <p className={styles.currentCount}>
          You currently have <strong>{wipConfig.currentCount}</strong> active tasks
        </p>
      )}

      {/* Slider label */}
      <label htmlFor="wip-limit-slider" className={styles.sliderLabel}>
        Work In Progress Limit (5-10 tasks)
      </label>

      {/* Slider value display */}
      <div className={styles.sliderValueDisplay}>
        <span className={styles.sliderValue}>{sliderValue}</span>
      </div>

      {/* Slider control */}
      <div className={styles.sliderContainer}>
        <span className={styles.sliderMinMax}>5</span>
        <input
          id="wip-limit-slider"
          type="range"
          min="5"
          max="10"
          value={sliderValue}
          onChange={onSliderChange}
          className={styles.slider}
          aria-label="Work In Progress Limit"
          aria-valuenow={sliderValue}
          aria-valuemin={5}
          aria-valuemax={10}
        />
        <span className={styles.sliderMinMax}>10</span>
      </div>

      {/* Explanation text */}
      <p className={styles.helpText}>
        Limits how many active tasks you can have at once. This helps prevent overwhelm.
      </p>

      {/* Error message */}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </section>
  );
};
