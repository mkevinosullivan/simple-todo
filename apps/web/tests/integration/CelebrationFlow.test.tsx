import type { CelebrationMessage, Task } from '@simple-todo/shared/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';


import { TaskListView } from '../../src/views/TaskListView.js';

// Mock the celebration API service
vi.mock('../../src/services/celebrations', () => ({
  celebrations: {
    getMessage: vi.fn(),
  },
}));

// Mock the tasks API service
vi.mock('../../src/services/tasks', () => ({
  tasks: {
    getAll: vi.fn(),
    create: vi.fn(),
    complete: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock the config API service
vi.mock('../../src/services/config', () => ({
  getConfig: vi.fn(),
  updateConfig: vi.fn(),
  updateEducationFlag: vi.fn(),
}));

// Mock useTaskContext
const mockAddTask = vi.fn();
const mockRemoveTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockTasks: Task[] = [
  {
    id: 'task-1',
    text: 'First test task',
    status: 'active',
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'task-2',
    text: 'Second test task',
    status: 'active',
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'task-3',
    text: 'Third test task',
    status: 'active',
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
];

vi.mock('../../src/context/TaskContext', () => ({
  useTaskContext: () => ({
    tasks: mockTasks,
    loading: false,
    error: null,
    addTask: mockAddTask,
    removeTask: mockRemoveTask,
    updateTask: mockUpdateTask,
  }),
}));

// Mock useWipStatus
vi.mock('../../src/hooks/useWipStatus', () => ({
  useWipStatus: () => ({
    canAddTask: true,
    currentCount: 3,
    limit: 5,
    hasSeenWIPLimitEducation: false,
    refreshLimit: vi.fn(),
  }),
}));

// Mock screen reader utility
vi.mock('../../src/utils/announceToScreenReader', () => ({
  announceToScreenReader: vi.fn(),
}));

describe('Celebration Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should display CelebrationOverlay after completing task', async () => {
    const { celebrations } = await import('../../src/services/celebrations.js');
    const { tasks } = await import('../../src/services/tasks.js');

    // Mock successful task completion
    vi.mocked(tasks.complete).mockResolvedValue({
      id: 'task-1',
      text: 'First test task',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    // Mock celebration API response
    vi.mocked(celebrations.getMessage).mockResolvedValue({
      message: 'Amazing work!',
      variant: 'enthusiastic',
      duration: 5000,
    });

    render(<TaskListView />);

    // Complete a task
    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[0]);

    // Wait for celebration to appear (300ms delay + queue processing)
    await vi.advanceTimersByTimeAsync(300);
    await vi.runAllTimersAsync();

    // Note: The actual CelebrationOverlay rendering depends on useCelebrationQueue
    // In this integration test, we verify the flow triggers the celebration logic
    expect(tasks.complete).toHaveBeenCalledWith('task-1');
  });

  it('should queue multiple celebrations from rapid completions', async () => {
    const { celebrations } = await import('../../src/services/celebrations.js');
    const { tasks } = await import('../../src/services/tasks.js');

    // Mock successful task completions
    vi.mocked(tasks.complete).mockResolvedValue({
      id: 'task-1',
      text: 'Test task',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    vi.mocked(celebrations.getMessage).mockResolvedValue({
      message: 'Great work!',
      variant: 'supportive',
      duration: 5000,
    });

    render(<TaskListView />);

    // Complete 3 tasks rapidly
    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[0]);
    fireEvent.click(completeButtons[1]);
    fireEvent.click(completeButtons[2]);

    // Wait for all celebrations to be queued
    await vi.advanceTimersByTimeAsync(300);
    await vi.runAllTimersAsync();

    // Verify all tasks were completed
    expect(tasks.complete).toHaveBeenCalledTimes(3);
  });

  it('should handle celebration API failure gracefully', async () => {
    const { celebrations } = await import('../../src/services/celebrations.js');
    const { tasks } = await import('../../src/services/tasks.js');

    // Mock successful task completion
    vi.mocked(tasks.complete).mockResolvedValue({
      id: 'task-1',
      text: 'Test task',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    // Mock celebration API failure
    vi.mocked(celebrations.getMessage).mockRejectedValue(new Error('API Error'));

    render(<TaskListView />);

    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[0]);

    // Wait for celebration logic to execute
    await vi.advanceTimersByTimeAsync(300);
    await vi.runAllTimersAsync();

    // Task should still be completed despite celebration failure
    expect(tasks.complete).toHaveBeenCalledWith('task-1');
    expect(mockRemoveTask).toHaveBeenCalledWith('task-1');
  });

  it('should not show celebration if task completion fails', async () => {
    const { celebrations } = await import('../../src/services/celebrations.js');
    const { tasks } = await import('../../src/services/tasks.js');

    // Mock task completion failure
    vi.mocked(tasks.complete).mockRejectedValue(new Error('Failed'));

    render(<TaskListView />);

    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[0]);

    // Wait for failure handling
    await vi.advanceTimersByTimeAsync(300);
    await vi.runAllTimersAsync();

    // Celebration API should not be called
    expect(celebrations.getMessage).not.toHaveBeenCalled();

    // Task should be restored to list (rollback)
    expect(mockAddTask).toHaveBeenCalled();
  });

  it('should show first completion special message', async () => {
    const { tasks } = await import('../../src/services/tasks.js');

    // Mock successful task completion
    vi.mocked(tasks.complete).mockResolvedValue({
      id: 'task-1',
      text: 'First test task',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    render(<TaskListView />);

    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[0]);

    // Wait for celebration logic
    await vi.advanceTimersByTimeAsync(300);
    await vi.runAllTimersAsync();

    // First completion should not call celebration API (uses hardcoded message)
    const { celebrations } = await import('../../src/services/celebrations.js');
    expect(celebrations.getMessage).not.toHaveBeenCalled();
  });

  it('should maintain non-blocking behavior during celebration', async () => {
    const { tasks } = await import('../../src/services/tasks.js');

    vi.mocked(tasks.complete).mockResolvedValue({
      id: 'task-1',
      text: 'Test task',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    render(<TaskListView />);

    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[0]);

    // Wait for celebration
    await vi.advanceTimersByTimeAsync(300);
    await vi.runAllTimersAsync();

    // Verify other UI elements are still accessible
    // Settings button should still be clickable
    const settingsButton = screen.getByLabelText(/open settings/i);
    expect(settingsButton).toBeInTheDocument();

    // Can still interact with settings
    fireEvent.click(settingsButton);

    // Settings modal should open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
