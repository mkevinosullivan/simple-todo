import type React from 'react';

import styles from './QuietHoursConfig.module.css';

interface QuietHoursConfigProps {
  enabled: boolean;
  startTime: string;
  endTime: string;
  onUpdate: (enabled: boolean, startTime: string, endTime: string) => void;
}

/**
 * QuietHoursConfig displays quiet hours preferences settings
 *
 * Features:
 * - Toggle to enable/disable quiet hours
 * - Time pickers for start and end times
 * - Validation warnings for edge cases
 * - Keyboard accessible (Tab, Space, Enter)
 * - Screen reader compatible with ARIA labels
 *
 * @example
 * <QuietHoursConfig
 *   enabled={true}
 *   startTime="22:00"
 *   endTime="08:00"
 *   onUpdate={(enabled, start, end) => updateConfig(enabled, start, end)}
 * />
 */
export const QuietHoursConfig: React.FC<QuietHoursConfigProps> = ({
  enabled,
  startTime,
  endTime,
  onUpdate,
}) => {
  return (
    <section className={styles.quietHoursConfig} aria-labelledby="quiet-hours-heading">
      <h2 id="quiet-hours-heading" className={styles.heading}>
        Quiet Hours
      </h2>
      <p className={styles.description}>Set times when you don't want to receive prompts</p>

      <div className={styles.control}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            role="switch"
            aria-checked={enabled}
            checked={enabled}
            onChange={(e) => onUpdate(e.target.checked, startTime, endTime)}
            className={styles.toggle}
          />
          <span className={styles.toggleText}>Enable quiet hours</span>
        </label>
      </div>

      <div className={styles.timePickerGroup}>
        <div className={styles.timePicker}>
          <label htmlFor="quiet-hours-start" className={styles.timePickerLabel}>
            Start time
          </label>
          <input
            id="quiet-hours-start"
            type="time"
            value={startTime}
            onChange={(e) => onUpdate(enabled, e.target.value, endTime)}
            disabled={!enabled}
            className={styles.timeInput}
          />
        </div>

        <div className={styles.timePicker}>
          <label htmlFor="quiet-hours-end" className={styles.timePickerLabel}>
            End time
          </label>
          <input
            id="quiet-hours-end"
            type="time"
            value={endTime}
            onChange={(e) => onUpdate(enabled, startTime, e.target.value)}
            disabled={!enabled}
            className={styles.timeInput}
          />
        </div>
      </div>

      <p className={styles.helperText}>
        Times use your local timezone. Prompts won't occur between these hours.
        {startTime === endTime && enabled && (
          <span className={styles.equalTimeWarning}>
            {' '}
            Equal times create a 24-hour quiet period (no prompts).
          </span>
        )}
      </p>

      {enabled && startTime !== endTime && (
        <p className={styles.exampleText}>
          Example: 22:00 to 08:00 means 10pm to 8am (midnight-spanning range)
        </p>
      )}
    </section>
  );
};
