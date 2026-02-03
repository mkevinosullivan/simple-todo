import { useState } from 'react';
import type React from 'react';

import type { Config } from '@simple-todo/shared/types';

import { markSetupCompleted } from '../services/config.js';

import styles from './EmptyState.module.css';
import { QuickStartGuide } from './QuickStartGuide.js';

interface EmptyStateProps {
  config: Config;
  onConfigUpdate: (newConfig: Config) => void;
}

/**
 * EmptyState displays when no active tasks exist
 *
 * Features:
 * - Shows QuickStartGuide for first-time users (hasCompletedSetup = false)
 * - Shows simple encouraging message for returning users (hasCompletedSetup = true)
 * - Calming visual design
 * - Responsive for all screen sizes
 *
 * @example
 * <EmptyState config={config} onConfigUpdate={handleConfigUpdate} />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ config, onConfigUpdate }) => {
  const [error, setError] = useState<string | null>(null);

  const handleDismissQuickStart = async () => {
    try {
      setError(null);
      const updatedConfig = await markSetupCompleted();
      onConfigUpdate(updatedConfig);
    } catch (err) {
      console.error('Failed to update setup flag:', err);
      setError('Failed to save. Please try again.');
      // Optionally show error toast
    }
  };

  // First-time user: Show QuickStartGuide
  if (!config.hasCompletedSetup) {
    return (
      <div className={styles.emptyState}>
        <QuickStartGuide wipLimit={config.wipLimit} onDismiss={handleDismissQuickStart} />
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    );
  }

  // Returning user: Show simple empty state
  // TODO Story 3.7: Replace with InboxZeroState component
  return (
    <div className={styles.emptyState}>
      <p className={styles.message}>No tasks yet. Add your first task to get started!</p>
    </div>
  );
};
