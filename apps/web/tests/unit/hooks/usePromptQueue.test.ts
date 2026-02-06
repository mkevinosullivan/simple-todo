import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { usePromptQueue } from '../../../src/hooks/usePromptQueue';
import { createTestPrompt } from '../../helpers/factories';

describe('usePromptQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with no current prompt', () => {
    const { result } = renderHook(() => usePromptQueue());

    expect(result.current.currentPrompt).toBeNull();
    expect(result.current.queuedCount).toBe(0);
  });

  it('should display first prompt immediately when queued', () => {
    const { result } = renderHook(() => usePromptQueue());
    const prompt = createTestPrompt({ taskText: 'First prompt' });

    act(() => {
      result.current.queuePrompt(prompt);
    });

    expect(result.current.currentPrompt).toEqual(prompt);
    expect(result.current.queuedCount).toBe(0);
  });

  it('should queue second prompt until first dismissed', () => {
    const { result } = renderHook(() => usePromptQueue());
    const prompt1 = createTestPrompt({ taskId: '1', taskText: 'First' });
    const prompt2 = createTestPrompt({ taskId: '2', taskText: 'Second' });

    act(() => {
      result.current.queuePrompt(prompt1);
      result.current.queuePrompt(prompt2);
    });

    expect(result.current.currentPrompt).toEqual(prompt1);
    expect(result.current.queuedCount).toBe(1);
  });

  it('should show next prompt after current is dismissed', async () => {
    const { result } = renderHook(() => usePromptQueue());
    const prompt1 = createTestPrompt({ taskId: '1', taskText: 'First' });
    const prompt2 = createTestPrompt({ taskId: '2', taskText: 'Second' });

    act(() => {
      result.current.queuePrompt(prompt1);
      result.current.queuePrompt(prompt2);
    });

    expect(result.current.currentPrompt).toEqual(prompt1);

    act(() => {
      result.current.dismissCurrent();
    });

    // Wait for transition delay (500ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    await waitFor(() => {
      expect(result.current.currentPrompt).toEqual(prompt2);
      expect(result.current.queuedCount).toBe(0);
    });
  });

  it('should prevent duplicate prompts with same taskId', () => {
    const { result } = renderHook(() => usePromptQueue());
    const prompt1 = createTestPrompt({ taskId: '123', taskText: 'First' });
    const prompt2 = createTestPrompt({ taskId: '123', taskText: 'Duplicate' });

    act(() => {
      result.current.queuePrompt(prompt1);
      result.current.queuePrompt(prompt2);
    });

    expect(result.current.currentPrompt).toEqual(prompt1);
    expect(result.current.queuedCount).toBe(0); // Duplicate not queued
  });

  it('should prevent duplicate taskId when current prompt has same taskId', () => {
    const { result } = renderHook(() => usePromptQueue());
    const prompt1 = createTestPrompt({ taskId: '123', taskText: 'First' });
    const prompt2 = createTestPrompt({ taskId: '456', taskText: 'Second' });
    const prompt3 = createTestPrompt({ taskId: '123', taskText: 'Duplicate' });

    act(() => {
      result.current.queuePrompt(prompt1);
      result.current.queuePrompt(prompt2);
      result.current.queuePrompt(prompt3);
    });

    expect(result.current.currentPrompt).toEqual(prompt1);
    expect(result.current.queuedCount).toBe(1); // Only prompt2 queued, prompt3 rejected
  });

  it('should handle multiple prompts in sequence', async () => {
    const { result } = renderHook(() => usePromptQueue());
    const prompt1 = createTestPrompt({ taskId: '1', taskText: 'First' });
    const prompt2 = createTestPrompt({ taskId: '2', taskText: 'Second' });
    const prompt3 = createTestPrompt({ taskId: '3', taskText: 'Third' });

    act(() => {
      result.current.queuePrompt(prompt1);
      result.current.queuePrompt(prompt2);
      result.current.queuePrompt(prompt3);
    });

    expect(result.current.currentPrompt).toEqual(prompt1);
    expect(result.current.queuedCount).toBe(2);

    // Dismiss first
    act(() => {
      result.current.dismissCurrent();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    await waitFor(() => {
      expect(result.current.currentPrompt).toEqual(prompt2);
      expect(result.current.queuedCount).toBe(1);
    });

    // Dismiss second
    act(() => {
      result.current.dismissCurrent();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    await waitFor(() => {
      expect(result.current.currentPrompt).toEqual(prompt3);
      expect(result.current.queuedCount).toBe(0);
    });

    // Dismiss third
    act(() => {
      result.current.dismissCurrent();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    await waitFor(() => {
      expect(result.current.currentPrompt).toBeNull();
      expect(result.current.queuedCount).toBe(0);
    });
  });

  it('should allow queuing new prompt after all dismissed', async () => {
    const { result } = renderHook(() => usePromptQueue());
    const prompt1 = createTestPrompt({ taskId: '1', taskText: 'First' });
    const prompt2 = createTestPrompt({ taskId: '2', taskText: 'Second' });

    // Queue and dismiss first
    act(() => {
      result.current.queuePrompt(prompt1);
    });

    expect(result.current.currentPrompt).toEqual(prompt1);

    act(() => {
      result.current.dismissCurrent();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    await waitFor(() => {
      expect(result.current.currentPrompt).toBeNull();
    });

    // Queue new prompt
    act(() => {
      result.current.queuePrompt(prompt2);
    });

    expect(result.current.currentPrompt).toEqual(prompt2);
  });

  it('should maintain stable queue order', () => {
    const { result } = renderHook(() => usePromptQueue());
    const prompt1 = createTestPrompt({ taskId: '1', taskText: 'First' });
    const prompt2 = createTestPrompt({ taskId: '2', taskText: 'Second' });
    const prompt3 = createTestPrompt({ taskId: '3', taskText: 'Third' });

    act(() => {
      result.current.queuePrompt(prompt1);
      result.current.queuePrompt(prompt2);
      result.current.queuePrompt(prompt3);
    });

    // Queue should maintain FIFO order
    expect(result.current.currentPrompt).toEqual(prompt1);
    expect(result.current.queuedCount).toBe(2);
  });

  it('should track queued count correctly', () => {
    const { result } = renderHook(() => usePromptQueue());
    const prompt1 = createTestPrompt({ taskId: '1' });
    const prompt2 = createTestPrompt({ taskId: '2' });
    const prompt3 = createTestPrompt({ taskId: '3' });
    const prompt4 = createTestPrompt({ taskId: '4' });

    expect(result.current.queuedCount).toBe(0);

    act(() => {
      result.current.queuePrompt(prompt1);
    });
    expect(result.current.queuedCount).toBe(0); // First goes to current

    act(() => {
      result.current.queuePrompt(prompt2);
    });
    expect(result.current.queuedCount).toBe(1);

    act(() => {
      result.current.queuePrompt(prompt3);
      result.current.queuePrompt(prompt4);
    });
    expect(result.current.queuedCount).toBe(3);
  });
});
