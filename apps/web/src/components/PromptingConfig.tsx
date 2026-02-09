import type React from 'react';
import { useState } from 'react';

import { prompts } from '../services/prompts.js';

import styles from './PromptingConfig.module.css';

interface PromptingConfigProps {
  enabled: boolean;
  frequencyHours: number;
  nextPromptTime?: Date | null;
  onUpdate: (enabled: boolean, frequencyHours: number) => void;
}

/**
 * PromptingConfig displays proactive prompting preferences settings
 *
 * Features:
 * - Toggle to enable/disable proactive prompts
 * - Slider to adjust prompting frequency (1-6 hours)
 * - Dynamic explanation text showing current frequency
 * - Next prompt time display
 * - Test prompt button to preview prompts
 * - Keyboard accessible (Tab, Space, Arrow keys, Enter)
 * - Screen reader compatible with ARIA labels
 *
 * @example
 * <PromptingConfig
 *   enabled={true}
 *   frequencyHours={2.5}
 *   nextPromptTime={new Date()}
 *   onUpdate={(enabled, frequency) => updateConfig(enabled, frequency)}
 * />
 */
export const PromptingConfig: React.FC<PromptingConfigProps> = ({
  enabled,
  frequencyHours,
  nextPromptTime,
  onUpdate,
}) => {
  const [testButtonDisabled, setTestButtonDisabled] = useState(false);
  const [testButtonText, setTestButtonText] = useState('See a sample prompt');

  const handleToggleChange = (newEnabled: boolean): void => {
    onUpdate(newEnabled, frequencyHours);
  };

  const handleFrequencyChange = (newFrequency: number): void => {
    onUpdate(enabled, newFrequency);
  };

  const handleTestPrompt = async (): Promise<void> => {
    setTestButtonDisabled(true);
    setTestButtonText('Triggering prompt...');

    try {
      const prompt = await prompts.test();

      if (prompt === null) {
        setTestButtonText('Add a task first to test prompts');
        setTimeout(() => {
          setTestButtonText('See a sample prompt');
          setTestButtonDisabled(false);
        }, 3000);
      } else {
        setTestButtonText('Prompt sent!');
        setTimeout(() => {
          setTestButtonText('See a sample prompt');
          setTestButtonDisabled(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to trigger test prompt:', error);
      setTestButtonText('Failed to trigger prompt');
      setTimeout(() => {
        setTestButtonText('See a sample prompt');
        setTestButtonDisabled(false);
      }, 3000);
    }
  };

  /**
   * Formats the frequency hours for display
   */
  const formatFrequency = (hours: number): string => {
    if (hours === 1) return '1 hour';
    return `${hours} hours`;
  };

  /**
   * Calculates time remaining until next prompt
   */
  const getTimeUntilNextPrompt = (): string => {
    if (!enabled || !nextPromptTime) {
      return 'No upcoming prompt';
    }

    const now = new Date();
    const diffMs = nextPromptTime.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Prompt coming soon';
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours > 0) {
      return `Next prompt in approximately ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
    }

    return `Next prompt in approximately ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
  };

  return (
    <section className={styles.promptingConfig} aria-labelledby="prompting-heading">
      <h2 id="prompting-heading" className={styles.heading}>
        Proactive Prompts
      </h2>

      <div className={styles.control}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            role="switch"
            aria-checked={enabled}
            checked={enabled}
            onChange={(e) => handleToggleChange(e.target.checked)}
            className={styles.toggle}
          />
          <span className={styles.toggleText}>Enable proactive prompts</span>
        </label>
      </div>

      <div className={styles.control}>
        <label htmlFor="prompting-frequency" className={styles.label}>
          Prompt frequency
        </label>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            id="prompting-frequency"
            min="1"
            max="6"
            step="0.5"
            value={frequencyHours}
            onChange={(e) => handleFrequencyChange(Number(e.target.value))}
            disabled={!enabled}
            aria-label="Prompt frequency in hours"
            aria-valuemin={1}
            aria-valuemax={6}
            aria-valuenow={frequencyHours}
            aria-disabled={!enabled}
            className={styles.slider}
          />
          <span className={styles.sliderValue}>Every {formatFrequency(frequencyHours)}</span>
        </div>
        <p className={styles.description}>
          The app will suggest a task for you to complete every {formatFrequency(frequencyHours)} to
          help you make progress
        </p>
      </div>

      {enabled && nextPromptTime && (
        <div className={styles.nextPromptTime}>
          <p className={styles.nextPromptText}>{getTimeUntilNextPrompt()}</p>
        </div>
      )}

      <button
        onClick={handleTestPrompt}
        disabled={testButtonDisabled}
        aria-label="Test proactive prompt"
        aria-disabled={testButtonDisabled}
        className={styles.testButton}
      >
        {testButtonText}
      </button>
    </section>
  );
};
