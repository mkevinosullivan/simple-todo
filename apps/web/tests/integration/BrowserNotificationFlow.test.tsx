import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Config, ProactivePrompt } from '@simple-todo/shared/types';

import { TaskListView } from '../../src/views/TaskListView.js';

// Mock dependencies
vi.mock('../../src/context/ConfigContext.js', () => ({
  useConfig: vi.fn(() => ({
    config: {
      browserNotificationsEnabled: true,
      celebrationsEnabled: true,
      celebrationDurationSeconds: 7,
      promptingEnabled: true,
    } as Config,
    updateConfig: vi.fn(),
  })),
}));

vi.mock('../../src/context/TaskContext.js', () => ({
  useTaskContext: vi.fn(() => ({
    tasks: [],
    loading: false,
    error: null,
    addTask: vi.fn(),
    removeTask: vi.fn(),
    updateTask: vi.fn(),
  })),
}));

vi.mock('../../src/hooks/useWipStatus.js', () => ({
  useWipStatus: vi.fn(() => ({
    canAddTask: true,
    currentCount: 0,
    limit: 7,
    hasSeenWIPLimitEducation: true,
    refreshLimit: vi.fn(),
  })),
}));

vi.mock('../../src/hooks/useCelebrationQueue.js', () => ({
  useCelebrationQueue: vi.fn(() => ({
    currentCelebration: null,
    queueCelebration: vi.fn(),
    dismissCelebration: vi.fn(),
  })),
}));

describe('Browser Notification Flow', () => {
  let mockNotification: typeof Notification;
  let mockNotificationInstance: Notification;
  let notificationSpy: ReturnType<typeof vi.fn>;
  let windowFocusSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Spy on window.focus
    windowFocusSpy = vi.spyOn(window, 'focus').mockImplementation(() => {});

    // Mock Notification instance
    mockNotificationInstance = {
      close: vi.fn(),
      onclick: null,
    } as unknown as Notification;

    // Mock Notification constructor
    notificationSpy = vi.fn(() => mockNotificationInstance);
    notificationSpy.permission = 'granted';

    mockNotification = notificationSpy as unknown as typeof Notification;

    // Assign to global window
    Object.defineProperty(window, 'Notification', {
      writable: true,
      configurable: true,
      value: mockNotification,
    });
  });

  it('should send both toast and browser notification when enabled', async () => {
    // Mock prompt data
    const mockPrompt: ProactivePrompt = {
      taskId: 'task-123',
      taskText: 'Buy groceries',
      promptedAt: new Date().toISOString(),
    };

    const ssePrompts = [mockPrompt];

    render(<TaskListView ssePrompts={ssePrompts} />);

    // Wait for prompt processing
    await waitFor(() => {
      // Check that PromptToast is rendered (in-app notification)
      expect(screen.getByText(/could you do/i)).toBeInTheDocument();
    });

    // Verify browser notification was created
    expect(notificationSpy).toHaveBeenCalledWith('Simple To-Do App', {
      body: 'Could you do Buy groceries now?',
      icon: '/favicon.ico',
      tag: 'proactive-prompt-task-123',
      requireInteraction: false,
    });
  });

  it('should only show toast when browser notifications disabled', async () => {
    // Mock config with browser notifications disabled
    const useConfigMock = await import('../../src/context/ConfigContext.js');
    vi.mocked(useConfigMock.useConfig).mockReturnValue({
      config: {
        browserNotificationsEnabled: false,
        celebrationsEnabled: true,
        celebrationDurationSeconds: 7,
        promptingEnabled: true,
      } as Config,
      updateConfig: vi.fn(),
    });

    const mockPrompt: ProactivePrompt = {
      taskId: 'task-456',
      taskText: 'Complete report',
      promptedAt: new Date().toISOString(),
    };

    const ssePrompts = [mockPrompt];

    render(<TaskListView ssePrompts={ssePrompts} />);

    // Wait for prompt processing
    await waitFor(() => {
      // Check that PromptToast is rendered (in-app notification)
      expect(screen.getByText(/could you do/i)).toBeInTheDocument();
    });

    // Verify browser notification was NOT created
    expect(notificationSpy).not.toHaveBeenCalled();
  });

  it('should focus window when browser notification clicked', async () => {
    const mockPrompt: ProactivePrompt = {
      taskId: 'task-789',
      taskText: 'Review PR',
      promptedAt: new Date().toISOString(),
    };

    const ssePrompts = [mockPrompt];

    render(<TaskListView ssePrompts={ssePrompts} />);

    // Wait for notification to be created
    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });

    // Simulate click on notification
    if (mockNotificationInstance.onclick) {
      mockNotificationInstance.onclick(new Event('click'));
    }

    // Verify window was focused
    expect(windowFocusSpy).toHaveBeenCalled();
    expect(mockNotificationInstance.close).toHaveBeenCalled();
  });

  it('should not send browser notification when permission denied', async () => {
    // Set permission to denied
    notificationSpy.permission = 'denied';

    const mockPrompt: ProactivePrompt = {
      taskId: 'task-999',
      taskText: 'Fix bug',
      promptedAt: new Date().toISOString(),
    };

    const ssePrompts = [mockPrompt];

    render(<TaskListView ssePrompts={ssePrompts} />);

    // Wait for prompt processing
    await waitFor(() => {
      // Toast should still be shown
      expect(screen.getByText(/could you do/i)).toBeInTheDocument();
    });

    // Verify browser notification was NOT created
    expect(notificationSpy).not.toHaveBeenCalled();
  });

  it('should handle multiple prompts correctly', async () => {
    const mockPrompts: ProactivePrompt[] = [
      {
        taskId: 'task-1',
        taskText: 'First task',
        promptedAt: new Date().toISOString(),
      },
      {
        taskId: 'task-2',
        taskText: 'Second task',
        promptedAt: new Date().toISOString(),
      },
    ];

    const { rerender } = render(<TaskListView ssePrompts={[]} />);

    // Add first prompt
    rerender(<TaskListView ssePrompts={[mockPrompts[0]]} />);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledTimes(1);
    });

    // Add second prompt
    rerender(<TaskListView ssePrompts={mockPrompts} />);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledTimes(2);
    });

    // Verify both notifications were created with correct content
    expect(notificationSpy).toHaveBeenNthCalledWith(
      1,
      'Simple To-Do App',
      expect.objectContaining({
        body: 'Could you do First task now?',
        tag: 'proactive-prompt-task-1',
      })
    );

    expect(notificationSpy).toHaveBeenNthCalledWith(
      2,
      'Simple To-Do App',
      expect.objectContaining({
        body: 'Could you do Second task now?',
        tag: 'proactive-prompt-task-2',
      })
    );
  });
});
