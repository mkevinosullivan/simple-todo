import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';

import type { Config } from '@simple-todo/shared/types';
import { DEFAULT_CONFIG } from '@simple-todo/shared/types';

import { ConfigProvider } from '../../src/context/ConfigContext.js';
import { SettingsModal } from '../../src/components/SettingsModal.js';
import { server } from '../helpers/testSetup.js';

// Mock useCelebrationQueue hook
vi.mock('../../src/hooks/useCelebrationQueue.js', () => ({
  useCelebrationQueue: () => ({
    currentCelebration: null,
    queueCelebration: vi.fn(),
    dismissCelebration: vi.fn(),
  }),
}));

describe('Celebration Config Flow', () => {
  // AC: 5 - Loading celebration config from API on mount
  it('should load celebration config from API when modal opens', async () => {
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
          celebrationsEnabled: true,
          celebrationDurationSeconds: 7,
        });
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({
          limit: 7,
          currentCount: 0,
          canAddTask: true,
          hasSeenWIPLimitEducation: false,
        });
      }),
      http.get('http://localhost:3001/api/config/celebrations', () => {
        return HttpResponse.json({
          celebrationsEnabled: true,
          celebrationDurationSeconds: 7,
        });
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /enable celebrations/i })).toBeChecked();
    });

    expect(screen.getByRole('slider', { name: /celebration duration/i })).toHaveValue('7');
  });

  // AC: 5 - Loading custom celebration config
  it('should load custom celebration config from API', async () => {
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
          celebrationsEnabled: false,
          celebrationDurationSeconds: 5,
        });
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({
          limit: 7,
          currentCount: 0,
          canAddTask: true,
          hasSeenWIPLimitEducation: false,
        });
      }),
      http.get('http://localhost:3001/api/config/celebrations', () => {
        return HttpResponse.json({
          celebrationsEnabled: false,
          celebrationDurationSeconds: 5,
        });
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /enable celebrations/i })).not.toBeChecked();
    });

    expect(screen.getByRole('slider', { name: /celebration duration/i })).toHaveValue('5');
  });

  // AC: 5, 8 - Saving celebration config to API (requires Save Changes button click)
  it('should save celebration config when toggling celebrations off', async () => {
    let savedConfig: { celebrationsEnabled: boolean; celebrationDurationSeconds: number } | null = null;

    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
          celebrationsEnabled: true,
          celebrationDurationSeconds: 7,
        });
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({
          limit: 7,
          currentCount: 0,
          canAddTask: true,
          hasSeenWIPLimitEducation: false,
        });
      }),
      http.get('http://localhost:3001/api/config/celebrations', () => {
        return HttpResponse.json({
          celebrationsEnabled: true,
          celebrationDurationSeconds: 7,
        });
      }),
      http.put('http://localhost:3001/api/config/celebrations', async ({ request }) => {
        savedConfig = (await request.json()) as { celebrationsEnabled: boolean; celebrationDurationSeconds: number };
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
          ...savedConfig,
        } as Config);
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /enable celebrations/i })).toBeInTheDocument();
    });

    const toggle = screen.getByRole('switch', { name: /enable celebrations/i });
    fireEvent.click(toggle);

    // Click Save Changes button to persist changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(savedConfig).toEqual({
        celebrationsEnabled: false,
        celebrationDurationSeconds: 7,
      });
    });
  });

  // AC: 5, 8 - Saving duration change (requires Save Changes button click)
  it('should save celebration config when changing duration', async () => {
    let savedConfig: { celebrationsEnabled: boolean; celebrationDurationSeconds: number } | null = null;

    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
          celebrationsEnabled: true,
          celebrationDurationSeconds: 7,
        });
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({
          limit: 7,
          currentCount: 0,
          canAddTask: true,
          hasSeenWIPLimitEducation: false,
        });
      }),
      http.get('http://localhost:3001/api/config/celebrations', () => {
        return HttpResponse.json({
          celebrationsEnabled: true,
          celebrationDurationSeconds: 7,
        });
      }),
      http.put('http://localhost:3001/api/config/celebrations', async ({ request }) => {
        savedConfig = (await request.json()) as { celebrationsEnabled: boolean; celebrationDurationSeconds: number };
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
          ...savedConfig,
        } as Config);
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('slider', { name: /celebration duration/i })).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider', { name: /celebration duration/i });
    fireEvent.change(slider, { target: { value: '5' } });

    // Click Save Changes button to persist changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(savedConfig).toEqual({
        celebrationsEnabled: true,
        celebrationDurationSeconds: 5,
      });
    });
  });

  // AC: 8 - Changes take effect immediately (after Save button clicked)
  it('should update ConfigContext immediately when celebration config changes', async () => {
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
          celebrationsEnabled: true,
          celebrationDurationSeconds: 7,
        });
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({
          limit: 7,
          currentCount: 0,
          canAddTask: true,
          hasSeenWIPLimitEducation: false,
        });
      }),
      http.get('http://localhost:3001/api/config/celebrations', () => {
        return HttpResponse.json({
          celebrationsEnabled: true,
          celebrationDurationSeconds: 7,
        });
      }),
      http.put('http://localhost:3001/api/config/celebrations', async ({ request }) => {
        const body = (await request.json()) as { celebrationsEnabled: boolean; celebrationDurationSeconds: number };
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
          ...body,
        } as Config);
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /enable celebrations/i })).toBeInTheDocument();
    });

    const toggle = screen.getByRole('switch', { name: /enable celebrations/i });
    fireEvent.click(toggle);

    // Click Save Changes button to persist changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    // Verify success toast appears
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/settings saved/i)).toBeInTheDocument();
    });
  });
});
