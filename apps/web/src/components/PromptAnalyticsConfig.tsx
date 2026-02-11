import type React from 'react';

import type { PromptAnalytics } from '@simple-todo/shared/types';

import styles from './PromptAnalyticsConfig.module.css';

interface PromptAnalyticsConfigProps {
  analytics: PromptAnalytics | null;
  loading: boolean;
}

/**
 * PromptAnalyticsConfig displays prompt analytics and engagement metrics
 *
 * Features:
 * - Response rate with target indicator
 * - Breakdown by response type (completed, dismissed, snoozed, timed out)
 * - Average response time
 * - Loading and empty states
 * - Keyboard accessible
 * - Screen reader compatible with ARIA labels
 *
 * @example
 * <PromptAnalyticsConfig
 *   analytics={promptAnalytics}
 *   loading={false}
 * />
 */
export const PromptAnalyticsConfig: React.FC<PromptAnalyticsConfigProps> = ({
  analytics,
  loading,
}) => {
  return (
    <section className={styles.promptAnalyticsConfig} aria-labelledby="prompt-analytics-heading">
      <h2 id="prompt-analytics-heading" className={styles.heading}>
        Prompt Analytics
      </h2>
      <p className={styles.description}>Track your engagement with proactive task prompts.</p>

      {loading ? (
        <p className={styles.loadingText}>Loading analytics...</p>
      ) : analytics ? (
        <div className={styles.analyticsGrid}>
          <div className={styles.analyticsStat}>
            <span className={styles.statsLabel}>Response Rate</span>
            <span className={styles.statsValue}>{analytics.promptResponseRate.toFixed(1)}%</span>
            <span className={styles.statsHint}>
              {analytics.promptResponseRate >= 40 ? '✓ Exceeds 40% target' : 'Target: ≥40%'}
            </span>
          </div>

          <div className={styles.analyticsStat}>
            <span className={styles.statsLabel}>Completed</span>
            <span className={styles.statsValue}>{analytics.responseBreakdown.complete}</span>
          </div>

          <div className={styles.analyticsStat}>
            <span className={styles.statsLabel}>Dismissed</span>
            <span className={styles.statsValue}>{analytics.responseBreakdown.dismiss}</span>
          </div>

          <div className={styles.analyticsStat}>
            <span className={styles.statsLabel}>Snoozed</span>
            <span className={styles.statsValue}>{analytics.responseBreakdown.snooze}</span>
          </div>

          <div className={styles.analyticsStat}>
            <span className={styles.statsLabel}>Timed Out</span>
            <span className={styles.statsValue}>{analytics.responseBreakdown.timeout}</span>
          </div>

          <div className={styles.analyticsStat}>
            <span className={styles.statsLabel}>Avg Response Time</span>
            <span className={styles.statsValue}>
              {analytics.averageResponseTime > 0
                ? `${(analytics.averageResponseTime / 1000).toFixed(1)}s`
                : 'N/A'}
            </span>
          </div>
        </div>
      ) : (
        <p className={styles.noDataText}>No prompt data available yet.</p>
      )}
    </section>
  );
};
