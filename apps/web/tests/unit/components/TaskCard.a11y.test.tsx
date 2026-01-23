import type { Task } from '@simple-todo/shared/types';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TaskCard } from '../../../src/components/TaskCard';

expect.extend(toHaveNoViolations);

// Helper to create test task
const createTestTask = (overrides?: Partial<Task>): Task => ({
  id: '123',
  text: 'Test task',
  status: 'active',
  createdAt: new Date().toISOString(),
  completedAt: null,
  ...overrides,
});

describe('TaskCard Accessibility', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Standard Vitest mock pattern
  const mockOnComplete = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Standard Vitest mock pattern
  const mockOnDelete = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Standard Vitest mock pattern
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Standard Vitest mock pattern
    mockOnComplete.mockClear();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Standard Vitest mock pattern
    mockOnDelete.mockClear();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Standard Vitest mock pattern
    mockOnEdit.mockClear();
  });

  it('should have no accessibility violations', async () => {
    const task = createTestTask({ text: 'Buy groceries' });
    const { container } = render(
      <ul>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Standard Vitest mock pattern */}
        <TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />
      </ul>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with long task text', async () => {
    const task = createTestTask({
      text: 'This is a very long task description that contains many words to test how the component handles accessibility when the text wraps to multiple lines and takes up more vertical space',
    });
    const { container } = render(
      <ul>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Standard Vitest mock pattern */}
        <TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />
      </ul>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations for old task (age indicator)', async () => {
    const task = createTestTask({
      text: 'Old task',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    });
    const { container } = render(
      <ul>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Standard Vitest mock pattern */}
        <TaskCard task={task} onComplete={mockOnComplete} onDelete={mockOnDelete} onEdit={mockOnEdit} />
      </ul>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
