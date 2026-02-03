import type { CelebrationMessage } from '@simple-todo/shared/types';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';


import { useCelebrationQueue } from '../../../src/hooks/useCelebrationQueue';

describe('useCelebrationQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with no current celebration', () => {
    const { result } = renderHook(() => useCelebrationQueue());

    expect(result.current.currentCelebration).toBeNull();
  });

  it('should show celebration when queued', () => {
    const { result } = renderHook(() => useCelebrationQueue());

    const celebration: CelebrationMessage = {
      message: 'Great job!',
      variant: 'supportive',
      duration: 7000,
    };

    act(() => {
      result.current.queueCelebration(celebration);
    });

    expect(result.current.currentCelebration).toEqual(celebration);
  });

  it('should queue multiple celebrations and show them one at a time', () => {
    const { result } = renderHook(() => useCelebrationQueue());

    const celebration1: CelebrationMessage = {
      message: 'First!',
      variant: 'enthusiastic',
      duration: 7000,
    };

    const celebration2: CelebrationMessage = {
      message: 'Second!',
      variant: 'supportive',
      duration: 7000,
    };

    act(() => {
      result.current.queueCelebration(celebration1);
      result.current.queueCelebration(celebration2);
    });

    // First celebration should be showing
    expect(result.current.currentCelebration?.message).toBe('First!');

    // Dismiss first celebration
    act(() => {
      result.current.dismissCelebration();
    });

    // Wait for 200ms delay before next celebration shows
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Second celebration should now be showing
    expect(result.current.currentCelebration?.message).toBe('Second!');
  });

  it('should dismiss current celebration and clear state', () => {
    const { result } = renderHook(() => useCelebrationQueue());

    const celebration: CelebrationMessage = {
      message: 'Great job!',
      variant: 'supportive',
      duration: 7000,
    };

    act(() => {
      result.current.queueCelebration(celebration);
    });

    expect(result.current.currentCelebration).toEqual(celebration);

    act(() => {
      result.current.dismissCelebration();
    });

    expect(result.current.currentCelebration).toBeNull();
  });

  it('should wait 200ms before showing next celebration after dismissal', () => {
    const { result } = renderHook(() => useCelebrationQueue());

    const celebration1: CelebrationMessage = {
      message: 'First!',
      variant: 'enthusiastic',
    };

    const celebration2: CelebrationMessage = {
      message: 'Second!',
      variant: 'supportive',
    };

    act(() => {
      result.current.queueCelebration(celebration1);
      result.current.queueCelebration(celebration2);
    });

    act(() => {
      result.current.dismissCelebration();
    });

    // Immediately after dismissal, should be null
    expect(result.current.currentCelebration).toBeNull();

    // After 100ms, still null (waiting for 200ms delay)
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.currentCelebration).toBeNull();

    // After 200ms total, next celebration should show
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.currentCelebration?.message).toBe('Second!');
  });

  it('should reduce duration to 3000ms when queue has 3+ items', () => {
    const { result } = renderHook(() => useCelebrationQueue());

    const celebration1: CelebrationMessage = {
      message: 'First!',
      variant: 'enthusiastic',
      duration: 7000,
    };

    const celebration2: CelebrationMessage = {
      message: 'Second!',
      variant: 'supportive',
      duration: 7000,
    };

    const celebration3: CelebrationMessage = {
      message: 'Third!',
      variant: 'motivational',
      duration: 7000,
    };

    const celebration4: CelebrationMessage = {
      message: 'Fourth!',
      variant: 'data-driven',
      duration: 7000,
    };

    act(() => {
      result.current.queueCelebration(celebration1);
      result.current.queueCelebration(celebration2);
      result.current.queueCelebration(celebration3);
      result.current.queueCelebration(celebration4);
    });

    // First celebration should have reduced duration (3+ items remaining in queue)
    expect(result.current.currentCelebration?.duration).toBe(3000);

    // Dismiss and advance to next
    act(() => {
      result.current.dismissCelebration();
      vi.advanceTimersByTime(200);
    });

    // Second celebration should also have reduced duration
    expect(result.current.currentCelebration?.duration).toBe(3000);

    // Dismiss and advance to next
    act(() => {
      result.current.dismissCelebration();
      vi.advanceTimersByTime(200);
    });

    // Third celebration should have normal duration (only 1 item left in queue)
    expect(result.current.currentCelebration?.duration).toBe(7000);
  });

  it('should use default duration of 7000ms when not specified', () => {
    const { result } = renderHook(() => useCelebrationQueue());

    const celebration: CelebrationMessage = {
      message: 'Great job!',
      variant: 'supportive',
      // No duration specified
    };

    act(() => {
      result.current.queueCelebration(celebration);
    });

    expect(result.current.currentCelebration?.duration).toBe(7000);
  });

  it('should handle empty queue gracefully after all celebrations dismissed', () => {
    const { result } = renderHook(() => useCelebrationQueue());

    const celebration: CelebrationMessage = {
      message: 'Great job!',
      variant: 'supportive',
    };

    act(() => {
      result.current.queueCelebration(celebration);
    });

    act(() => {
      result.current.dismissCelebration();
      vi.advanceTimersByTime(200);
    });

    expect(result.current.currentCelebration).toBeNull();

    // Should not error when dismissing with no celebration
    act(() => {
      result.current.dismissCelebration();
    });

    expect(result.current.currentCelebration).toBeNull();
  });

  it('should handle rapid queueing of celebrations', () => {
    const { result } = renderHook(() => useCelebrationQueue());

    const celebrations: CelebrationMessage[] = [
      { message: '1', variant: 'enthusiastic' },
      { message: '2', variant: 'supportive' },
      { message: '3', variant: 'motivational' },
      { message: '4', variant: 'data-driven' },
      { message: '5', variant: 'enthusiastic' },
    ];

    // Queue all celebrations rapidly
    act(() => {
      celebrations.forEach((celebration) => {
        result.current.queueCelebration(celebration);
      });
    });

    // First should be showing
    expect(result.current.currentCelebration?.message).toBe('1');

    // Dismiss and cycle through all
    for (let i = 1; i < celebrations.length; i++) {
      act(() => {
        result.current.dismissCelebration();
        vi.advanceTimersByTime(200);
      });

      expect(result.current.currentCelebration?.message).toBe(celebrations[i].message);
    }

    // Dismiss last one
    act(() => {
      result.current.dismissCelebration();
      vi.advanceTimersByTime(200);
    });

    expect(result.current.currentCelebration).toBeNull();
  });
});
