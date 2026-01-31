import { useCallback, useEffect, useState } from 'react';

import type { CelebrationMessage } from '@simple-todo/shared/types';

interface CelebrationQueueHook {
  currentCelebration: CelebrationMessage | null;
  queueCelebration: (message: CelebrationMessage) => void;
  dismissCelebration: () => void;
}

/**
 * Custom hook to manage celebration message queue
 *
 * Ensures only one celebration displays at a time. When multiple task completions
 * happen in quick succession, celebrations are queued and shown sequentially.
 *
 * Features:
 * - Queue management: maintains array of pending celebrations
 * - Sequential display: shows one celebration at a time
 * - Auto-advance: shows next celebration after dismissal with 200ms delay
 * - Rapid completion optimization: reduces duration to 3 seconds when queue has 3+ items
 *
 * @example
 * const { currentCelebration, queueCelebration, dismissCelebration } = useCelebrationQueue();
 *
 * // Queue a celebration
 * queueCelebration({ message: "Great job!", variant: "supportive", duration: 7000 });
 *
 * // Dismiss current celebration
 * dismissCelebration();
 */
export function useCelebrationQueue(): CelebrationQueueHook {
  const [queue, setQueue] = useState<CelebrationMessage[]>([]);
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationMessage | null>(null);

  // Add celebration to queue
  const queueCelebration = useCallback((message: CelebrationMessage) => {
    setQueue((prevQueue) => [...prevQueue, message]);
  }, []);

  // Dismiss current celebration and show next after delay
  const dismissCelebration = useCallback(() => {
    setCurrentCelebration(null);

    // Wait 200ms before showing next celebration
    setTimeout(() => {
      setQueue((prevQueue) => {
        if (prevQueue.length > 0) {
          const [next, ...rest] = prevQueue;

          // If queue has 3+ items, reduce display duration for rapid completion flow
          const adjustedDuration =
            rest.length >= 2 ? 3000 : next.duration || 7000;

          setCurrentCelebration({
            ...next,
            duration: adjustedDuration,
          });

          return rest;
        }
        return prevQueue;
      });
    }, 200);
  }, []);

  // Show first celebration when queue has items and no celebration is currently showing
  useEffect(() => {
    if (currentCelebration === null && queue.length > 0) {
      const [next, ...rest] = queue;

      // If queue has 3+ items, reduce display duration for rapid completion flow
      const adjustedDuration = rest.length >= 2 ? 3000 : next.duration || 7000;

      setCurrentCelebration({
        ...next,
        duration: adjustedDuration,
      });

      setQueue(rest);
    }
  }, [currentCelebration, queue]);

  return {
    currentCelebration,
    queueCelebration,
    dismissCelebration,
  };
}
