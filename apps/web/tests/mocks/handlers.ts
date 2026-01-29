import type { Task } from '@simple-todo/shared/types';
import { http, HttpResponse, type HttpHandler } from 'msw';

import { createTestTask, createTestWipConfig } from '../helpers/factories';

/**
 * MSW request handlers for API mocking
 */
export const handlers: HttpHandler[] = [
  // GET /api/tasks - successful response
  http.get('http://localhost:3001/api/tasks', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const tasks: Task[] = [
      createTestTask({ id: '1', text: 'Test task 1', createdAt: '2024-01-20T10:00:00Z' }),
      createTestTask({ id: '2', text: 'Test task 2', createdAt: '2024-01-21T10:00:00Z' }),
      createTestTask({ id: '3', text: 'Test task 3', createdAt: '2024-01-22T10:00:00Z' }),
    ];

    // Filter by status if provided
    const filteredTasks = status ? tasks.filter((task) => task.status === status) : tasks;

    return HttpResponse.json(filteredTasks);
  }),

  // POST /api/tasks - successful task creation (default)
  http.post('http://localhost:3001/api/tasks', async ({ request }) => {
    const body = (await request.json()) as { text: string };
    const newTask = createTestTask({
      id: crypto.randomUUID(),
      text: body.text,
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    return HttpResponse.json(newTask, { status: 201 });
  }),

  // PUT /api/tasks/:id - successful task update (default)
  http.put('http://localhost:3001/api/tasks/:id', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as { text: string };

    // Validate text field exists
    if (!body.text || body.text.trim() === '') {
      return HttpResponse.json({ error: 'Task text cannot be empty' }, { status: 400 });
    }

    // Return updated task
    const updatedTask = createTestTask({
      id: id as string,
      text: body.text,
      status: 'active',
      createdAt: '2024-01-22T10:00:00Z',
      completedAt: null,
    });
    return HttpResponse.json(updatedTask);
  }),

  // PATCH /api/tasks/:id/complete - successful task completion
  http.patch('http://localhost:3001/api/tasks/:id/complete', ({ params }) => {
    const { id } = params;
    const completedTask = createTestTask({
      id: id as string,
      text: 'Test task',
      status: 'completed',
      createdAt: '2024-01-22T10:00:00Z',
      completedAt: new Date().toISOString(),
    });
    return HttpResponse.json(completedTask);
  }),

  // DELETE /api/tasks/:id - successful task deletion
  http.delete('http://localhost:3001/api/tasks/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/config/wip-limit - successful WIP config retrieval
  http.get('http://localhost:3001/api/config/wip-limit', () => {
    return HttpResponse.json(createTestWipConfig());
  }),

  // PUT /api/config/wip-limit - successful WIP limit update
  http.put('http://localhost:3001/api/config/wip-limit', async ({ request }) => {
    const body = (await request.json()) as { limit: number };

    // Validate limit range
    if (body.limit < 5 || body.limit > 10) {
      return HttpResponse.json(
        { error: 'WIP limit must be between 5 and 10' },
        { status: 400 }
      );
    }

    return HttpResponse.json(createTestWipConfig({ limit: body.limit }));
  }),
];

/**
 * Handler for empty task list
 */
export const emptyTasksHandler: HttpHandler = http.get('http://localhost:3001/api/tasks', () => {
  return HttpResponse.json([]);
});

/**
 * Handler for API error
 */
export const errorHandler: HttpHandler = http.get('http://localhost:3001/api/tasks', () => {
  return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
});
