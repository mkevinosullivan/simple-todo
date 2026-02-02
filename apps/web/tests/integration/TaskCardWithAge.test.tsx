import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TaskCard } from '../../src/components/TaskCard';

describe('TaskCard with Age Indicators', () => {
  const mockHandlers = {
    onComplete: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
  };

  it('should display age indicator for recent tasks', () => {
    const recentTask = {
      id: '1',
      text: 'Buy groceries',
      status: 'active' as const,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      completedAt: null,
    };

    const { container } = render(<TaskCard task={recentTask} {...mockHandlers} />);

    // Age indicator should be present
    const ageIndicator = container.querySelector('[role="img"]');
    expect(ageIndicator).toBeInTheDocument();
  });

  it('should display age indicator for aging tasks', () => {
    const agingTask = {
      id: '2',
      text: 'Clean garage',
      status: 'active' as const,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      completedAt: null,
    };

    const { container } = render(<TaskCard task={agingTask} {...mockHandlers} />);

    const ageIndicator = container.querySelector('[role="img"]');
    expect(ageIndicator).toBeInTheDocument();
  });

  it('should display age indicator for old tasks', () => {
    const oldTask = {
      id: '3',
      text: 'Fix bike',
      status: 'active' as const,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      completedAt: null,
    };

    const { container } = render(<TaskCard task={oldTask} {...mockHandlers} />);

    const ageIndicator = container.querySelector('[role="img"]');
    expect(ageIndicator).toBeInTheDocument();
  });

  it('should display age indicator for stale tasks', () => {
    const staleTask = {
      id: '4',
      text: 'Organize photos',
      status: 'active' as const,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      completedAt: null,
    };

    const { container } = render(<TaskCard task={staleTask} {...mockHandlers} />);

    const ageIndicator = container.querySelector('[role="img"]');
    expect(ageIndicator).toBeInTheDocument();
  });

  it('should NOT display age indicator for fresh tasks', () => {
    const freshTask = {
      id: '5',
      text: 'Just created task',
      status: 'active' as const,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      completedAt: null,
    };

    const { container } = render(<TaskCard task={freshTask} {...mockHandlers} />);

    // Fresh tasks should NOT show age indicator
    const ageIndicator = container.querySelector('[role="img"]');
    expect(ageIndicator).not.toBeInTheDocument();
  });

  it('should show tooltip with relative time on age indicator', () => {
    const task = {
      id: '6',
      text: 'Task with tooltip',
      status: 'active' as const,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      completedAt: null,
    };

    const { container } = render(<TaskCard task={task} {...mockHandlers} />);

    const ageIndicator = container.querySelector('[role="img"]');
    expect(ageIndicator).toHaveAttribute('title', expect.stringContaining('days ago'));
  });

  it('should announce age to screen readers via aria-label', () => {
    const task = {
      id: '7',
      text: 'Buy groceries',
      status: 'active' as const,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      completedAt: null,
    };

    const { container } = render(<TaskCard task={task} {...mockHandlers} />);

    const ageIndicator = container.querySelector('[role="img"]');
    expect(ageIndicator).toHaveAttribute('aria-label', expect.stringContaining('Created'));
  });

  it('should display task text and timestamp alongside age indicator', () => {
    const task = {
      id: '8',
      text: 'Test task',
      status: 'active' as const,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      completedAt: null,
    };

    render(<TaskCard task={task} {...mockHandlers} />);

    // Task text should be visible
    expect(screen.getByText('Test task')).toBeInTheDocument();

    // Timestamp should be visible
    expect(screen.getByText(/Created.*days ago/i)).toBeInTheDocument();
  });

  it('should integrate visually without breaking TaskCard layout', () => {
    const task = {
      id: '9',
      text: 'Layout test task',
      status: 'active' as const,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      completedAt: null,
    };

    const { container } = render(<TaskCard task={task} {...mockHandlers} />);

    // TaskCard should have the expected structure
    const taskCard = container.querySelector('li');
    expect(taskCard).toBeInTheDocument();

    // Age indicator should be present
    const ageIndicator = container.querySelector('[role="img"]');
    expect(ageIndicator).toBeInTheDocument();

    // Task content should be present
    expect(screen.getByText('Layout test task')).toBeInTheDocument();

    // Action buttons should be present
    expect(screen.getByLabelText(/Complete task/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Delete task/i)).toBeInTheDocument();
  });

  it('should handle invalid timestamps gracefully without crashing', () => {
    const taskWithInvalidTimestamp = {
      id: '10',
      text: 'Invalid timestamp task',
      status: 'active' as const,
      createdAt: 'invalid-date',
      completedAt: null,
    };

    // Should not throw error
    expect(() => {
      render(<TaskCard task={taskWithInvalidTimestamp} {...mockHandlers} />);
    }).not.toThrow();

    // Task should still render
    expect(screen.getByText('Invalid timestamp task')).toBeInTheDocument();
  });
});
