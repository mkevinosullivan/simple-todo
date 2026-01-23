import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TaskCard } from '../../../src/components/TaskCard';
import { createTestTask, createTestTaskWithAge } from '../../helpers/factories';

describe('TaskCard', () => {
  const mockOnComplete = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
    mockOnDelete.mockClear();
  });

  it('should render task text', () => {
    const task = createTestTask({ text: 'Buy groceries' });
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('should display age indicator for fresh tasks (< 1 day)', () => {
    const task = createTestTask(); // Just created
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    expect(screen.getByText('Created just now')).toBeInTheDocument();
  });

  it('should display age indicator for old tasks (10 days)', () => {
    const task = createTestTaskWithAge(10);
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    expect(screen.getByText('Created 10 days ago')).toBeInTheDocument();
  });

  it('should display singular "day" for 1 day old task', () => {
    const task = createTestTaskWithAge(1);
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    expect(screen.getByText('Created 1 day ago')).toBeInTheDocument();
  });

  it('should display hours for tasks less than 1 day old', () => {
    // Create task from 5 hours ago
    const fiveHoursAgo = new Date();
    fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);

    const task = createTestTask({
      createdAt: fiveHoursAgo.toISOString(),
    });

    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    expect(screen.getByText('Created 5 hours ago')).toBeInTheDocument();
  });

  it('should apply age category class for styling', () => {
    const oldTask = createTestTaskWithAge(10); // Should be "old" category
    const { container } = render(
      <TaskCard task={oldTask} onComplete={mockOnComplete} onDelete={mockOnDelete} />
    );

    // Check that the age indicator circle exists with the correct title
    const ageIndicator = container.querySelector('[title="Created 10 days ago"]');
    expect(ageIndicator).toBeInTheDocument();
    expect(ageIndicator).toHaveAttribute('aria-hidden', 'true');
  });

  // New tests for action buttons
  it('should render Complete and Delete buttons with correct labels', () => {
    const task = createTestTask({ text: 'Buy groceries' });
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    expect(
      screen.getByRole('button', { name: /complete task: buy groceries/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete task: buy groceries/i })).toBeInTheDocument();
  });

  it('should call onComplete when Complete button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTestTask({ id: '123', text: 'Test task' });
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    const completeButton = screen.getByRole('button', { name: /complete task/i });
    await user.click(completeButton);

    expect(mockOnComplete).toHaveBeenCalledWith('123');
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTestTask({ id: '456', text: 'Test task' });
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('456');
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA labels on buttons', () => {
    const task = createTestTask({ text: 'Buy groceries' });
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    expect(screen.getByLabelText('Complete task: Buy groceries')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete task: Buy groceries')).toBeInTheDocument();
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const task = createTestTask();
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    const completeButton = screen.getByRole('button', { name: /complete task/i });
    const deleteButton = screen.getByRole('button', { name: /delete task/i });

    // Tab to complete button
    await user.tab();
    expect(completeButton).toHaveFocus();

    // Tab to delete button
    await user.tab();
    expect(deleteButton).toHaveFocus();

    // Activate with Enter
    await user.keyboard('{Enter}');
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should have visible Complete button text', () => {
    const task = createTestTask();
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    const completeButton = screen.getByRole('button', { name: /complete task/i });
    expect(completeButton).toHaveTextContent('Complete');
  });
});
