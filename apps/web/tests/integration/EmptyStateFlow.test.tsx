import type { Config } from '@simple-todo/shared/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '../../src/components/EmptyState';
import { ConfigProvider } from '../../src/context/ConfigContext';
import { createTestConfig } from '../helpers/factories';
import { server } from '../helpers/testSetup';

describe('EmptyState conditional rendering', () => {
  it('should show QuickStartGuide when hasCompletedSetup is false', async () => {
    const mockConfig = createTestConfig({
      hasCompletedSetup: false,
      wipLimit: 7,
    });

    let currentConfig = mockConfig;

    // Mock GET /api/config
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json(currentConfig);
      })
    );

    // Mock PATCH /api/config
    server.use(
      http.patch('http://localhost:3001/api/config', async ({ request }) => {
        const body = (await request.json()) as Partial<Config>;
        currentConfig = { ...currentConfig, ...body };
        return HttpResponse.json(currentConfig);
      })
    );

    const handleConfigUpdate = vi.fn();

    render(
      <ConfigProvider initialConfig={mockConfig}>
        <EmptyState config={mockConfig} onConfigUpdate={handleConfigUpdate} />
      </ConfigProvider>
    );

    // Verify QuickStartGuide is rendered
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument();

    // Verify it does NOT show regular empty state
    expect(screen.queryByText(/no tasks yet/i)).not.toBeInTheDocument();
  });

  it('should show regular empty state when hasCompletedSetup is true', () => {
    const mockConfig = createTestConfig({
      hasCompletedSetup: true,
      wipLimit: 7,
    });

    const handleConfigUpdate = vi.fn();

    render(
      <ConfigProvider initialConfig={mockConfig}>
        <EmptyState config={mockConfig} onConfigUpdate={handleConfigUpdate} />
      </ConfigProvider>
    );

    // Verify regular empty state is rendered
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();

    // Verify QuickStartGuide is NOT rendered
    expect(screen.queryByText(/Welcome/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /got it/i })).not.toBeInTheDocument();
  });

  it('should update hasCompletedSetup flag when dismissed', async () => {
    const mockConfig = createTestConfig({
      hasCompletedSetup: false,
      wipLimit: 7,
    });

    let currentConfig = mockConfig;

    // Mock GET /api/config
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json(currentConfig);
      })
    );

    // Mock PATCH /api/config
    server.use(
      http.patch('http://localhost:3001/api/config', async ({ request }) => {
        const body = (await request.json()) as Partial<Config>;
        currentConfig = { ...currentConfig, ...body };
        return HttpResponse.json(currentConfig);
      })
    );

    let configUpdateCount = 0;
    const handleConfigUpdate = vi.fn((newConfig: Config) => {
      configUpdateCount++;
    });

    const user = userEvent.setup();

    const { rerender } = render(
      <ConfigProvider initialConfig={mockConfig}>
        <EmptyState config={mockConfig} onConfigUpdate={handleConfigUpdate} />
      </ConfigProvider>
    );

    // Verify QuickStartGuide is shown
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /got it/i });

    // Click "Got it!" button
    await user.click(button);

    // Wait for API call to complete
    await waitFor(() => {
      expect(handleConfigUpdate).toHaveBeenCalled();
    });

    // Verify the config update was called with hasCompletedSetup: true
    expect(handleConfigUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        hasCompletedSetup: true,
      })
    );

    // Re-render with updated config
    rerender(
      <ConfigProvider initialConfig={{ ...mockConfig, hasCompletedSetup: true }}>
        <EmptyState
          config={{ ...mockConfig, hasCompletedSetup: true }}
          onConfigUpdate={handleConfigUpdate}
        />
      </ConfigProvider>
    );

    // Verify QuickStartGuide is gone
    expect(screen.queryByText(/Welcome/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('should call PATCH /api/config with correct payload', async () => {
    const mockConfig = createTestConfig({
      hasCompletedSetup: false,
      wipLimit: 7,
    });

    let patchCalled = false;
    let patchBody: Partial<Config> | null = null;

    // Mock PATCH /api/config
    server.use(
      http.patch('http://localhost:3001/api/config', async ({ request }) => {
        patchCalled = true;
        patchBody = (await request.json()) as Partial<Config>;
        return HttpResponse.json(createTestConfig({ hasCompletedSetup: true }));
      })
    );

    const handleConfigUpdate = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfigProvider initialConfig={mockConfig}>
        <EmptyState config={mockConfig} onConfigUpdate={handleConfigUpdate} />
      </ConfigProvider>
    );

    // Click "Got it!" button
    const button = screen.getByRole('button', { name: /got it/i });
    await user.click(button);

    // Wait for API call
    await waitFor(() => {
      expect(patchCalled).toBe(true);
    });

    // Verify correct payload
    expect(patchBody).toEqual({ hasCompletedSetup: true });
  });

  it('should show error message if API call fails', async () => {
    const mockConfig = createTestConfig({
      hasCompletedSetup: false,
      wipLimit: 7,
    });

    // Mock PATCH /api/config to fail
    server.use(
      http.patch('http://localhost:3001/api/config', () => {
        return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
      })
    );

    const handleConfigUpdate = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfigProvider initialConfig={mockConfig}>
        <EmptyState config={mockConfig} onConfigUpdate={handleConfigUpdate} />
      </ConfigProvider>
    );

    // Click "Got it!" button
    const button = screen.getByRole('button', { name: /got it/i });
    await user.click(button);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to save/i)).toBeInTheDocument();
    });

    // QuickStartGuide should still be visible
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();

    // Config update should NOT have been called
    expect(handleConfigUpdate).not.toHaveBeenCalled();
  });
});
