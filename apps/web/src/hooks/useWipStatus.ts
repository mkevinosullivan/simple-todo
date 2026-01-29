import { useEffect, useState } from 'react';

import { getWipConfig } from '../services/config.js';
import { useTaskContext } from '../context/TaskContext.js';

/**
 * WIP Status Hook Return Type
 */
export interface WipStatus {
  limit: number;
  currentCount: number;
  canAddTask: boolean;
  hasSeenWIPLimitEducation: boolean;
  loading: boolean;
  error: Error | null;
  refreshLimit: () => void;
}

/**
 * useWipStatus - Custom hook for WIP limit status and enforcement
 *
 * Features:
 * - Fetches WIP limit from API once on mount
 * - Subscribes to TaskContext for automatic task count updates
 * - Calculates current count locally (no polling needed)
 * - Provides refreshLimit() to re-fetch limit after settings change
 * - Returns canAddTask flag based on current count vs limit
 *
 * @returns WIP status with limit, count, and canAddTask flag
 *
 * @example
 * const { limit, currentCount, canAddTask, loading, refreshLimit } = useWipStatus();
 *
 * if (!canAddTask) {
 *   console.log(`Cannot add task: ${currentCount}/${limit}`);
 * }
 *
 * // After user changes WIP limit in settings:
 * refreshLimit();
 */
export const useWipStatus = (): WipStatus => {
  const { tasks } = useTaskContext();
  const [limit, setLimit] = useState<number>(7);
  const [hasSeenWIPLimitEducation, setHasSeenWIPLimitEducation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches current WIP limit from API
   */
  const fetchLimit = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const config = await getWipConfig();
      setLimit(config.limit);
      setHasSeenWIPLimitEducation(config.hasSeenWIPLimitEducation);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load WIP limit'));
      console.error('Failed to fetch WIP limit:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load WIP limit on mount
   */
  useEffect(() => {
    void fetchLimit();
  }, []);

  /**
   * Calculate current count from TaskContext
   * Updates automatically when tasks change (no polling needed)
   */
  const currentCount = tasks.filter((t) => t.status === 'active').length;

  /**
   * Determine if new tasks can be added
   */
  const canAddTask = currentCount < limit;

  /**
   * Refresh limit from API (call after user changes settings)
   */
  const refreshLimit = (): void => {
    void fetchLimit();
  };

  return {
    limit,
    currentCount,
    canAddTask,
    hasSeenWIPLimitEducation,
    loading,
    error,
    refreshLimit,
  };
};
