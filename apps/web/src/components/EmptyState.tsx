import { useState, useEffect } from 'react';
import type React from 'react';

import { useConfig } from '../context/ConfigContext.js';
import { getTaskStats } from '../services/analytics.js';
import { markSetupCompleted } from '../services/config.js';

import styles from './EmptyState.module.css';
import { InboxZeroState } from './InboxZeroState.js';
import { QuickStartGuide } from './QuickStartGuide.js';

/**
 * EmptyState displays when no active tasks exist
 *
 * Features:
 * - Shows QuickStartGuide for first-time users (hasCompletedSetup = false)
 * - Shows InboxZeroState for returning users (hasCompletedSetup = true)
 * - Fetches analytics data to show task statistics
 * - Calming visual design
 * - Responsive for all screen sizes
 *
 * @example
 * <EmptyState />
 */
export const EmptyState: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ completedCount: 0, activeCount: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch analytics data when component mounts
  useEffect(() => {
    async function fetchStats(): Promise<void> {
      try {
        const data = await getTaskStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // GRACEFUL DEGRADATION: Show InboxZeroState with 0 count
        // Celebration is more important than showing exact stats
        setStats({ completedCount: 0, activeCount: 0 });
      } finally {
        setLoading(false);
      }
    }
    void fetchStats();
  }, []);

  const handleDismissQuickStart = (): void => {
    void (async () => {
      try {
        setError(null);
        const updatedConfig = await markSetupCompleted();
        updateConfig(updatedConfig);
      } catch (err) {
        console.error('Failed to update setup flag:', err);
        setError('Failed to save. Please try again.');
        // Optionally show error toast
      }
    })();
  };

  const handleAddNewTask = (): void => {
    // Focus the task input field
    const taskInput = document.getElementById('task-input');
    taskInput?.focus();
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

  // Returning user: Show InboxZeroState
  if (loading) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.message}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.emptyState}>
      <InboxZeroState
        completedCount={stats.completedCount}
        onAddNewTask={handleAddNewTask}
        isFirstInboxZero={true} // TODO: Track repeated inbox zero achievements
      />
    </div>
  );
};
