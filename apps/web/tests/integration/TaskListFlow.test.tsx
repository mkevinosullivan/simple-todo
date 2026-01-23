import type { Task } from '@simple-todo/shared/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { TaskListView } from '../../src/views/TaskListView';
import { createTestTask } from '../helpers/factories';
import { server } from '../helpers/testSetup';

describe('TaskListFlow - Task Creation Integration', () => {
  it('should add task, display it in list, and clear input', async () => {
    let taskList: Task[] = [];

    // Mock GET /api/tasks to return current task list
    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json(taskList);
      })
    );

    // Mock POST /api/tasks to create new task and add to list
    server.use(
      http.post('http://localhost:3001/api/tasks', async ({ request }) => {
        const body = (await request.json()) as { text: string };
        const newTask = createTestTask({
          id: crypto.randomUUID(),
          text: body.text,
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: null,
        });
        taskList = [newTask, ...taskList];
        return HttpResponse.json(newTask, { status: 201 });
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Should show empty state initially
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();

    // Add a task
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'Buy groceries');
    await user.click(button);

    // Wait for task to appear in list
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    // Input should be cleared
    expect(input).toHaveValue('');

    // Empty state should be gone
    expect(screen.queryByText(/no tasks yet/i)).not.toBeInTheDocument();
  });

  it('should show error when API fails and preserve input value', async () => {
    // Mock GET /api/tasks to return empty list
    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json([]);
      })
    );

    // Mock POST /api/tasks to return error
    server.use(
      http.post('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json({ error: 'Server error occurred' }, { status: 500 });
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Add a task
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'Test task');
    await user.click(button);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Server error occurred/i)).toBeInTheDocument();
    });

    // Input should preserve value for retry
    expect(input).toHaveValue('Test task');

    // Task should NOT appear in list (still empty state)
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('should display multiple tasks in newest-first order', async () => {
    const task1 = createTestTask({
      id: '1',
      text: 'First task',
      createdAt: '2024-01-20T10:00:00Z',
    });
    const task2 = createTestTask({
      id: '2',
      text: 'Second task',
      createdAt: '2024-01-21T10:00:00Z',
    });

    let taskList: Task[] = [task1, task2];

    // Mock GET /api/tasks to return existing tasks
    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json(taskList);
      })
    );

    // Mock POST /api/tasks to create new task
    server.use(
      http.post('http://localhost:3001/api/tasks', async ({ request }) => {
        const body = (await request.json()) as { text: string };
        const newTask = createTestTask({
          id: '3',
          text: body.text,
          status: 'active',
          createdAt: new Date().toISOString(), // Most recent
          completedAt: null,
        });
        taskList = [newTask, ...taskList];
        return HttpResponse.json(newTask, { status: 201 });
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Second task')).toBeInTheDocument();
    });

    // Verify initial order (newest first: task2, task1)
    const initialTasks = screen.getAllByRole('listitem');
    expect(initialTasks[0]).toHaveTextContent('Second task');
    expect(initialTasks[1]).toHaveTextContent('First task');

    // Add a new task
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Third task');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    // Wait for new task to appear
    await waitFor(() => {
      expect(screen.getByText('Third task')).toBeInTheDocument();
    });

    // Verify new task appears at the top (newest first)
    const updatedTasks = screen.getAllByRole('listitem');
    expect(updatedTasks[0]).toHaveTextContent('Third task');
    expect(updatedTasks[1]).toHaveTextContent('Second task');
    expect(updatedTasks[2]).toHaveTextContent('First task');
  });
});

