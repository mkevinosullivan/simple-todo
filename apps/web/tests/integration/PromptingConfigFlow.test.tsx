import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';

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

describe('Prompting Config Flow', () => {
  it('should load prompting config from API when modal opens', async () => {
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
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
      http.get('http://localhost:3001/api/config/prompting', () => {
        return HttpResponse.json({
          enabled: true,
          frequencyHours: 2.5,
          nextPromptTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        });
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /enable proactive prompts/i })).toBeChecked();
    });

    expect(screen.getByRole('slider', { name: /prompt frequency in hours/i })).toHaveValue('2.5');
  });

  it('should load custom prompting config from API (disabled)', async () => {
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
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
      http.get('http://localhost:3001/api/config/prompting', () => {
        return HttpResponse.json({
          enabled: false,
          frequencyHours: 4,
        });
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /enable proactive prompts/i })).not.toBeChecked();
    });

    const slider = screen.getByRole('slider', { name: /prompt frequency in hours/i });
    expect(slider).toHaveValue('4');
    expect(slider).toBeDisabled(); // Slider should be disabled when toggle is off
  });

  it('should save prompting config when toggling prompts off', async () => {
    let savedConfig: { enabled: boolean; frequencyHours: number } | null = null;

    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
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
      http.get('http://localhost:3001/api/config/prompting', () => {
        return HttpResponse.json({
          enabled: true,
          frequencyHours: 2.5,
        });
      }),
      http.put('http://localhost:3001/api/config/prompting', async ({ request }) => {
        savedConfig = (await request.json()) as { enabled: boolean; frequencyHours: number };
        return HttpResponse.json({
          enabled: savedConfig.enabled,
          frequencyHours: savedConfig.frequencyHours,
        });
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /enable proactive prompts/i })).toBeInTheDocument();
    });

    const toggle = screen.getByRole('switch', { name: /enable proactive prompts/i });
    fireEvent.click(toggle);

    // Click Save Changes button to persist changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(savedConfig).toEqual({
        enabled: false,
        frequencyHours: 2.5,
      });
    });
  });

  it('should save prompting config when changing frequency', async () => {
    let savedConfig: { enabled: boolean; frequencyHours: number } | null = null;

    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
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
      http.get('http://localhost:3001/api/config/prompting', () => {
        return HttpResponse.json({
          enabled: true,
          frequencyHours: 2.5,
        });
      }),
      http.put('http://localhost:3001/api/config/prompting', async ({ request }) => {
        savedConfig = (await request.json()) as { enabled: boolean; frequencyHours: number };
        return HttpResponse.json({
          enabled: savedConfig.enabled,
          frequencyHours: savedConfig.frequencyHours,
        });
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('slider', { name: /prompt frequency in hours/i })).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider', { name: /prompt frequency in hours/i });
    fireEvent.change(slider, { target: { value: '5' } });

    // Click Save Changes button to persist changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(savedConfig).toEqual({
        enabled: true,
        frequencyHours: 5,
      });
    });
  });

  it('should show success toast after saving prompting config', async () => {
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
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
      http.get('http://localhost:3001/api/config/prompting', () => {
        return HttpResponse.json({
          enabled: true,
          frequencyHours: 2.5,
        });
      }),
      http.put('http://localhost:3001/api/config/prompting', async ({ request }) => {
        const body = (await request.json()) as { enabled: boolean; frequencyHours: number };
        return HttpResponse.json({
          enabled: body.enabled,
          frequencyHours: body.frequencyHours,
        });
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /enable proactive prompts/i })).toBeInTheDocument();
    });

    const toggle = screen.getByRole('switch', { name: /enable proactive prompts/i });
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

  it('should display next prompt time when enabled', async () => {
    const futureTime = new Date(Date.now() + 90 * 60 * 1000); // 1.5 hours from now

    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
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
      http.get('http://localhost:3001/api/config/prompting', () => {
        return HttpResponse.json({
          enabled: true,
          frequencyHours: 2.5,
          nextPromptTime: futureTime.toISOString(),
        });
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/next prompt in approximately 1 hour/i)).toBeInTheDocument();
    });
  });

  it('should not display next prompt time when disabled', async () => {
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
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
      http.get('http://localhost:3001/api/config/prompting', () => {
        return HttpResponse.json({
          enabled: false,
          frequencyHours: 2.5,
        });
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /enable proactive prompts/i })).not.toBeChecked();
    });

    expect(screen.queryByText(/next prompt in/i)).not.toBeInTheDocument();
  });

  it('should reset prompting config on cancel', async () => {
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
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
      http.get('http://localhost:3001/api/config/prompting', () => {
        return HttpResponse.json({
          enabled: true,
          frequencyHours: 2.5,
        });
      })
    );

    const onClose = vi.fn();

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={onClose} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /enable proactive prompts/i })).toBeInTheDocument();
    });

    // Toggle prompts off
    const toggle = screen.getByRole('switch', { name: /enable proactive prompts/i });
    fireEvent.click(toggle);

    // Verify toggle is now unchecked
    expect(toggle).not.toBeChecked();

    // Click Cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Verify onClose was called
    expect(onClose).toHaveBeenCalled();
  });

  it('should allow changing frequency with half-hour increments', async () => {
    let savedConfig: { enabled: boolean; frequencyHours: number } | null = null;

    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json({
          ...DEFAULT_CONFIG,
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
      http.get('http://localhost:3001/api/config/prompting', () => {
        return HttpResponse.json({
          enabled: true,
          frequencyHours: 2,
        });
      }),
      http.put('http://localhost:3001/api/config/prompting', async ({ request }) => {
        savedConfig = (await request.json()) as { enabled: boolean; frequencyHours: number };
        return HttpResponse.json({
          enabled: savedConfig.enabled,
          frequencyHours: savedConfig.frequencyHours,
        });
      })
    );

    render(
      <ConfigProvider>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('slider', { name: /prompt frequency in hours/i })).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider', { name: /prompt frequency in hours/i });
    fireEvent.change(slider, { target: { value: '3.5' } });

    // Click Save Changes button
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(savedConfig).toEqual({
        enabled: true,
        frequencyHours: 3.5,
      });
    });
  });
});
