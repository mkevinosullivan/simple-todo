import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../src/App';
import { createTestTask } from '../helpers/factories';
import { server } from '../helpers/testSetup';

// Mock announceToScreenReader
vi.mock('../../src/utils/announceToScreenReader', () => ({
  announceToScreenReader: vi.fn(),
}));

describe('WIP Limit Enforcement Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show WIP limit message when limit is reached', async () => {
    // Setup: Return 7 tasks (at limit)
    const tasks = Array.from({ length: 7 }, (_, i) =>
      createTestTask({ id: String(i + 1), text: `Task ${i + 1}` })
    );

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json(tasks);
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({ limit: 7, currentCount: 7, canAddTask: false });
      })
    );

    render(<App />);

    // Wait for WIP limit message to appear
    await waitFor(
        () => {
      expect(screen.getByText(/you have 7 active tasks/i)).toBeInTheDocument();
    },
        { timeout: 5000 }
      );

    // Verify message content
    expect(screen.getByText(/complete or delete a task/i)).toBeInTheDocument();

    // Verify add button is disabled
    const addButton = screen.getByRole('button', { name: /cannot add task/i });
    expect(addButton).toBeDisabled();
  });

  it('should hide WIP limit message when below limit', async () => {
    // Setup: Return 5 tasks (below limit)
    const tasks = Array.from({ length: 5 }, (_, i) =>
      createTestTask({ id: String(i + 1), text: `Task ${i + 1}` })
    );

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json(tasks);
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({ limit: 7, currentCount: 5, canAddTask: true });
      })
    );

    render(<App />);

    // Wait for tasks to load
    await waitFor(
        () => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    },
        { timeout: 5000 }
      );

    // Verify WIP limit message is NOT shown
    expect(screen.queryByText(/you have 7 active tasks/i)).not.toBeInTheDocument();

    // Verify add button is enabled
    const addButton = screen.getByRole('button', { name: /add task/i });
    expect(addButton).not.toBeDisabled();
  });

  it('should update WIP count indicator in real-time', async () => {
    // Setup: Start with 5 tasks
    let currentTasks = Array.from({ length: 5 }, (_, i) =>
      createTestTask({ id: String(i + 1), text: `Task ${i + 1}` })
    );

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json(currentTasks);
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({ limit: 7, currentCount: currentTasks.length, canAddTask: currentTasks.length < 7 });
      }),
      http.delete('http://localhost:3001/api/tasks/:id', ({ params }) => {
        currentTasks = currentTasks.filter((t) => t.id !== params.id);
        return new HttpResponse(null, { status: 204 });
      })
    );

    const user = userEvent.setup();
    render(<App />);

    // Wait for tasks to load
    await waitFor(
        () => {
      expect(screen.getByText(/5\/7/)).toBeInTheDocument();
    },
        { timeout: 5000 }
      );

    // Delete a task
    const deleteButtons = screen.getAllByLabelText(/delete task/i);
    await user.click(deleteButtons[0]);

    // Wait for count to update
    await waitFor(
        () => {
      expect(screen.getByText(/4\/7/)).toBeInTheDocument();
    },
        { timeout: 5000 }
      );
  });

  it('should show first-time education only once', async () => {
    const tasks = Array.from({ length: 7 }, (_, i) =>
      createTestTask({ id: String(i + 1), text: `Task ${i + 1}` })
    );

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json(tasks);
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({ limit: 7, currentCount: 7, canAddTask: false });
      })
    );

    render(<App />);

    // First time: Should show education message with "Got it!" button
    await waitFor(
        () => {
      expect(screen.getByText(/focus feature/i)).toBeInTheDocument();
    },
        { timeout: 5000 }
      );

    expect(screen.getByText(/got it!/i)).toBeInTheDocument();

    // Click "Got it!"
    const gotItButton = screen.getByText(/got it!/i);
    await userEvent.click(gotItButton);

    // Education message should be replaced with standard message
    await waitFor(
        () => {
      expect(screen.queryByText(/focus feature/i)).not.toBeInTheDocument();
    },
        { timeout: 5000 }
      );
  });

  it('should open settings when clicking WIP count indicator', async () => {
    const tasks = Array.from({ length: 5 }, (_, i) =>
      createTestTask({ id: String(i + 1), text: `Task ${i + 1}` })
    );

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json(tasks);
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({ limit: 7, currentCount: 5, canAddTask: true });
      })
    );

    const user = userEvent.setup();
    render(<App />);

    // Wait for WIP indicator to appear
    await waitFor(
        () => {
      expect(screen.getByText(/5\/7/)).toBeInTheDocument();
    },
        { timeout: 5000 }
      );

    // Click WIP count indicator
    const wipIndicator = screen.getByRole('status', { name: /active tasks/i });
    await user.click(wipIndicator);

    // Settings modal should open
    await waitFor(
        () => {
      expect(screen.getByText(/wip limit configuration/i)).toBeInTheDocument();
    },
        { timeout: 5000 }
      );
  });

  it('should open settings when clicking settings link in WIP message', async () => {
    const tasks = Array.from({ length: 7 }, (_, i) =>
      createTestTask({ id: String(i + 1), text: `Task ${i + 1}` })
    );

    server.use(
      http.get('http://localhost:3001/api/tasks', () => {
        return HttpResponse.json(tasks);
      }),
      http.get('http://localhost:3001/api/config/wip-limit', () => {
        return HttpResponse.json({ limit: 7, currentCount: 7, canAddTask: false });
      })
    );

    const user = userEvent.setup();
    render(<App />);

    // Wait for WIP limit message
    await waitFor(
        () => {
      expect(screen.getByText(/adjust your limit in settings/i)).toBeInTheDocument();
    },
        { timeout: 5000 }
      );

    // Click settings link
    const settingsLink = screen.getByText(/adjust your limit in settings/i);
    await user.click(settingsLink);

    // Settings modal should open
    await waitFor(
        () => {
      expect(screen.getByText(/wip limit configuration/i)).toBeInTheDocument();
    },
        { timeout: 5000 }
      );
  });
});