describe('TaskListFlow - Complete and Delete Actions', () => {
  it('should complete task, remove from list, and fetch celebration', async () => {
    const task = createTestTask({
      id: '1',
      text: 'Buy groceries',
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: null,
    });

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json([task]);
      })
    );

    server.use(
      http.patch('http://localhost:3001/api/tasks/1/complete', () => {
        return HttpResponse.json({
          ...task,
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
      })
    );

    server.use(
      http.get('http://localhost:3001/api/celebrations/message', () => {
        return HttpResponse.json({ message: 'Great job!', variant: 'supportive' });
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    // Wait for task to load
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    // Click complete button
    const completeButton = screen.getByRole('button', { name: /complete task: buy groceries/i });
    await user.click(completeButton);

    // Task should be removed immediately (optimistic update)
    await waitFor(() => {
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });

    // Should show empty state
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('should delete task and remove from list', async () => {
    const task = createTestTask({
      id: '1',
      text: 'Old task',
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: null,
    });

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json([task]);
      })
    );

    server.use(
      http.delete('http://localhost:3001/api/tasks/1', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    // Wait for task to load
    await waitFor(() => {
      expect(screen.getByText('Old task')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete task: old task/i });
    await user.click(deleteButton);

    // Task should be removed immediately (optimistic update)
    await waitFor(() => {
      expect(screen.queryByText('Old task')).not.toBeInTheDocument();
    });

    // Should show empty state
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('should rollback on complete API failure and show error toast', async () => {
    const task = createTestTask({
      id: '1',
      text: 'Buy groceries',
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: null,
    });

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json([task]);
      })
    );

    server.use(
      http.patch('http://localhost:3001/api/tasks/1/complete', () => {
        return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /complete task: buy groceries/i });
    await user.click(completeButton);

    // Task should reappear after API failure
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    // Error toast should be shown
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to complete task/i);
  });

  it('should rollback on delete API failure and show error toast', async () => {
    const task = createTestTask({
      id: '1',
      text: 'Important task',
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: null,
    });

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json([task]);
      })
    );

    server.use(
      http.delete('http://localhost:3001/api/tasks/1', () => {
        return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    await waitFor(() => {
      expect(screen.getByText('Important task')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete task: important task/i });
    await user.click(deleteButton);

    // Task should reappear after API failure
    await waitFor(() => {
      expect(screen.getByText('Important task')).toBeInTheDocument();
    });

    // Error toast should be shown
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to delete task/i);
  });
});

describe('TaskListFlow - Edit Task Actions', () => {
  it('should edit task, update text in list, and call API', async () => {
    const task = createTestTask({
      id: '1',
      text: 'Buy groceries',
      status: 'active',
      createdAt: '2024-01-22T10:00:00Z',
      completedAt: null,
    });

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json([task]);
      })
    );

    server.use(
      http.put('http://localhost:3001/api/tasks/1', async ({ request }) => {
        const body = (await request.json()) as { text: string };
        return HttpResponse.json({
          ...task,
          text: body.text,
        });
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    // Wait for task to load
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit task: buy groceries/i });
    await user.click(editButton);

    // Edit text
    const input = screen.getByRole('textbox', { name: /edit task/i });
    await user.clear(input);
    await user.type(input, 'Buy milk');

    // Click save button
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Task text should be updated immediately (optimistic update)
    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
    });

    // Original text should be gone
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
  });

  it('should cancel edit without API call', async () => {
    const task = createTestTask({
      id: '1',
      text: 'Buy groceries',
      status: 'active',
      createdAt: '2024-01-22T10:00:00Z',
      completedAt: null,
    });

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json([task]);
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit task: buy groceries/i });
    await user.click(editButton);

    const input = screen.getByRole('textbox', { name: /edit task/i });
    await user.clear(input);
    await user.type(input, 'Buy milk');

    const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
    await user.click(cancelButton);

    // Original text should remain
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    // New text should not appear
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
  });

  it('should show validation error for empty text', async () => {
    const task = createTestTask({
      id: '1',
      text: 'Buy groceries',
      status: 'active',
      createdAt: '2024-01-22T10:00:00Z',
      completedAt: null,
    });

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json([task]);
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit task: buy groceries/i });
    await user.click(editButton);

    const input = screen.getByRole('textbox', { name: /edit task/i });
    await user.clear(input);

    // Save button should be disabled
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('should rollback on edit API failure and show error toast', async () => {
    const task = createTestTask({
      id: '1',
      text: 'Buy groceries',
      status: 'active',
      createdAt: '2024-01-22T10:00:00Z',
      completedAt: null,
    });

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json([task]);
      })
    );

    server.use(
      http.put('http://localhost:3001/api/tasks/1', () => {
        return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit task: buy groceries/i });
    await user.click(editButton);

    const input = screen.getByRole('textbox', { name: /edit task/i });
    await user.clear(input);
    await user.type(input, 'Buy milk');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Task should revert to original text after API failure
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    // New text should not appear
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();

    // Error toast should be shown
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to update task/i);
  });

  it('should handle editing with keyboard shortcuts', async () => {
    const task = createTestTask({
      id: '1',
      text: 'Buy groceries',
      status: 'active',
      createdAt: '2024-01-22T10:00:00Z',
      completedAt: null,
    });

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json([task]);
      })
    );

    server.use(
      http.put('http://localhost:3001/api/tasks/1', async ({ request }) => {
        const body = (await request.json()) as { text: string };
        return HttpResponse.json({
          ...task,
          text: body.text,
        });
      })
    );

    const user = userEvent.setup();
    render(<TaskListView />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit task: buy groceries/i });
    await user.click(editButton);

    const input = screen.getByRole('textbox', { name: /edit task/i });
    await user.clear(input);
    await user.type(input, 'Buy milk{Enter}');

    // Task text should be updated (Enter key saves)
    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
    });
  });
});
