import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TaskCard } from '../../../src/components/TaskCard';
import { createTestTask, createTestTaskWithAge } from '../../helpers/factories';

describe('TaskCard', () => {
  const mockOnComplete = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
    mockOnDelete.mockClear();
    mockOnEdit.mockClear();
  });

  it('should render task text', () => {
    const task = createTestTask({ text: 'Buy groceries' });
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('should display age indicator for fresh tasks (< 1 day)', () => {
    const task = createTestTask(); // Just created
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    expect(screen.getByText('Created just now')).toBeInTheDocument();
  });

  it('should display age indicator for old tasks (10 days)', () => {
    const task = createTestTaskWithAge(10);
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    expect(screen.getByText('Created 10 days ago')).toBeInTheDocument();
  });

  it('should display singular "day" for 1 day old task', () => {
    const task = createTestTaskWithAge(1);
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    expect(screen.getByText('Created 1 day ago')).toBeInTheDocument();
  });

  it('should display hours for tasks less than 1 day old', () => {
    // Create task from 5 hours ago
    const fiveHoursAgo = new Date();
    fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);

    const task = createTestTask({
      createdAt: fiveHoursAgo.toISOString(),
    });

    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    expect(screen.getByText('Created 5 hours ago')).toBeInTheDocument();
  });

  it('should apply age category class for styling', () => {
    const oldTask = createTestTaskWithAge(10); // Should be "old" category
    const { container } = render(
      <TaskCard task={oldTask} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />
    );

    // Check that the age indicator circle exists with the correct title
    const ageIndicator = container.querySelector('[title="Created 10 days ago"]');
    expect(ageIndicator).toBeInTheDocument();
    expect(ageIndicator).toHaveAttribute('aria-hidden', 'true');
  });

  // New tests for action buttons
  it('should render Complete and Delete buttons with correct labels', () => {
    const task = createTestTask({ text: 'Buy groceries' });
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    expect(
      screen.getByRole('button', { name: /complete task: buy groceries/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete task: buy groceries/i })).toBeInTheDocument();
  });

  it('should call onComplete when Complete button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTestTask({ id: '123', text: 'Test task' });
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    const completeButton = screen.getByRole('button', { name: /complete task/i });
    await user.click(completeButton);

    expect(mockOnComplete).toHaveBeenCalledWith('123');
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const task = createTestTask({ id: '456', text: 'Test task' });
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('456');
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA labels on buttons', () => {
    const task = createTestTask({ text: 'Buy groceries' });
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    expect(screen.getByLabelText('Complete task: Buy groceries')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete task: Buy groceries')).toBeInTheDocument();
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const task = createTestTask();
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /edit task/i });
    const completeButton = screen.getByRole('button', { name: /complete task/i });
    const deleteButton = screen.getByRole('button', { name: /delete task/i });

    // Tab to edit button
    await user.tab();
    expect(editButton).toHaveFocus();

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
    render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    const completeButton = screen.getByRole('button', { name: /complete task/i });
    expect(completeButton).toHaveTextContent('Complete');
  });

  // Edit functionality tests
  describe('Edit functionality', () => {
    it('should render Edit button with correct aria-label', () => {
      const task = createTestTask({ text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      expect(screen.getByRole('button', { name: /edit task: buy groceries/i })).toBeInTheDocument();
    });

    it('should show input field when Edit button is clicked', async () => {
      const user = userEvent.setup();
      const task = createTestTask({ text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox', { name: /edit task/i });
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Buy groceries');
    });

    it('should auto-focus input field when entering edit mode', async () => {
      const user = userEvent.setup();
      const task = createTestTask({ text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox', { name: /edit task/i });
      expect(input).toHaveFocus();
    });

    it('should call onEdit when Save button is clicked', async () => {
      const user = userEvent.setup();
      const task = createTestTask({ id: '123', text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox', { name: /edit task/i });
      await user.clear(input);
      await user.type(input, 'Buy milk');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(mockOnEdit).toHaveBeenCalledWith('123', 'Buy milk');
    });

    it('should not call onEdit when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const task = createTestTask({ text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox', { name: /edit task/i });
      await user.clear(input);
      await user.type(input, 'Buy milk');

      const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
      await user.click(cancelButton);

      expect(mockOnEdit).not.toHaveBeenCalled();
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    it('should save changes when Enter is pressed', async () => {
      const user = userEvent.setup();
      const task = createTestTask({ id: '123', text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox', { name: /edit task/i });
      await user.clear(input);
      await user.type(input, 'Buy milk{Enter}');

      expect(mockOnEdit).toHaveBeenCalledWith('123', 'Buy milk');
    });

    it('should cancel editing when Escape is pressed', async () => {
      const user = userEvent.setup();
      const task = createTestTask({ text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox', { name: /edit task/i });
      await user.clear(input);
      await user.type(input, 'Buy milk{Escape}');

      expect(mockOnEdit).not.toHaveBeenCalled();
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    it('should disable Save button when input is empty', async () => {
      const user = userEvent.setup();
      const task = createTestTask({ text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox', { name: /edit task/i });
      await user.clear(input);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('should hide Edit, Complete, and Delete buttons in edit mode', async () => {
      const user = userEvent.setup();
      const task = createTestTask({ text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      expect(screen.queryByRole('button', { name: /edit task/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /complete task/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete task/i })).not.toBeInTheDocument();
    });

    it('should show Save and Cancel buttons in edit mode', async () => {
      const user = userEvent.setup();
      const task = createTestTask({ text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel editing/i })).toBeInTheDocument();
    });

    it('should disable Edit button when isEditingDisabled is true', () => {
      const task = createTestTask({ text: 'Buy groceries' });
      render(
        <TaskCard
          task={task}
          onComplete={mockOnComplete}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          isEditingDisabled={true}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit task/i });
      expect(editButton).toBeDisabled();
    });

    it('should trim whitespace when saving', async () => {
      const user = userEvent.setup();
      const task = createTestTask({ id: '123', text: 'Buy groceries' });
      render(<TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox', { name: /edit task/i });
      await user.clear(input);
      await user.type(input, '  Buy milk  ');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(mockOnEdit).toHaveBeenCalledWith('123', 'Buy milk');
    });
  });
});
