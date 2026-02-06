import { useEffect, useState } from 'react';

import type { ProactivePrompt } from '@simple-todo/shared/types';

const API_BASE_URL = 'http://localhost:3001';

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

interface SSEHook {
  prompts: ProactivePrompt[];
  connectionState: ConnectionState;
  error: string | null;
}

/**
 * Custom hook to establish Server-Sent Events connection for real-time prompt delivery
 *
 * Connects to the /api/prompts/stream endpoint and listens for prompt events.
 * Handles automatic reconnection via EventSource's built-in behavior.
 * Each browser tab/window maintains its own independent SSE connection.
 *
 * Features:
 * - Automatic connection on mount
 * - Real-time prompt event reception
 * - Connection state tracking (connecting, connected, disconnected, error)
 * - Automatic reconnection with exponential backoff (EventSource default)
 * - Cleanup on unmount to prevent memory leaks
 *
 * @returns {SSEHook} Object with prompts array, connection state, and error
 *
 * @example
 * const { prompts, connectionState, error } = useSSE();
 *
 * useEffect(() => {
 *   if (prompts.length > 0) {
 *     const latestPrompt = prompts[prompts.length - 1];
 *     console.log('Received prompt:', latestPrompt);
 *   }
 * }, [prompts]);
 */
export function useSSE(): SSEHook {
  const [prompts, setPrompts] = useState<ProactivePrompt[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if EventSource is supported
    if (typeof EventSource === 'undefined') {
      setConnectionState('error');
      setError('EventSource not supported in this browser');
      console.error('SSE not supported - EventSource API not available');
      return;
    }

    // Create EventSource connection
    const eventSource = new EventSource(`${API_BASE_URL}/api/prompts/stream`);

    // Connection opened
    eventSource.addEventListener('open', () => {
      setConnectionState('connected');
      setError(null);
      console.log('SSE connection established');
    });

    // Listen for custom 'prompt' events
    eventSource.addEventListener('prompt', (event: MessageEvent) => {
      try {
        const prompt = JSON.parse(event.data) as ProactivePrompt;
        setPrompts((prev) => [...prev, prompt]);
        console.log('Received prompt via SSE:', prompt);
      } catch (err: unknown) {
        console.error('Failed to parse prompt event:', err);
        setError(err instanceof Error ? err.message : 'Failed to parse prompt');
      }
    });

    // Connection error (network issue, server restart, etc.)
    eventSource.addEventListener('error', (err: Event) => {
      console.error('SSE connection error:', err);

      // Check if connection is closed
      if (eventSource.readyState === EventSource.CLOSED) {
        setConnectionState('disconnected');
        setError('SSE connection closed');
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        setConnectionState('connecting');
        setError('SSE reconnecting...');
      } else {
        setConnectionState('error');
        setError('SSE connection error');
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('Closing SSE connection');
      eventSource.close();
      setConnectionState('disconnected');
    };
  }, []); // Empty dependency array - only connect once on mount

  return {
    prompts,
    connectionState,
    error,
  };
}
