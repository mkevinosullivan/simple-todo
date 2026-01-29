import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddTaskInput } from '../../../src/components/AddTaskInput';
import { TaskProvider } from '../../../src/context/TaskContext';
import { createTestTask } from '../../helpers/factories';
import { server } from '../../helpers/testSetup';

// Mock useWipStatus hook
vi.mock('../../../src/hooks/useWipStatus', () => ({
  useWipStatus: vi.fn(() => ({
    limit: 7,
    currentCount: 5,
    canAddTask: true,
    loading: false,
    error: null,
    refreshLimit: vi.fn(),
  })),
}));

// Mock announceToScreenReader
vi.mock('../../../src/utils/announceToScreenReader', () => ({
  announceToScreenReader: vi.fn(),
}));

describe('AddTaskInput', () => {
  const mockOnTaskCreated = vi.fn();
  const mockOnWipLimitReached = vi.fn();

  beforeEach(() => {
    mockOnTaskCreated.mockClear();
    mockOnWipLimitReached.mockClear();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<TaskProvider>{component}</TaskProvider>);
  };

  it('should render input field with placeholder text', () => {
    renderWithProvider(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('should update input value when typing', async () => {
    const user = userEvent.setup();
    render(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Buy groceries');

    expect(input).toHaveValue('Buy groceries');
  });

  it('should submit task when clicking Add Task button', async () => {
    server.use(
      http.post('http://localhost:3001/api/tasks', async ({ request }) => {
        const body = (await request.json()) as { text: string };
        const newTask = createTestTask({
          id: '123',
          text: body.text,
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: null,
        });
        return HttpResponse.json(newTask, { status: 201 });
      })
    );

    const user = userEvent.setup();
    render(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'Test task');
    await user.click(button);

    await waitFor(() => {
      expect(mockOnTaskCreated).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Test task' })
      );
    });

    // Input should be cleared after successful submission
    expect(input).toHaveValue('');
  });

  it('should submit task when pressing Enter key', async () => {
    server.use(
      http.post('http://localhost:3001/api/tasks', async ({ request }) => {
        const body = (await request.json()) as { text: string };
        const newTask = createTestTask({
          id: '123',
          text: body.text,
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: null,
        });
        return HttpResponse.json(newTask, { status: 201 });
      })
    );

    const user = userEvent.setup();
    render(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Test task{Enter}');

    await waitFor(() => {
      expect(mockOnTaskCreated).toHaveBeenCalled();
    });

    // Input should be cleared after successful submission
    expect(input).toHaveValue('');
  });

  it('should show error for empty input', async () => {
    const user = userEvent.setup();
    render(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const button = screen.getByRole('button', { name: /add task/i });
    await user.click(button);

    expect(screen.getByText('Task cannot be empty')).toBeInTheDocument();
    expect(mockOnTaskCreated).not.toHaveBeenCalled();
  });

  it('should show error for whitespace-only input', async () => {
    const user = userEvent.setup();
    render(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(screen.getByText('Task cannot be empty')).toBeInTheDocument();
    expect(mockOnTaskCreated).not.toHaveBeenCalled();
  });

  it('should show error for text exceeding 500 characters', async () => {
    const user = userEvent.setup();
    render(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const longText = 'a'.repeat(501);
    const input = screen.getByPlaceholderText('What needs to be done?');
    // Use paste instead of type to avoid timeout with 501 characters
    await user.click(input);
    await user.paste(longText);
    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(screen.getByText('Task too long (max 500 characters)')).toBeInTheDocument();
    expect(mockOnTaskCreated).not.toHaveBeenCalled();
  });

  it('should disable button while submitting', async () => {
    server.use(
      http.post('http://localhost:3001/api/tasks', async ({ request }) => {
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        const body = (await request.json()) as { text: string };
        const newTask = createTestTask({
          id: '123',
          text: body.text,
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: null,
        });
        return HttpResponse.json(newTask, { status: 201 });
      })
    );

    const user = userEvent.setup();
    render(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'Test task');
    void user.click(button);

    // Button should be disabled immediately
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  // Note: API error handling is covered by integration tests in TaskListFlow.test.tsx

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: /add task/i });

    // Tab to input
    await user.tab();
    expect(input).toHaveFocus();

    // Tab to button
    await user.tab();
    expect(button).toHaveFocus();
  });

  it('should have proper ARIA labels', () => {
    render(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: /add task/i });

    expect(input).toHaveAttribute('aria-label', 'New task description');
    expect(button).toHaveAttribute('aria-label', 'Add task');
  });

  it('should mark input as invalid when error is shown', async () => {
    const user = userEvent.setup();
    render(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: /add task/i });

    // Initially, aria-invalid should be false
    expect(input).toHaveAttribute('aria-invalid', 'false');

    // Trigger validation error
    await user.click(button);

    // Now aria-invalid should be true
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'task-input-error');
  });

  it('should display error message with role="alert" for screen readers', async () => {
    const user = userEvent.setup();
    renderWithProvider(<AddTaskInput onTaskCreated={mockOnTaskCreated} />);

    const button = screen.getByRole('button', { name: /add task/i });
    await user.click(button);

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('id', 'task-input-error');
    expect(errorMessage).toHaveTextContent('Task cannot be empty');
  });

  // WIP Limit Enforcement Tests
  describe('WIP limit enforcement', () => {
    it('should disable button when at WIP limit', () => {
      const { useWipStatus } = require('../../../src/hooks/useWipStatus');
      useWipStatus.mockReturnValue({
        limit: 7,
        currentCount: 7,
        canAddTask: false,
        loading: false,
        error: null,
        refreshLimit: vi.fn(),
      });

      renderWithProvider(<AddTaskInput onTaskCreated={mockOnTaskCreated} onWipLimitReached={mockOnWipLimitReached} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent(/🔒/);
    });

    it('should disable input field when at WIP limit', () => {
      const { useWipStatus } = require('../../../src/hooks/useWipStatus');
      useWipStatus.mockReturnValue({
        limit: 7,
        currentCount: 7,
        canAddTask: false,
        loading: false,
        error: null,
        refreshLimit: vi.fn(),
      });

      renderWithProvider(<AddTaskInput onTaskCreated={mockOnTaskCreated} onWipLimitReached={mockOnWipLimitReached} />);
      const input = screen.getByPlaceholderText('What needs to be done?');
      expect(input).toBeDisabled();
    });

    it('should block form submission when at WIP limit', async () => {
      const { useWipStatus } = require('../../../src/hooks/useWipStatus');
      useWipStatus.mockReturnValue({
        limit: 7,
        currentCount: 7,
        canAddTask: false,
        loading: false,
        error: null,
        refreshLimit: vi.fn(),
      });

      const user = userEvent.setup();
      renderWithProvider(<AddTaskInput onTaskCreated={mockOnTaskCreated} onWipLimitReached={mockOnWipLimitReached} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New task{Enter}');

      expect(mockOnTaskCreated).not.toHaveBeenCalled();
      expect(mockOnWipLimitReached).toHaveBeenCalled();
    });

    it('should trigger onWipLimitReached when Enter pressed at limit', async () => {
      const { useWipStatus } = require('../../../src/hooks/useWipStatus');
      useWipStatus.mockReturnValue({
        limit: 7,
        currentCount: 7,
        canAddTask: false,
        loading: false,
        error: null,
        refreshLimit: vi.fn(),
      });

      const user = userEvent.setup();
      renderWithProvider(<AddTaskInput onTaskCreated={mockOnTaskCreated} onWipLimitReached={mockOnWipLimitReached} />);

      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New task{Enter}');

      expect(mockOnWipLimitReached).toHaveBeenCalled();
    });

    it('should re-enable button when space becomes available', () => {
      const { useWipStatus } = require('../../../src/hooks/useWipStatus');
      useWipStatus.mockReturnValue({
        limit: 7,
        currentCount: 5,
        canAddTask: true,
        loading: false,
        error: null,
        refreshLimit: vi.fn(),
      });

      renderWithProvider(<AddTaskInput onTaskCreated={mockOnTaskCreated} onWipLimitReached={mockOnWipLimitReached} />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveTextContent(/🔒/);
    });

    it('should have descriptive aria-label when disabled', () => {
      const { useWipStatus } = require('../../../src/hooks/useWipStatus');
      useWipStatus.mockReturnValue({
        limit: 7,
        currentCount: 7,
        canAddTask: false,
        loading: false,
        error: null,
        refreshLimit: vi.fn(),
      });

      renderWithProvider(<AddTaskInput onTaskCreated={mockOnTaskCreated} onWipLimitReached={mockOnWipLimitReached} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Cannot add task - 7 of 7 active tasks. Complete a task first.');
    });
  });
});
