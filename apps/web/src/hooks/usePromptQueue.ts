import { useCallback, useEffect, useState } from 'react';

import type { ProactivePrompt } from '@simple-todo/shared/types';

interface PromptQueueState {
  currentPrompt: ProactivePrompt | null;
  queuedCount: number;
  queuePrompt: (prompt: ProactivePrompt) => void;
  dismissCurrent: () => void;
}

/**
 * Custom hook for managing a queue of proactive prompts
 *
 * Ensures only one prompt is visible at a time. When the current prompt
 * is dismissed, the next prompt in queue is automatically displayed after
 * a short delay.
 *
 * Features:
 * - Prevents duplicate prompts for the same taskId
 * - Auto-shows next prompt after current dismissed (500ms delay)
 * - Tracks queue count for UI feedback
 *
 * @returns {PromptQueueState} Queue state and control methods
 *
 * @example
 * const { currentPrompt, queuePrompt, dismissCurrent, queuedCount } = usePromptQueue();
 *
 * // Add prompt to queue
 * queuePrompt({ taskId: '123', taskText: 'Buy groceries', promptedAt: '...' });
 *
 * // Dismiss current and show next
 * dismissCurrent();
 */
export function usePromptQueue(): PromptQueueState {
  const [currentPrompt, setCurrentPrompt] = useState<ProactivePrompt | null>(null);
  const [queue, setQueue] = useState<ProactivePrompt[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  /**
   * Add a prompt to the queue
   * Prevents duplicates based on taskId
   * If no current prompt, displays immediately
   */
  const queuePrompt = useCallback((prompt: ProactivePrompt): void => {
    setQueue((prevQueue) => {
      // Prevent duplicate taskId in queue
      const isDuplicate = prevQueue.some((p) => p.taskId === prompt.taskId);
      if (isDuplicate) {
        return prevQueue;
      }

      // Also check if current prompt has same taskId
      if (currentPrompt?.taskId === prompt.taskId) {
        return prevQueue;
      }

      return [...prevQueue, prompt];
    });
  }, [currentPrompt]);

  /**
   * Dismiss current prompt and show next after delay
   */
  const dismissCurrent = useCallback((): void => {
    setCurrentPrompt(null);
    setIsTransitioning(true);

    // Show next prompt after 500ms delay (UX breathing room)
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, []);

  /**
   * Auto-show next prompt when current is dismissed and transition complete
   * Also handles displaying first prompt immediately when queue is not empty
   */
  useEffect(() => {
    if (!currentPrompt && !isTransitioning && queue.length > 0) {
      const [nextPrompt, ...remainingQueue] = queue;
      setCurrentPrompt(nextPrompt);
      setQueue(remainingQueue);
    }
  }, [currentPrompt, isTransitioning, queue]);

  return {
    currentPrompt,
    queuedCount: queue.length,
    queuePrompt,
    dismissCurrent,
  };
}
