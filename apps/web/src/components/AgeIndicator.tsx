import { useEffect, useRef, useState } from 'react';

import type { AgeCategory } from '@simple-todo/shared/utils';
import { TaskHelpers } from '@simple-todo/shared/utils';

import { formatRelativeTime } from '../utils/formatRelativeTime.js';
import styles from './AgeIndicator.module.css';

interface AgeIndicatorProps {
  ageCategory: AgeCategory;
  createdAt: string;
  className?: string;
}

/**
 * AgeIndicator component displays a colored circle badge indicating task age
 * - Fresh tasks (<24h): No indicator displayed
 * - Recent tasks (1-3d): Light blue badge
 * - Aging tasks (3-7d): Yellow badge
 * - Old tasks (7-14d): Orange badge
 * - Stale tasks (14+d): Red badge
 *
 * Includes tooltip showing relative time and accessibility support
 */
export function AgeIndicator({
  ageCategory,
  createdAt,
  className = '',
}: AgeIndicatorProps): JSX.Element | null {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const previousCategoryRef = useRef<AgeCategory>(ageCategory);

  // Validate timestamp - if invalid, hide indicator
  if (!TaskHelpers.isValidISOTimestamp(createdAt)) {
    console.warn('AgeIndicator: Invalid timestamp', createdAt);
    return null;
  }

  // Calculate age for tooltip
  const age = new Date(createdAt).getTime();
  const ageMs = Date.now() - age;
  const relativeTime = formatRelativeTime(ageMs);

  // Don't show indicator for fresh tasks (per AC4)
  if (ageCategory === 'fresh') {
    return null;
  }

  // Detect category change and trigger animation
  useEffect(() => {
    if (
      previousCategoryRef.current !== ageCategory &&
      previousCategoryRef.current !== null
    ) {
      setShouldAnimate(true);

      // Remove animation class after completion to allow re-triggering
      const timer = setTimeout(() => setShouldAnimate(false), 400);
      return () => clearTimeout(timer);
    }

    previousCategoryRef.current = ageCategory;
  }, [ageCategory]);

  // Get color for age category
  const getColorForCategory = (category: AgeCategory): string => {
    switch (category) {
      case 'recent':
        return '#60A5FA'; // Light blue
      case 'aging':
        return '#FBBF24'; // Yellow
      case 'old':
        return '#F97316'; // Orange
      case 'stale':
        return '#F43F5E'; // Red
      default:
        return 'transparent';
    }
  };

  const badgeColor = getColorForCategory(ageCategory);
  const ariaLabel = `Created ${relativeTime}`;

  return (
    <div
      className={`${styles.ageIndicator} ${shouldAnimate ? styles.agePulse : ''} ${className}`}
      title={ariaLabel}
      aria-label={ariaLabel}
      role="img"
      tabIndex={0}
    >
      <div
        className={styles.ageBadge}
        style={{ backgroundColor: badgeColor }}
      />
    </div>
  );
}
