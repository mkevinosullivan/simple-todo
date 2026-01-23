import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TaskList } from '../../../src/components/TaskList';
import { createTestTask } from '../../helpers/factories';

describe('TaskList', () => {
  const mockOnComplete = vi.fn();
  const mockOnDelete = vi.fn();

  it('should show loading state while fetching', () => {
    render(
      <TaskList
        tasks={[]}
        loading={true}
        error={null}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('should render tasks after successful fetch', () => {
    const tasks = [
      createTestTask({ id: '1', text: 'Test task 1', createdAt: '2024-01-20T10:00:00Z' }),
      createTestTask({ id: '2', text: 'Test task 2', createdAt: '2024-01-21T10:00:00Z' }),
      createTestTask({ id: '3', text: 'Test task 3', createdAt: '2024-01-22T10:00:00Z' }),
    ];

    render(
      <TaskList
        tasks={tasks}
        loading={false}
        error={null}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    // Check that tasks are rendered
    expect(screen.getByText('Test task 1')).toBeInTheDocument();
    expect(screen.getByText('Test task 2')).toBeInTheDocument();
    expect(screen.getByText('Test task 3')).toBeInTheDocument();
  });

  it('should sort tasks by createdAt timestamp (newest first)', () => {
    const tasks = [
      createTestTask({ id: '1', text: 'Test task 1', createdAt: '2024-01-20T10:00:00Z' }),
      createTestTask({ id: '2', text: 'Test task 2', createdAt: '2024-01-21T10:00:00Z' }),
      createTestTask({ id: '3', text: 'Test task 3', createdAt: '2024-01-22T10:00:00Z' }),
    ];

    render(
      <TaskList
        tasks={tasks}
        loading={false}
        error={null}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    const taskElements = screen.getAllByRole('listitem');

    // Task 3 has latest createdAt (2024-01-22), should be first
    expect(taskElements[0]).toHaveTextContent('Test task 3');
    // Task 2 (2024-01-21) should be second
    expect(taskElements[1]).toHaveTextContent('Test task 2');
    // Task 1 (2024-01-20) should be last
    expect(taskElements[2]).toHaveTextContent('Test task 1');
  });

  it('should show error state on API failure', () => {
    render(
      <TaskList
        tasks={[]}
        loading={false}
        error="Failed to load tasks. Please refresh."
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Failed to load tasks. Please refresh.')).toBeInTheDocument();
  });

  it('should show EmptyState when no tasks', () => {
    render(
      <TaskList
        tasks={[]}
        loading={false}
        error={null}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(
      screen.getByText('No tasks yet. Add your first task to get started!')
    ).toBeInTheDocument();
  });

  it('should not show loading state after tasks are loaded', () => {
    const tasks = [createTestTask({ id: '1', text: 'Test task 1' })];

    render(
      <TaskList
        tasks={tasks}
        loading={false}
        error={null}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
  });
});
