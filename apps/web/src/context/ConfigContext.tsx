import { createContext, useContext, useEffect, useState } from 'react';
import type React from 'react';

import type { Config } from '@simple-todo/shared/types';
import { DEFAULT_CONFIG } from '@simple-todo/shared/types';

import { getConfig } from '../services/config.js';

interface ConfigContextValue {
  config: Config;
  updateConfig: (newConfig: Config) => void;
  refreshConfig: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

interface ConfigProviderProps {
  children: React.ReactNode;
  initialConfig?: Config;
}

/**
 * ConfigProvider - Provides application configuration to all child components
 *
 * Features:
 * - Loads config from API on mount
 * - Provides config update function
 * - Provides refresh function to reload config
 * - Loading and error states
 *
 * @example
 * <ConfigProvider>
 *   <App />
 * </ConfigProvider>
 */
export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children, initialConfig }) => {
  const [config, setConfig] = useState<Config>(initialConfig || DEFAULT_CONFIG);
  const [loading, setLoading] = useState(!initialConfig);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const configData = await getConfig();
      setConfig(configData);
    } catch (err) {
      setError('Failed to load configuration');
      console.error('Failed to load config:', err);
      // Fallback to default config
      if (!initialConfig) {
        setConfig(DEFAULT_CONFIG);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialConfig) {
      void fetchConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateConfig = (newConfig: Config) => {
    setConfig(newConfig);
  };

  const refreshConfig = async () => {
    await fetchConfig();
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, refreshConfig, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * useConfig hook - Access configuration context
 *
 * @returns Config context value with config, updateConfig, refreshConfig, loading, and error
 * @throws Error if used outside ConfigProvider
 *
 * @example
 * const { config, updateConfig } = useConfig();
 * console.log(config.wipLimit); // 7
 */
export const useConfig = (): ConfigContextValue => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
