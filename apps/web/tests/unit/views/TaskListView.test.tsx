import type { CelebrationMessage, Task } from '@simple-todo/shared/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';


import { TaskListView } from '../../../src/views/TaskListView.js';

// Mock the celebration API service
vi.mock('../../../src/services/celebrations', () => ({
  celebrations: {
    getMessage: vi.fn(),
  },
}));

// Mock the tasks API service
vi.mock('../../../src/services/tasks', () => ({
  tasks: {
    getAll: vi.fn(),
    create: vi.fn(),
    complete: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock the config API service
vi.mock('../../../src/services/config', () => ({
  getConfig: vi.fn(),
  updateConfig: vi.fn(),
  updateEducationFlag: vi.fn(),
}));

// Mock useCelebrationQueue hook
const mockQueueCelebration = vi.fn();
const mockDismissCelebration = vi.fn();
let mockCurrentCelebration: CelebrationMessage | null = null;

vi.mock('../../../src/hooks/useCelebrationQueue', () => ({
  useCelebrationQueue: () => ({
    currentCelebration: mockCurrentCelebration,
    queueCelebration: mockQueueCelebration,
    dismissCelebration: mockDismissCelebration,
  }),
}));

// Mock useTaskContext
const mockAddTask = vi.fn();
const mockRemoveTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockTasks: Task[] = [
  {
    id: 'task-1',
    text: 'Test task',
    status: 'active',
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'task-2',
    text: 'This is a very long task text that exceeds fifty characters and should be truncated in celebration',
    status: 'active',
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
];

vi.mock('../../../src/context/TaskContext', () => ({
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
vi.mock('../../../src/hooks/useWipStatus', () => ({
  useWipStatus: () => ({
    canAddTask: true,
    currentCount: 2,
    limit: 5,
    hasSeenWIPLimitEducation: false,
    refreshLimit: vi.fn(),
  }),
}));

// Mock screen reader utility
vi.mock('../../../src/utils/announceToScreenReader', () => ({
  announceToScreenReader: vi.fn(),
}));

describe('TaskListView - Celebration Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentCelebration = null;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should queue celebration after completing task successfully', async () => {
    const { celebrations } = await import('../../../src/services/celebrations.js');
    const { tasks } = await import('../../../src/services/tasks.js');

    // Mock successful task completion
    vi.mocked(tasks.complete).mockResolvedValue({
      id: 'task-1',
      text: 'Test task',
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

    // Find and click complete button
    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[0]);

    // Wait for 300ms delay
    await vi.advanceTimersByTimeAsync(300);

    // Wait for celebration to be queued
    await waitFor(() => {
      expect(mockQueueCelebration).toHaveBeenCalled();
    });
  });

  it('should show fallback message if celebration API fails', async () => {
    const { celebrations } = await import('../../../src/services/celebrations.js');
    const { tasks } = await import('../../../src/services/tasks.js');

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

    // Wait for 300ms delay
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockQueueCelebration).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Great job! Task completed.',
          variant: 'supportive',
          duration: 5000,
        }),
      );
    });
  });

  it('should show special message for first completion', async () => {
    const { tasks } = await import('../../../src/services/tasks.js');

    // Mock successful task completion
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

    // Wait for 300ms delay
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockQueueCelebration).toHaveBeenCalledWith({
        message: 'First task done! Keep it up!',
        variant: 'enthusiastic',
        duration: 7000,
      });
    });
  });

  it('should not show celebration if task completion API fails', async () => {
    const { tasks } = await import('../../../src/services/tasks.js');

    // Mock task completion API failure
    vi.mocked(tasks.complete).mockRejectedValue(new Error('Failed'));

    render(<TaskListView />);

    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[0]);

    // Wait for 300ms delay
    await vi.advanceTimersByTimeAsync(300);

    // Wait to ensure no celebration queued
    await waitFor(
      () => {
        expect(mockQueueCelebration).not.toHaveBeenCalled();
      },
      { timeout: 500 },
    );
  });

  it('should include task context in celebration message', async () => {
    const { celebrations } = await import('../../../src/services/celebrations.js');
    const { tasks } = await import('../../../src/services/tasks.js');

    // Mock successful task completion
    vi.mocked(tasks.complete).mockResolvedValue({
      id: 'task-1',
      text: 'Test task',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    // Mock celebration API response
    vi.mocked(celebrations.getMessage).mockResolvedValue({
      message: 'Great work!',
      variant: 'supportive',
      duration: 5000,
    });

    render(<TaskListView />);

    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[0]);

    // Wait for 300ms delay
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockQueueCelebration).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("You completed 'Test task'!"),
        }),
      );
    });
  });

  it('should truncate long task text in celebration message', async () => {
    const { celebrations } = await import('../../../src/services/celebrations.js');
    const { tasks } = await import('../../../src/services/tasks.js');

    // Mock successful task completion for long task
    vi.mocked(tasks.complete).mockResolvedValue({
      id: 'task-2',
      text: 'This is a very long task text that exceeds fifty characters and should be truncated in celebration',
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

    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[1]); // Click second task (long text)

    // Wait for 300ms delay
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockQueueCelebration).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/\.\.\./), // Contains ellipsis
        }),
      );
    });
  });

  it('should use normal celebration after first completion', async () => {
    const { celebrations } = await import('../../../src/services/celebrations.js');
    const { tasks } = await import('../../../src/services/tasks.js');

    // Mock successful task completions
    vi.mocked(tasks.complete).mockResolvedValue({
      id: 'task-1',
      text: 'Test task',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    vi.mocked(celebrations.getMessage).mockResolvedValue({
      message: 'Amazing work!',
      variant: 'enthusiastic',
      duration: 5000,
    });

    render(<TaskListView />);

    const completeButtons = screen.getAllByLabelText(/complete/i);

    // First completion
    fireEvent.click(completeButtons[0]);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockQueueCelebration).toHaveBeenCalledWith({
        message: 'First task done! Keep it up!',
        variant: 'enthusiastic',
        duration: 7000,
      });
    });

    // Clear mocks
    vi.clearAllMocks();

    // Second completion should use normal celebration
    fireEvent.click(completeButtons[1]);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockQueueCelebration).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("You completed"),
        }),
      );
    });
  });

  it('should wait 300ms before showing celebration', async () => {
    const { celebrations } = await import('../../../src/services/celebrations.js');
    const { tasks } = await import('../../../src/services/tasks.js');

    // Mock successful task completion
    vi.mocked(tasks.complete).mockResolvedValue({
      id: 'task-1',
      text: 'Test task',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    vi.mocked(celebrations.getMessage).mockResolvedValue({
      message: 'Amazing work!',
      variant: 'enthusiastic',
      duration: 5000,
    });

    render(<TaskListView />);

    const completeButtons = screen.getAllByLabelText(/complete/i);
    fireEvent.click(completeButtons[0]);

    // Should not be called immediately
    expect(mockQueueCelebration).not.toHaveBeenCalled();

    // Advance timers by 299ms - should still not be called
    await vi.advanceTimersByTimeAsync(299);
    expect(mockQueueCelebration).not.toHaveBeenCalled();

    // Advance by 1ms more (total 300ms) - now should be called
    await vi.advanceTimersByTimeAsync(1);

    await waitFor(() => {
      expect(mockQueueCelebration).toHaveBeenCalled();
    });
  });
});
