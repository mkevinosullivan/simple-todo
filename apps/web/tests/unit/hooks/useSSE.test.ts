import type { ProactivePrompt } from '@simple-todo/shared/types';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSSE } from '../../../src/hooks/useSSE';

// Mock EventSource
class MockEventSource {
  url: string;
  listeners: Map<string, Array<(event: Event | MessageEvent) => void>>;
  readyState: number;
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  constructor(url: string) {
    this.url = url;
    this.listeners = new Map();
    this.readyState = MockEventSource.CONNECTING;

    // Simulate connection opening after a short delay
    setTimeout(() => {
      this.readyState = MockEventSource.OPEN;
      this.triggerEvent('open', new Event('open'));
    }, 10);
  }

  addEventListener(event: string, listener: (event: Event | MessageEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(listener);
  }

  removeEventListener(event: string, listener: (event: Event | MessageEvent) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  close(): void {
    this.readyState = MockEventSource.CLOSED;
  }

  // Helper method to simulate events
  triggerEvent(eventType: string, event: Event | MessageEvent): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(event));
    }

    // Also call specific handler if set
    if (eventType === 'open' && this.onopen) {
      this.onopen(event as Event);
    } else if (eventType === 'error' && this.onerror) {
      this.onerror(event as Event);
    } else if (eventType === 'message' && this.onmessage) {
      this.onmessage(event as MessageEvent);
    }
  }

  // Helper method to simulate receiving a prompt
  simulatePrompt(prompt: ProactivePrompt): void {
    const event = new MessageEvent('prompt', {
      data: JSON.stringify(prompt),
    });
    this.triggerEvent('prompt', event);
  }
}

describe('useSSE', () => {
  let mockEventSource: MockEventSource | null = null;

  beforeEach(() => {
    // Mock EventSource in global scope
    global.EventSource = vi.fn((url: string) => {
      mockEventSource = new MockEventSource(url);
      return mockEventSource as unknown as EventSource;
    }) as unknown as typeof EventSource;

    // Add static constants to mock
    (global.EventSource as unknown as typeof MockEventSource).CONNECTING = MockEventSource.CONNECTING;
    (global.EventSource as unknown as typeof MockEventSource).OPEN = MockEventSource.OPEN;
    (global.EventSource as unknown as typeof MockEventSource).CLOSED = MockEventSource.CLOSED;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockEventSource = null;
  });

  it('should initialize with connecting state', () => {
    const { result } = renderHook(() => useSSE());

    expect(result.current.connectionState).toBe('connecting');
    expect(result.current.prompts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should connect to SSE endpoint on mount', () => {
    renderHook(() => useSSE());

    expect(global.EventSource).toHaveBeenCalledWith('http://localhost:3001/api/prompts/stream');
  });

  it('should update connection state to connected when connection opens', async () => {
    const { result } = renderHook(() => useSSE());

    // Wait for connection to open
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    expect(result.current.error).toBeNull();
  });

  it('should receive and parse prompt events', async () => {
    const { result } = renderHook(() => useSSE());

    const testPrompt: ProactivePrompt = {
      taskId: '123e4567-e89b-12d3-a456-426614174000',
      taskText: 'Test task',
      promptedAt: '2026-02-05T14:30:00.000Z',
    };

    // Wait for connection to establish
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    // Simulate receiving a prompt event
    mockEventSource?.simulatePrompt(testPrompt);

    // Wait for prompt to be added to state
    await waitFor(() => {
      expect(result.current.prompts).toHaveLength(1);
    });

    expect(result.current.prompts[0]).toEqual(testPrompt);
  });

  it('should accumulate multiple prompts', async () => {
    const { result } = renderHook(() => useSSE());

    const prompt1: ProactivePrompt = {
      taskId: '111e1111-e11b-11d1-a111-111111111111',
      taskText: 'First task',
      promptedAt: '2026-02-05T14:30:00.000Z',
    };

    const prompt2: ProactivePrompt = {
      taskId: '222e2222-e22b-22d2-a222-222222222222',
      taskText: 'Second task',
      promptedAt: '2026-02-05T15:30:00.000Z',
    };

    // Wait for connection
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    // Simulate receiving prompts
    mockEventSource?.simulatePrompt(prompt1);
    mockEventSource?.simulatePrompt(prompt2);

    // Wait for prompts to be added
    await waitFor(() => {
      expect(result.current.prompts).toHaveLength(2);
    });

    expect(result.current.prompts[0]).toEqual(prompt1);
    expect(result.current.prompts[1]).toEqual(prompt2);
  });

  it('should handle connection errors', async () => {
    const { result } = renderHook(() => useSSE());

    // Wait for initial connection
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    // Simulate connection error
    if (mockEventSource) {
      mockEventSource.readyState = MockEventSource.CLOSED;
      mockEventSource.triggerEvent('error', new Event('error'));
    }

    // Wait for error state
    await waitFor(() => {
      expect(result.current.connectionState).toBe('disconnected');
    });

    expect(result.current.error).toBe('SSE connection closed');
  });

  it('should close connection on unmount', async () => {
    const { unmount } = renderHook(() => useSSE());

    // Wait for connection
    await waitFor(() => {
      expect(mockEventSource?.readyState).toBe(MockEventSource.OPEN);
    });

    const closeSpy = vi.spyOn(mockEventSource!, 'close');

    unmount();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should handle EventSource not supported', () => {
    // Remove EventSource from global
    const originalEventSource = global.EventSource;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).EventSource;

    const { result } = renderHook(() => useSSE());

    expect(result.current.connectionState).toBe('error');
    expect(result.current.error).toBe('EventSource not supported in this browser');

    // Restore EventSource
    global.EventSource = originalEventSource;
  });

  it('should handle malformed prompt data gracefully', async () => {
    const { result } = renderHook(() => useSSE());

    // Wait for connection
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    // Simulate receiving malformed data
    const malformedEvent = new MessageEvent('prompt', {
      data: 'not valid json',
    });
    mockEventSource?.triggerEvent('prompt', malformedEvent);

    // Error should be set
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Prompts should remain empty
    expect(result.current.prompts).toHaveLength(0);
  });

  it('should handle reconnection state', async () => {
    const { result } = renderHook(() => useSSE());

    // Wait for initial connection
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    // Simulate reconnection state
    if (mockEventSource) {
      mockEventSource.readyState = MockEventSource.CONNECTING;
      mockEventSource.triggerEvent('error', new Event('error'));
    }

    // Wait for reconnecting state
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connecting');
    });

    expect(result.current.error).toBe('SSE reconnecting...');
  });
});
