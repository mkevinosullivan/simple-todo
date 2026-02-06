import { useEffect, useState } from 'react';
import type React from 'react';

import type { Config } from '@simple-todo/shared/types';
import { DEFAULT_CONFIG } from '@simple-todo/shared/types';

import { FirstLaunchScreen } from './components/FirstLaunchScreen.js';
import { ConfigProvider } from './context/ConfigContext.js';
import { TaskProvider } from './context/TaskContext.js';
import { useSSE } from './hooks/useSSE.js';
import { getConfig, updateWipLimit } from './services/config.js';
import { TaskListView } from './views/TaskListView.js';

import './styles/global.css';

/**
 * Loading spinner component
 */
const LoadingSpinner: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontSize: '1.5rem',
      color: '#6b7280',
    }}
  >
    Loading...
  </div>
);

/**
 * Error view component with retry button
 */
const ErrorView: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
    }}
  >
    <p style={{ color: '#991b1b', marginBottom: '1rem', fontSize: '1.125rem' }}>{message}</p>
    <button
      onClick={onRetry}
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        cursor: 'pointer',
      }}
      type="button"
    >
      Retry
    </button>
  </div>
);

const App: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Establish SSE connection for real-time prompt delivery (Story 4.2)
  const { prompts, connectionState, error: sseError } = useSSE();

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const configData = await getConfig();
      setConfig(configData);
    } catch (err) {
      setError('Failed to load configuration. Please refresh the page.');
      // After 3 retries, show FirstLaunchScreen as safer default
      if (retryCount >= 2) {
        // Use DEFAULT_CONFIG as fallback
        setConfig({ ...DEFAULT_CONFIG });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log SSE connection state changes
  useEffect(() => {
    console.log('SSE connection state:', connectionState);
    if (sseError) {
      console.error('SSE error:', sseError);
    }
  }, [connectionState, sseError]);

  // Log received prompts (MVP - Story 4.3 will add PromptToast UI)
  useEffect(() => {
    if (prompts.length > 0) {
      const latestPrompt = prompts[prompts.length - 1];
      console.log('📬 Received prompt via SSE:', latestPrompt);
      console.log(`Task: "${latestPrompt.taskText}" (ID: ${latestPrompt.taskId})`);
      console.log(`Prompted at: ${latestPrompt.promptedAt}`);
    }
  }, [prompts]);

  const handleSetupComplete = async (wipLimit: number) => {
    await updateWipLimit(wipLimit);
    setConfig((prev) => (prev ? { ...prev, wipLimit, hasCompletedSetup: true } : null));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && retryCount < 3) {
    return (
      <ErrorView
        message={error}
        onRetry={() => {
          setRetryCount((prev) => prev + 1);
          void fetchConfig();
        }}
      />
    );
  }

  return (
    <ConfigProvider initialConfig={config || undefined}>
      {config?.hasCompletedSetup ? (
        <TaskProvider>
          <TaskListView />
        </TaskProvider>
      ) : (
        <FirstLaunchScreen onComplete={handleSetupComplete} />
      )}
    </ConfigProvider>
  );
};

export default App;
