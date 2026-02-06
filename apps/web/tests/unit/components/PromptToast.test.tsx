import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { PromptToast } from '../../../src/components/PromptToast';
import { createTestPrompt } from '../../helpers/factories';

describe('PromptToast', () => {
  const mockOnComplete = vi.fn();
  const mockOnDismiss = vi.fn();
  const mockOnSnooze = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render prompt message with correct format', () => {
    const prompt = createTestPrompt({ taskText: 'Buy groceries' });
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    expect(screen.getByText('Could you do this task now?')).toBeInTheDocument();
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('should render three action buttons with correct labels', () => {
    const prompt = createTestPrompt();
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    expect(screen.getByRole('button', { name: /complete task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dismiss prompt/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /snooze task/i })).toBeInTheDocument();
  });

  it('should truncate long task text at 60 characters', () => {
    const longText = 'a'.repeat(100);
    const prompt = createTestPrompt({ taskText: longText });
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    // Should show truncated text with ellipsis
    const displayedText = screen.getByText(/a{60}\.\.\./);
    expect(displayedText).toBeInTheDocument();
    expect(displayedText.textContent).toHaveLength(63); // 60 + "..."
  });

  it('should show expand hint when task text is truncated', () => {
    const longText = 'a'.repeat(100);
    const prompt = createTestPrompt({ taskText: longText });
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    expect(screen.getByText('Click to expand')).toBeInTheDocument();
  });

  it('should expand task text when clicked', () => {
    const longText = 'a'.repeat(100);
    const prompt = createTestPrompt({ taskText: longText });
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    // Initially truncated
    expect(screen.getByText(/a{60}\.\.\./)).toBeInTheDocument();

    // Click to expand
    const taskTextElement = screen.getByText(/a{60}\.\.\./);
    fireEvent.click(taskTextElement);

    // Should show full text
    const fullText = screen.getByText('a'.repeat(100));
    expect(fullText).toBeInTheDocument();
  });

  it('should collapse expanded text when clicked again', () => {
    const longText = 'a'.repeat(100);
    const prompt = createTestPrompt({ taskText: longText });
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    const taskTextElement = screen.getByText(/a{60}\.\.\./);

    // Expand
    fireEvent.click(taskTextElement);
    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();

    // Collapse
    const expandedElement = screen.getByText('a'.repeat(100));
    fireEvent.click(expandedElement);
    expect(screen.getByText(/a{60}\.\.\./)).toBeInTheDocument();
  });

  it('should call onComplete when Complete button is clicked', async () => {
    const prompt = createTestPrompt({ taskId: '123' });
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    const completeButton = screen.getByRole('button', { name: /complete task/i });
    fireEvent.click(completeButton);

    // Wait for animation delay
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith('123');
    });
  });

  it('should call onDismiss when Dismiss button is clicked', async () => {
    const prompt = createTestPrompt();
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss prompt/i });
    fireEvent.click(dismissButton);

    // Wait for animation delay
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  it('should call onSnooze when Snooze button is clicked', async () => {
    const prompt = createTestPrompt({ taskId: '456' });
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    const snoozeButton = screen.getByRole('button', { name: /snooze task/i });
    fireEvent.click(snoozeButton);

    // Wait for animation delay
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockOnSnooze).toHaveBeenCalledWith('456');
    });
  });

  it('should auto-dismiss after 30 seconds', async () => {
    const prompt = createTestPrompt();
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    // Fast-forward 30 seconds
    await vi.advanceTimersByTimeAsync(30000);

    // Wait for animation delay
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  it('should show countdown timer', () => {
    const prompt = createTestPrompt();
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    expect(screen.getByText('Auto-dismiss: 30s')).toBeInTheDocument();
  });

  it('should update countdown timer every second', async () => {
    const prompt = createTestPrompt();
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    expect(screen.getByText('Auto-dismiss: 30s')).toBeInTheDocument();

    // Advance 1 second
    await vi.advanceTimersByTimeAsync(1000);

    await waitFor(() => {
      expect(screen.getByText('Auto-dismiss: 29s')).toBeInTheDocument();
    });

    // Advance 5 more seconds
    await vi.advanceTimersByTimeAsync(5000);

    await waitFor(() => {
      expect(screen.getByText('Auto-dismiss: 24s')).toBeInTheDocument();
    });
  });

  it('should have role="alert" for screen reader announcement', () => {
    const prompt = createTestPrompt();
    const { container } = render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    const toastElement = container.querySelector('[role="alert"]');
    expect(toastElement).toBeInTheDocument();
  });

  it('should have aria-live="polite" for screen reader', () => {
    const prompt = createTestPrompt();
    const { container } = render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    const toastElement = container.querySelector('[aria-live="polite"]');
    expect(toastElement).toBeInTheDocument();
  });

  it('should dismiss when Escape key is pressed', async () => {
    const prompt = createTestPrompt();
    const { container } = render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    const toastElement = container.querySelector('[role="alert"]') as HTMLElement;
    fireEvent.keyDown(toastElement, { key: 'Escape', code: 'Escape' });

    // Wait for animation delay
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  it('should expand text when Enter is pressed on truncated text', () => {
    const longText = 'a'.repeat(100);
    const prompt = createTestPrompt({ taskText: longText });
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    const taskTextElement = screen.getByText(/a{60}\.\.\./);
    fireEvent.keyDown(taskTextElement, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();
  });

  it('should expand text when Space is pressed on truncated text', () => {
    const longText = 'a'.repeat(100);
    const prompt = createTestPrompt({ taskText: longText });
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    const taskTextElement = screen.getByText(/a{60}\.\.\./);
    fireEvent.keyDown(taskTextElement, { key: ' ', code: 'Space' });

    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();
  });

  it('should not show expand hint when task text is not truncated', () => {
    const shortText = 'Short task';
    const prompt = createTestPrompt({ taskText: shortText });
    render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    expect(screen.queryByText('Click to expand')).not.toBeInTheDocument();
  });

  it('should render in bottom-right position by default', () => {
    const prompt = createTestPrompt();
    const { container } = render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
      />
    );

    const toastElement = container.firstChild as HTMLElement;
    expect(toastElement.classList.contains('bottomRight')).toBe(true);
  });

  it('should render in top-right position when specified', () => {
    const prompt = createTestPrompt();
    const { container } = render(
      <PromptToast
        prompt={prompt}
        onComplete={mockOnComplete}
        onDismiss={mockOnDismiss}
        onSnooze={mockOnSnooze}
        position="top-right"
      />
    );

    const toastElement = container.firstChild as HTMLElement;
    expect(toastElement.classList.contains('topRight')).toBe(true);
  });
});
