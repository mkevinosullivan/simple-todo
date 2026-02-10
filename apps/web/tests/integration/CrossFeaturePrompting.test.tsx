import type { Config, ProactivePrompt, Task } from '@simple-todo/shared/types';
import { DEFAULT_CONFIG } from '@simple-todo/shared/types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TaskListView } from '../../src/views/TaskListView';
import { createTestPrompt, createTestTask } from '../helpers/factories';
import { server } from '../helpers/testSetup';

/**
 * Cross-Feature Integration Tests for Proactive Prompting
 *
 * Tests interactions between prompting system and other features:
 * - Celebration triggers on prompt-triggered completion
 * - WIP limit updates when completing tasks via prompts
 * - Analytics tracking for prompt responses
 * - Data integrity across features
 */
describe('CrossFeaturePrompting - Prompting Integration Tests', () => {
  let taskList: Task[] = [];
  let mockSSEPrompts: ProactivePrompt[] = [];
  let currentConfig: Config;

  beforeEach(() => {
    // Reset task list before each test
    taskList = [
      createTestTask({
        id: 'task-1',
        text: 'First task',
        status: 'active',
        createdAt: '2024-01-20T10:00:00Z',
      }),
    ];

    // Reset SSE prompts
    mockSSEPrompts = [];

    // Reset config
    currentConfig = { ...DEFAULT_CONFIG };

    // Mock GET /api/tasks
    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json(taskList);
      })
    );

    // Mock GET /api/config
    server.use(
      http.get('http://localhost:3001/api/config', () => {
        return HttpResponse.json(currentConfig);
      })
    );
  });

  afterEach(() => {
    mockSSEPrompts = [];
  });

  describe('Prompt-Triggered Completion → Celebration Flow', () => {
    it('should trigger celebration overlay when completing task via prompt', async () => {
      const taskId = 'task-1';

      // Mock PATCH /api/tasks/:id/complete
      server.use(
        http.patch(`http://localhost:3001/api/tasks/${taskId}/complete`, () => {
          const completedTask = createTestTask({
            id: taskId,
            text: 'First task',
            status: 'completed',
            completedAt: new Date().toISOString(),
          });
          taskList = taskList.filter((t) => t.id !== taskId);
          return HttpResponse.json(completedTask);
        })
      );

      // Mock POST /api/prompts/complete
      server.use(
        http.post('http://localhost:3001/api/prompts/complete', () => {
          return new HttpResponse(null, { status: 200 });
        })
      );

      // Mock GET /api/celebrations/message
      server.use(
        http.get('http://localhost:3001/api/celebrations/message', () => {
          return HttpResponse.json({
            message: 'Great work! Task completed!',
          });
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
          taskText: 'First task',
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

      // Wait for celebration overlay to appear
      await waitFor(() => {
        expect(screen.getByText(/great work! task completed!/i)).toBeInTheDocument();
      });

      // Verify celebration message is displayed
      expect(screen.getByText(/great work! task completed!/i)).toBeInTheDocument();
    });

    it('should display different celebration messages (variety)', async () => {
      const messages = [
        'Awesome! One less thing to worry about.',
        'Nice! Keep the momentum going.',
        'Well done! Progress feels good.',
      ];

      for (let i = 0; i < messages.length; i++) {
        const taskId = `task-${i}`;
        taskList = [
          createTestTask({
            id: taskId,
            text: `Task ${i}`,
            status: 'active',
          }),
        ];

        // Mock completion
        server.use(
          http.patch(`http://localhost:3001/api/tasks/${taskId}/complete`, () => {
            return HttpResponse.json(
              createTestTask({ id: taskId, status: 'completed', completedAt: new Date().toISOString() })
            );
          })
        );

        // Mock tracking
        server.use(
          http.post('http://localhost:3001/api/prompts/complete', () => {
            return new HttpResponse(null, { status: 200 });
          })
        );

        // Mock different celebration message each time
        server.use(
          http.get('http://localhost:3001/api/celebrations/message', () => {
            return HttpResponse.json({ message: messages[i] });
          })
        );

        const user = userEvent.setup();
        mockSSEPrompts = [];
        const { rerender, unmount } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

        await waitFor(() => {
          expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
        });

        mockSSEPrompts.push(createTestPrompt({ taskId, taskText: `Task ${i}` }));
        rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

        await waitFor(() => {
          expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
        });

        const completeButton = screen.getByRole('button', { name: /complete task/i });
        await user.click(completeButton);

        // Verify unique celebration message
        await waitFor(() => {
          expect(screen.getByText(new RegExp(messages[i], 'i'))).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('Prompt-Triggered Completion → WIP Limit Update', () => {
    it('should decrease WIP count when completing task via prompt', async () => {
      // Set WIP limit to 7, with 7 active tasks (at limit)
      currentConfig = {
        ...DEFAULT_CONFIG,
        wipLimit: 7,
      };

      taskList = Array.from({ length: 7 }, (_, i) =>
        createTestTask({
          id: `task-${i}`,
          text: `Task ${i}`,
          status: 'active',
        })
      );

      const taskToComplete = 'task-0';

      // Mock completion
      server.use(
        http.patch(`http://localhost:3001/api/tasks/${taskToComplete}/complete`, () => {
          const completedTask = createTestTask({
            id: taskToComplete,
            status: 'completed',
            completedAt: new Date().toISOString(),
          });
          taskList = taskList.filter((t) => t.id !== taskToComplete);
          return HttpResponse.json(completedTask);
        })
      );

      // Mock tracking
      server.use(
        http.post('http://localhost:3001/api/prompts/complete', () => {
          return new HttpResponse(null, { status: 200 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      // Verify WIP count shows 7/7 (at limit)
      await waitFor(() => {
        expect(screen.getByText(/7\/7/i)).toBeInTheDocument();
      });

      // Simulate SSE prompt
      mockSSEPrompts.push(
        createTestPrompt({
          taskId: taskToComplete,
          taskText: 'Task 0',
        })
      );

      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      // Complete task via prompt
      const completeButton = screen.getByRole('button', { name: /complete task/i });
      await user.click(completeButton);

      // Wait for task to be removed from list
      await waitFor(() => {
        expect(screen.queryByText('Task 0')).not.toBeInTheDocument();
      });

      // Verify WIP count decreased to 6/7
      await waitFor(() => {
        expect(screen.getByText(/6\/7/i)).toBeInTheDocument();
      });
    });

    it('should re-enable Add Task button when completing at WIP limit via prompt', async () => {
      // Set WIP limit to 3, with 3 active tasks (at limit)
      currentConfig = {
        ...DEFAULT_CONFIG,
        wipLimit: 3,
      };

      taskList = Array.from({ length: 3 }, (_, i) =>
        createTestTask({
          id: `task-${i}`,
          text: `Task ${i}`,
          status: 'active',
        })
      );

      const taskToComplete = 'task-0';

      // Mock completion
      server.use(
        http.patch(`http://localhost:3001/api/tasks/${taskToComplete}/complete`, () => {
          taskList = taskList.filter((t) => t.id !== taskToComplete);
          return HttpResponse.json(
            createTestTask({ id: taskToComplete, status: 'completed', completedAt: new Date().toISOString() })
          );
        })
      );

      // Mock tracking
      server.use(
        http.post('http://localhost:3001/api/prompts/complete', () => {
          return new HttpResponse(null, { status: 200 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      // Verify Add Task button is disabled (at limit)
      const addTaskSection = screen.getByTestId('add-task-section');
      const addButton = within(addTaskSection).getByRole('button', { name: /add task/i });
      expect(addButton).toBeDisabled();

      // Simulate SSE prompt
      mockSSEPrompts.push(createTestPrompt({ taskId: taskToComplete, taskText: 'Task 0' }));
      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      // Complete task via prompt
      const completeButton = screen.getByRole('button', { name: /complete task/i });
      await user.click(completeButton);

      // Wait for WIP count to update
      await waitFor(() => {
        expect(screen.getByText(/2\/3/i)).toBeInTheDocument();
      });

      // Verify Add Task button is now enabled
      await waitFor(() => {
        expect(addButton).not.toBeDisabled();
      });
    });
  });

  describe('Prompt Analytics Tracking', () => {
    it('should track complete response in analytics', async () => {
      let trackedResponse: { taskId: string } | null = null;
      const taskId = 'task-1';

      // Mock completion
      server.use(
        http.patch(`http://localhost:3001/api/tasks/${taskId}/complete`, () => {
          return HttpResponse.json(
            createTestTask({ id: taskId, status: 'completed', completedAt: new Date().toISOString() })
          );
        })
      );

      // Mock tracking with capture
      server.use(
        http.post('http://localhost:3001/api/prompts/complete', async ({ request }) => {
          const body = (await request.json()) as { taskId: string };
          trackedResponse = body;
          return new HttpResponse(null, { status: 200 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      mockSSEPrompts.push(createTestPrompt({ taskId, taskText: 'First task' }));
      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      const completeButton = screen.getByRole('button', { name: /complete task/i });
      await user.click(completeButton);

      // Verify tracking was called with correct taskId
      await waitFor(() => {
        expect(trackedResponse).not.toBeNull();
        expect(trackedResponse?.taskId).toBe(taskId);
      });
    });

    it('should track dismiss response in analytics', async () => {
      let trackedResponse: { taskId: string } | null = null;
      const taskId = 'task-1';

      // Mock tracking with capture
      server.use(
        http.post('http://localhost:3001/api/prompts/dismiss', async ({ request }) => {
          const body = (await request.json()) as { taskId: string };
          trackedResponse = body;
          return new HttpResponse(null, { status: 200 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      mockSSEPrompts.push(createTestPrompt({ taskId, taskText: 'First task' }));
      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss prompt/i });
      await user.click(dismissButton);

      // Verify tracking was called with correct taskId
      await waitFor(() => {
        expect(trackedResponse).not.toBeNull();
        expect(trackedResponse?.taskId).toBe(taskId);
      });
    });
  });

  describe('Data Integrity Across Features', () => {
    it('should maintain consistent task status after prompt completion', async () => {
      const taskId = 'task-1';
      let completedTaskFromAPI: Task | null = null;

      // Mock completion and capture completed task
      server.use(
        http.patch(`http://localhost:3001/api/tasks/${taskId}/complete`, () => {
          completedTaskFromAPI = createTestTask({
            id: taskId,
            text: 'First task',
            status: 'completed',
            completedAt: new Date().toISOString(),
          });
          taskList = taskList.filter((t) => t.id !== taskId);
          return HttpResponse.json(completedTaskFromAPI);
        })
      );

      // Mock tracking
      server.use(
        http.post('http://localhost:3001/api/prompts/complete', () => {
          return new HttpResponse(null, { status: 200 });
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      mockSSEPrompts.push(createTestPrompt({ taskId, taskText: 'First task' }));
      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      const completeButton = screen.getByRole('button', { name: /complete task/i });
      await user.click(completeButton);

      // Wait for completion
      await waitFor(() => {
        expect(completedTaskFromAPI).not.toBeNull();
      });

      // Verify task data integrity
      expect(completedTaskFromAPI?.status).toBe('completed');
      expect(completedTaskFromAPI?.completedAt).toBeDefined();
      expect(completedTaskFromAPI?.completedAt).not.toBeNull();

      // Verify task is removed from active list
      await waitFor(() => {
        expect(screen.queryByText('First task')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle prompt for already-completed task gracefully', async () => {
      const taskId = 'task-1';

      // Mock completion to return 400 (already completed)
      server.use(
        http.patch(`http://localhost:3001/api/tasks/${taskId}/complete`, () => {
          return HttpResponse.json(
            { error: 'Cannot update completed tasks' },
            { status: 400 }
          );
        })
      );

      const user = userEvent.setup();
      const { rerender } = render(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
      });

      mockSSEPrompts.push(createTestPrompt({ taskId, taskText: 'First task' }));
      rerender(<TaskListView ssePrompts={mockSSEPrompts} />);

      await waitFor(() => {
        expect(screen.getByText(/could you do this task now/i)).toBeInTheDocument();
      });

      const completeButton = screen.getByRole('button', { name: /complete task/i });
      await user.click(completeButton);

      // Toast should disappear (graceful handling)
      await waitFor(() => {
        expect(screen.queryByText(/could you do this task now/i)).not.toBeInTheDocument();
      });

      // Verify no duplicate celebration or error
      expect(screen.queryByText(/failed to complete task/i)).not.toBeInTheDocument();
    });
  });
});
