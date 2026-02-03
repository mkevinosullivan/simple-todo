import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { InboxZeroState } from '../../../src/components/InboxZeroState';

// Mock canvas-confetti to prevent errors in tests
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('InboxZeroState', () => {
  const defaultProps = {
    completedCount: 5,
    onAddNewTask: vi.fn(),
    isFirstInboxZero: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render celebration heading', () => {
    render(<InboxZeroState {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'You completed everything! 🎉'
    );
  });

  it('should render task completion statistics', () => {
    render(<InboxZeroState {...defaultProps} />);

    // Check for the stats paragraph that contains the count
    const statsElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'p' && /you completed/i.test(content);
    });
    expect(statsElement).toBeInTheDocument();
    expect(statsElement).toHaveTextContent('5');
    expect(statsElement).toHaveTextContent(/tasks this session/i);
  });

  it('should render "Add New Tasks" CTA button', () => {
    render(<InboxZeroState {...defaultProps} />);

    const button = screen.getByRole('button', { name: /add new tasks/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onAddNewTask when button is clicked', () => {
    const onAddNewTask = vi.fn();
    render(<InboxZeroState {...defaultProps} onAddNewTask={onAddNewTask} />);

    const button = screen.getByRole('button', { name: /add new tasks/i });
    fireEvent.click(button);

    expect(onAddNewTask).toHaveBeenCalledTimes(1);
  });

  it('should show variant message for repeated inbox zero', () => {
    render(<InboxZeroState {...defaultProps} isFirstInboxZero={false} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      "Back to zero! You're on fire! 🔥"
    );
  });

  it('should use semantic HTML with proper heading hierarchy', () => {
    render(<InboxZeroState {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should use celebratory and encouraging tone', () => {
    render(<InboxZeroState {...defaultProps} />);

    expect(screen.getByText(/you completed everything/i)).toBeInTheDocument();
    expect(screen.getByText(/🎉/)).toBeInTheDocument();
  });

  it('should display singular "task" when completedCount is 1', () => {
    render(<InboxZeroState {...defaultProps} completedCount={1} />);

    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(screen.getByText(/task this session/i)).toBeInTheDocument();
  });

  it('should display plural "tasks" when completedCount is not 1', () => {
    render(<InboxZeroState {...defaultProps} completedCount={3} />);

    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/tasks this session/i)).toBeInTheDocument();
  });

  it('should display 0 tasks when completedCount is 0', () => {
    render(<InboxZeroState {...defaultProps} completedCount={0} />);

    expect(screen.getByText(/0/)).toBeInTheDocument();
    expect(screen.getByText(/tasks this session/i)).toBeInTheDocument();
  });
});
