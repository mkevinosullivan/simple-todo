import type React from 'react';

import styles from './WIPCountIndicator.module.css';

export interface WIPCountIndicatorProps {
  currentCount: number;
  limit: number;
  onOpenSettings: () => void;
}

/**
 * WIPCountIndicator - Visual indicator of current WIP status
 *
 * Features:
 * - Displays "[N]/[limit]" format (e.g., "5/7")
 * - Color-coded by percentage: green (0-60%), yellow (60-90%), orange (90-100%)
 * - Tooltip on hover explaining WIP limit purpose
 * - Clickable to open settings modal
 * - Real-time updates when props change
 * - Fully keyboard accessible
 * - Screen reader compatible
 *
 * @example
 * <WIPCountIndicator
 *   currentCount={5}
 *   limit={7}
 *   onOpenSettings={() => setIsSettingsOpen(true)}
 * />
 */
export const WIPCountIndicator: React.FC<WIPCountIndicatorProps> = ({
  currentCount,
  limit,
  onOpenSettings,
}) => {

  /**
   * Calculate percentage and determine status level
   */
  const percentage = (currentCount / limit) * 100;
  const status =
    percentage <= 60 ? 'below-limit' : percentage <= 90 ? 'approaching-limit' : 'at-limit';

  /**
   * Determine status text for accessibility
   */
  const statusText =
    percentage <= 60
      ? 'below limit'
      : percentage < 100
        ? 'approaching limit'
        : 'at limit';

  /**
   * Handle click to open settings
   */
  const handleClick = (): void => {
    onOpenSettings();
  };

  /**
   * Handle keyboard Enter/Space to open settings
   */
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenSettings();
    }
  };

  return (
    <button
      type="button"
      className={`${styles.indicator} ${styles[status]}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="status"
      aria-label={`${currentCount} of ${limit} active tasks, ${statusText}`}
      title="Work In Progress limit helps you stay focused"
    >
      {currentCount}/{limit}
    </button>
  );
};
