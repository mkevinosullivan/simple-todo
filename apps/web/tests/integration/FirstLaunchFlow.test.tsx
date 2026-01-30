import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import App from '../../src/App';
import * as configService from '../../src/services/config';

// Mock the config service
vi.mock('../../src/services/config', async () => {
  const actual = await vi.importActual<typeof import('../../src/services/config')>(
    '../../src/services/config'
  );
  return {
    ...actual,
    getConfig: vi.fn(),
    updateWipLimit: vi.fn(),
  };
});

describe('First-Launch Flow Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show FirstLaunchScreen when hasCompletedSetup is false', async () => {
    // Mock config API to return hasCompletedSetup: false
    vi.mocked(configService.getConfig).mockResolvedValue({
      wipLimit: 7,
      promptingEnabled: true,
      promptingFrequencyHours: 2.5,
      celebrationsEnabled: true,
      celebrationDurationSeconds: 7,
      browserNotificationsEnabled: false,
      hasCompletedSetup: false,
      hasSeenPromptEducation: false,
      hasSeenWIPLimitEducation: false,
    });

    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify FirstLaunchScreen is rendered
    expect(screen.getByText('Welcome to Simple To-Do App!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
  });

  it('should show TaskListView when hasCompletedSetup is true', async () => {
    // Mock config API to return hasCompletedSetup: true
    vi.mocked(configService.getConfig).mockResolvedValue({
      wipLimit: 7,
      promptingEnabled: true,
      promptingFrequencyHours: 2.5,
      celebrationsEnabled: true,
      celebrationDurationSeconds: 7,
      browserNotificationsEnabled: false,
      hasCompletedSetup: true,
      hasSeenPromptEducation: false,
      hasSeenWIPLimitEducation: false,
    });

    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify FirstLaunchScreen is NOT rendered
    expect(screen.queryByText('Welcome to Simple To-Do App!')).not.toBeInTheDocument();
    // TaskListView should be rendered instead
    // Note: We can't easily verify TaskListView rendering without mocking more dependencies
    // but we can verify FirstLaunchScreen is not shown
  });

  it('should complete first-launch flow when Get Started is clicked', async () => {
    // Mock initial config with hasCompletedSetup: false
    vi.mocked(configService.getConfig).mockResolvedValue({
      wipLimit: 7,
      promptingEnabled: true,
      promptingFrequencyHours: 2.5,
      celebrationsEnabled: true,
      celebrationDurationSeconds: 7,
      browserNotificationsEnabled: false,
      hasCompletedSetup: false,
      hasSeenPromptEducation: false,
      hasSeenWIPLimitEducation: false,
    });

    // Mock updateWipLimit to return success with hasCompletedSetup: true
    vi.mocked(configService.updateWipLimit).mockResolvedValue({
      limit: 8,
      currentCount: 0,
      canAddTask: true,
      hasSeenWIPLimitEducation: false,
      hasCompletedSetup: true,
    });

    render(<App />);

    // Wait for FirstLaunchScreen to appear
    await waitFor(() => {
      expect(screen.getByText('Welcome to Simple To-Do App!')).toBeInTheDocument();
    });

    // Select WIP limit 8
    const button8 = screen.getByRole('radio', { name: 'Select WIP limit 8' });
    fireEvent.click(button8);

    // Click Get Started
    const getStartedBtn = screen.getByRole('button', { name: /Get Started/i });
    fireEvent.click(getStartedBtn);

    // Verify API was called with correct payload
    await waitFor(() => {
      expect(configService.updateWipLimit).toHaveBeenCalledWith(8);
    });

    // Verify navigation to TaskListView (FirstLaunchScreen should disappear)
    await waitFor(() => {
      expect(screen.queryByText('Welcome to Simple To-Do App!')).not.toBeInTheDocument();
    });
  });

  it('should use default WIP limit 7 when Use Default Settings is clicked', async () => {
    // Mock initial config with hasCompletedSetup: false
    vi.mocked(configService.getConfig).mockResolvedValue({
      wipLimit: 7,
      promptingEnabled: true,
      promptingFrequencyHours: 2.5,
      celebrationsEnabled: true,
      celebrationDurationSeconds: 7,
      browserNotificationsEnabled: false,
      hasCompletedSetup: false,
      hasSeenPromptEducation: false,
      hasSeenWIPLimitEducation: false,
    });

    // Mock updateWipLimit
    vi.mocked(configService.updateWipLimit).mockResolvedValue({
      limit: 7,
      currentCount: 0,
      canAddTask: true,
      hasSeenWIPLimitEducation: false,
      hasCompletedSetup: true,
    });

    render(<App />);

    // Wait for FirstLaunchScreen to appear
    await waitFor(() => {
      expect(screen.getByText('Welcome to Simple To-Do App!')).toBeInTheDocument();
    });

    // Select a different limit first (e.g., 5)
    const button5 = screen.getByRole('radio', { name: 'Select WIP limit 5' });
    fireEvent.click(button5);

    // Click Use Default Settings (should use 7, not 5)
    const useDefaultsBtn = screen.getByRole('button', { name: /Use Default Settings/i });
    fireEvent.click(useDefaultsBtn);

    // Verify API was called with limit=7 (not 5)
    await waitFor(() => {
      expect(configService.updateWipLimit).toHaveBeenCalledWith(7);
    });

    // Verify navigation to TaskListView
    await waitFor(() => {
      expect(screen.queryByText('Welcome to Simple To-Do App!')).not.toBeInTheDocument();
    });
  });

  it('should not show FirstLaunchScreen on subsequent loads after setup completed', async () => {
    // First load: hasCompletedSetup: false
    vi.mocked(configService.getConfig).mockResolvedValue({
      wipLimit: 7,
      promptingEnabled: true,
      promptingFrequencyHours: 2.5,
      celebrationsEnabled: true,
      celebrationDurationSeconds: 7,
      browserNotificationsEnabled: false,
      hasCompletedSetup: false,
      hasSeenPromptEducation: false,
      hasSeenWIPLimitEducation: false,
    });

    vi.mocked(configService.updateWipLimit).mockResolvedValue({
      limit: 7,
      currentCount: 0,
      canAddTask: true,
      hasSeenWIPLimitEducation: false,
      hasCompletedSetup: true,
    });

    const { unmount } = render(<App />);

    // Complete setup
    await waitFor(() => {
      expect(screen.getByText('Welcome to Simple To-Do App!')).toBeInTheDocument();
    });

    const getStartedBtn = screen.getByRole('button', { name: /Get Started/i });
    fireEvent.click(getStartedBtn);

    await waitFor(() => {
      expect(screen.queryByText('Welcome to Simple To-Do App!')).not.toBeInTheDocument();
    });

    unmount();

    // Second load: hasCompletedSetup: true (simulating app restart)
    vi.mocked(configService.getConfig).mockResolvedValue({
      wipLimit: 7,
      promptingEnabled: true,
      promptingFrequencyHours: 2.5,
      celebrationsEnabled: true,
      celebrationDurationSeconds: 7,
      browserNotificationsEnabled: false,
      hasCompletedSetup: true, // Now true
      hasSeenPromptEducation: false,
      hasSeenWIPLimitEducation: false,
    });

    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify FirstLaunchScreen is NOT shown
    expect(screen.queryByText('Welcome to Simple To-Do App!')).not.toBeInTheDocument();
  });

  it('should show error and retry button on config fetch failure', async () => {
    // Mock config API to fail
    vi.mocked(configService.getConfig).mockRejectedValue(new Error('Network error'));

    render(<App />);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load configuration. Please refresh the page./i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  it('should retry config fetch when Retry button is clicked', async () => {
    // Mock config API to fail first time, succeed second time
    vi.mocked(configService.getConfig)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        wipLimit: 7,
        promptingEnabled: true,
        promptingFrequencyHours: 2.5,
        celebrationsEnabled: true,
        celebrationDurationSeconds: 7,
        browserNotificationsEnabled: false,
        hasCompletedSetup: false,
        hasSeenPromptEducation: false,
        hasSeenWIPLimitEducation: false,
      });

    render(<App />);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load configuration/i)).toBeInTheDocument();
    });

    // Click Retry button
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    // Should show loading state
    await waitFor(() => {
      expect(screen.queryByText(/Failed to load configuration/i)).not.toBeInTheDocument();
    });

    // Should eventually show FirstLaunchScreen
    await waitFor(() => {
      expect(screen.getByText('Welcome to Simple To-Do App!')).toBeInTheDocument();
    });

    expect(configService.getConfig).toHaveBeenCalledTimes(2);
  });

  it('should show FirstLaunchScreen after 3 failed retries', async () => {
    // Mock config API to always fail
    vi.mocked(configService.getConfig).mockRejectedValue(new Error('Network error'));

    render(<App />);

    // First failure - show error
    await waitFor(() => {
      expect(screen.getByText(/Failed to load configuration/i)).toBeInTheDocument();
    });

    // Retry 1
    fireEvent.click(screen.getByRole('button', { name: /Retry/i }));
    await waitFor(() => {
      expect(screen.getByText(/Failed to load configuration/i)).toBeInTheDocument();
    });

    // Retry 2
    fireEvent.click(screen.getByRole('button', { name: /Retry/i }));
    await waitFor(() => {
      expect(screen.getByText(/Failed to load configuration/i)).toBeInTheDocument();
    });

    // Retry 3 - should show FirstLaunchScreen with default config
    fireEvent.click(screen.getByRole('button', { name: /Retry/i }));
    await waitFor(() => {
      expect(screen.getByText('Welcome to Simple To-Do App!')).toBeInTheDocument();
    });
  });
});
