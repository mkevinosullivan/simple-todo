import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorToast } from '../../../src/components/ErrorToast';

describe('ErrorToast', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with error message', () => {
    render(<ErrorToast message="Failed to delete task" onDismiss={mockOnDismiss} />);

    expect(screen.getByText('Failed to delete task')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(<ErrorToast message="Test error" onDismiss={mockOnDismiss} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('should call onDismiss when dismiss button is clicked', async () => {
    vi.useRealTimers(); // Use real timers for user events
    const user = userEvent.setup();
    render(<ErrorToast message="Test error" onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByLabelText('Dismiss error');
    await user.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    vi.useFakeTimers(); // Restore fake timers
  });

  it('should auto-dismiss after specified duration', () => {
    render(<ErrorToast message="Test error" onDismiss={mockOnDismiss} autoDismissMs={5000} />);

    expect(mockOnDismiss).not.toHaveBeenCalled();

    // Fast-forward time by 5 seconds
    vi.advanceTimersByTime(5000);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should not auto-dismiss if autoDismissMs is 0', () => {
    render(<ErrorToast message="Test error" onDismiss={mockOnDismiss} autoDismissMs={0} />);

    // Fast-forward time by 10 seconds
    vi.advanceTimersByTime(10000);

    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('should be keyboard accessible', async () => {
    vi.useRealTimers(); // Use real timers for user events
    const user = userEvent.setup();
    render(<ErrorToast message="Test error" onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByLabelText('Dismiss error');

    // Tab to dismiss button
    await user.tab();
    expect(dismissButton).toHaveFocus();

    // Activate with Enter
    await user.keyboard('{Enter}');
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    vi.useFakeTimers(); // Restore fake timers
  });

  it('should clear auto-dismiss timer when unmounted', () => {
    const { unmount } = render(
      <ErrorToast message="Test error" onDismiss={mockOnDismiss} autoDismissMs={5000} />
    );

    // Unmount before auto-dismiss
    unmount();

    // Fast-forward time
    vi.advanceTimersByTime(5000);

    // onDismiss should not be called
    expect(mockOnDismiss).not.toHaveBeenCalled();
  });
});
