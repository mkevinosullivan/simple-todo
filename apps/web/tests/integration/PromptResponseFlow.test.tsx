import type { ProactivePrompt, Task } from '@simple-todo/shared/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TaskListView } from '../../src/views/TaskListView';
import { createTestPrompt, createTestTask } from '../helpers/factories';
import { server } from '../helpers/testSetup';

describe('PromptResponseFlow - Prompt Action Integration Tests', () => {
  let taskList: Task[] = [];
  let mockSSEPrompts: ProactivePrompt[] = [];

  beforeEach(() => {
    // Reset task list before each test
    taskList = [
      createTestTask({
        id: 'task-1',
        text: 'Task to be prompted',
        status: 'active',
        createdAt: '2024-01-20T10:00:00Z',
      }),
    ];

    // Reset SSE prompts
    mockSSEPrompts = [];

    // Mock GET /api/tasks to return current task list
    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json(taskList);
      })
    );
  });

  afterEach(() => {
    mockSSEPrompts = [];
  });

  describe('Complete Action', () => {
    it('should complete task, track response, trigger celebration, and dismiss toast', async () => {
      let completeCalled = false;
      let completeTrackingCalled = false;
      const taskId = 'task-1';

      // Mock PATCH /api/tasks/:id/complete
      server.use(
        http.patch(`http://localhost:3001/api/tasks/${taskId}/complete`, () => {
          completeCalled = true;
          const completedTask = createTestTask({
            id: taskId,
            text: 'Task to be prompted',
            status: 'completed',
            completedAt: new Date().toISOString(),
          });
          // Remove from task list
          taskList = taskList.filter((t) => t.id !== taskId);
          return HttpResponse.json(completedTask);
        })
      );

      // Mock POST /api/prompts/complete for tracking
      server.use(
        http.post('http://localhost:3001/api/prompts/complete', () => {
          completeTrackingCalled = true;
          return new HttpResponse(null, { status: 200 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      // Verify task is displayed
      expect(screen.getByText('Task to be prompted')).toBeInTheDocument();

      // Simulate SSE prompt by pushing to mock array and rerendering
      mockSSEPrompts.push(
        createTestPrompt({
          taskId,
          taskText: 'Task to be prompted',
        })
      );

      // Force re-render to trigger useEffect that queues prompts
      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for prompt toast to appear
      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      // Verify task text is shown in prompt
      expect(screen.getByText('Task to be prompted')).toBeInTheDocument();

      // Click Complete button
      const completeButton = screen.getByRole('button', { name: /complete task/i });
      await user.click(completeButton);

      // Wait for toast to disappear
      await waitFor(() => {
        expect(screen.queryByText(/could you do this task now/i)).not.toBeInTheDocument();
      });

      // Verify both APIs were called
      expect(completeCalled).toBe(true);
      expect(completeTrackingCalled).toBe(true);

      // Verify task is removed from list (completed)
      await waitFor(() => {
        expect(screen.queryByText('Task to be prompted')).not.toBeInTheDocument();
      });

      // Note: Celebration would appear but is tested separately in CelebrationFlow.test.tsx
    });

    it('should show error and keep toast visible when complete fails', async () => {
      const taskId = 'task-1';

      // Mock PATCH /api/tasks/:id/complete to fail
      server.use(
        http.patch(`http://localhost:3001/api/tasks/${taskId}/complete`, () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      // Simulate SSE prompt
      mockSSEPrompts.push(
        createTestPrompt({
          taskId,
          taskText: 'Task to be prompted',
        })
      );

      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for prompt toast
      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      // Click Complete button
      const completeButton = screen.getByRole('button', { name: /complete task/i });
      await user.click(completeButton);

      // Wait for error toast
      await waitFor(() => {
        expect(screen.getByText(/failed to complete task/i)).toBeInTheDocument();
      });

      // Task should still be in the list (rollback)
      expect(screen.getByText('Task to be prompted')).toBeInTheDocument();
    });
  });

  describe('Dismiss Action', () => {
    it('should dismiss toast and track dismissal', async () => {
      let dismissTrackingCalled = false;
      const taskId = 'task-1';

      // Mock POST /api/prompts/dismiss for tracking
      server.use(
        http.post('http://localhost:3001/api/prompts/dismiss', async ({ request }) => {
          const body = (await request.json()) as { taskId: string };
          expect(body.taskId).toBe(taskId);
          dismissTrackingCalled = true;
          return new HttpResponse(null, { status: 200 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      // Simulate SSE prompt
      mockSSEPrompts.push(
        createTestPrompt({
          taskId,
          taskText: 'Task to be prompted',
        })
      );

      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for prompt toast
      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      // Click Dismiss button
      const dismissButton = screen.getByRole('button', { name: /dismiss prompt/i });
      await user.click(dismissButton);

      // Wait for toast to disappear
      await waitFor(() => {
        expect(screen.queryByText(/could you do this task now/i)).not.toBeInTheDocument();
      });

      // Verify tracking was called
      await waitFor(() => {
        expect(dismissTrackingCalled).toBe(true);
      });

      // Task should still be in the list (not affected by dismiss)
      expect(screen.getByText('Task to be prompted')).toBeInTheDocument();
    });

    it('should still dismiss toast even if tracking fails', async () => {
      const taskId = 'task-1';

      // Mock POST /api/prompts/dismiss to fail
      server.use(
        http.post('http://localhost:3001/api/prompts/dismiss', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      // Simulate SSE prompt
      mockSSEPrompts.push(
        createTestPrompt({
          taskId,
          taskText: 'Task to be prompted',
        })
      );

      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for prompt toast
      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      // Click Dismiss button
      const dismissButton = screen.getByRole('button', { name: /dismiss prompt/i });
      await user.click(dismissButton);

      // Toast should still be dismissed (non-critical error)
      await waitFor(() => {
        expect(screen.queryByText(/could you do this task now/i)).not.toBeInTheDocument();
      });

      // Task should still be in the list
      expect(screen.getByText('Task to be prompted')).toBeInTheDocument();
    });
  });

  describe('Snooze Action', () => {
    it('should snooze prompt and dismiss toast', async () => {
      let snoozeCalled = false;
      const taskId = 'task-1';

      // Mock POST /api/prompts/snooze
      server.use(
        http.post('http://localhost:3001/api/prompts/snooze', async ({ request }) => {
          const body = (await request.json()) as { taskId: string };
          expect(body.taskId).toBe(taskId);
          snoozeCalled = true;
          return new HttpResponse(null, { status: 200 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      // Simulate SSE prompt
      mockSSEPrompts.push(
        createTestPrompt({
          taskId,
          taskText: 'Task to be prompted',
        })
      );

      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for prompt toast
      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      // Click Snooze button
      const snoozeButton = screen.getByRole('button', { name: /snooze task/i });
      await user.click(snoozeButton);

      // Wait for toast to disappear
      await waitFor(() => {
        expect(screen.queryByText(/could you do this task now/i)).not.toBeInTheDocument();
      });

      // Verify snooze API was called
      await waitFor(() => {
        expect(snoozeCalled).toBe(true);
      });

      // Task should still be in the list (snooze doesn't affect task)
      expect(screen.getByText('Task to be prompted')).toBeInTheDocument();
    });

    it('should show error and keep toast visible when snooze fails', async () => {
      const taskId = 'task-1';

      // Mock POST /api/prompts/snooze to fail
      server.use(
        http.post('http://localhost:3001/api/prompts/snooze', () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      // Simulate SSE prompt
      mockSSEPrompts.push(
        createTestPrompt({
          taskId,
          taskText: 'Task to be prompted',
        })
      );

      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for prompt toast
      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      // Click Snooze button
      const snoozeButton = screen.getByRole('button', { name: /snooze task/i });
      await user.click(snoozeButton);

      // Wait for error toast
      await waitFor(() => {
        expect(screen.getByText(/failed to snooze prompt/i)).toBeInTheDocument();
      });

      // Task should still be in the list
      expect(screen.getByText('Task to be prompted')).toBeInTheDocument();
    });
  });

  describe('Multiple Actions Flow', () => {
    it('should handle multiple prompts in sequence', async () => {
      const taskId1 = 'task-1';
      const taskId2 = 'task-2';

      // Add second task
      taskList.push(
        createTestTask({
          id: taskId2,
          text: 'Second task',
          status: 'active',
          createdAt: '2024-01-21T10:00:00Z',
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      // Verify both tasks are displayed
      expect(screen.getByText('Task to be prompted')).toBeInTheDocument();
      expect(screen.getByText('Second task')).toBeInTheDocument();

      // Queue two prompts
      mockSSEPrompts.push(
        createTestPrompt({
          taskId: taskId1,
          taskText: 'Task to be prompted',
        }),
        createTestPrompt({
          taskId: taskId2,
          taskText: 'Second task',
        })
      );

      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      // Wait for first prompt toast
      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
        expect(screen.getByText('Task to be prompted')).toBeInTheDocument();
      });

      // Dismiss first prompt
      const dismissButton = screen.getByRole('button', { name: /dismiss prompt/i });
      await user.click(dismissButton);

      // Wait for first toast to disappear
      await waitFor(() => {
        expect(screen.queryByText('Task to be prompted')).not.toBeInTheDocument();
      });

      // Wait for second prompt toast to appear (500ms delay in queue)
      await waitFor(
        () => {
          expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
          expect(screen.getByText('Second task')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Verify second prompt is now showing
      expect(screen.getByText('Second task')).toBeInTheDocument();
    });
  });
});
