import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TaskList } from '../../../src/components/TaskList';
import { server } from '../../helpers/testSetup';
import { emptyTasksHandler, errorHandler } from '../../mocks/handlers';

describe('TaskList', () => {
  it('should show loading state while fetching', () => {
    render(<TaskList />);

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('should render tasks after successful fetch', async () => {
    render(<TaskList />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Check that tasks are rendered
    expect(screen.getByText('Test task 1')).toBeInTheDocument();
    expect(screen.getByText('Test task 2')).toBeInTheDocument();
    expect(screen.getByText('Test task 3')).toBeInTheDocument();
  });

  it('should sort tasks by createdAt timestamp (newest first)', async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    const taskElements = screen.getAllByRole('listitem');

    // Task 3 has latest createdAt (2024-01-22), should be first
    expect(taskElements[0]).toHaveTextContent('Test task 3');
    // Task 2 (2024-01-21) should be second
    expect(taskElements[1]).toHaveTextContent('Test task 2');
    // Task 1 (2024-01-20) should be last
    expect(taskElements[2]).toHaveTextContent('Test task 1');
  });

  it('should show error state on API failure', async () => {
    // Override handler to return error
    server.use(errorHandler);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks. Please refresh.')).toBeInTheDocument();
    });
  });

  it('should show EmptyState when no tasks', async () => {
    // Override handler to return empty array
    server.use(emptyTasksHandler);

    render(<TaskList />);

    await waitFor(() => {
      expect(
        screen.getByText('No tasks yet. Add your first task to get started!'),
      ).toBeInTheDocument();
    });
  });

  it('should not show loading state after tasks are loaded', async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
  });
});
