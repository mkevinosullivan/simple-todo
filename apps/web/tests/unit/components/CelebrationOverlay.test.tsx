import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { CelebrationOverlay } from '../../../src/components/CelebrationOverlay';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock announceToScreenReader utility
vi.mock('../../../src/utils/announceToScreenReader', () => ({
  announceToScreenReader: vi.fn(),
}));

describe('CelebrationOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render celebration message', () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    expect(screen.getByText('Great job!')).toBeInTheDocument();
  });

  it('should display correct icon for enthusiastic variant', () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Amazing!"
        variant="enthusiastic"
        onDismiss={mockDismiss}
      />
    );

    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('should display correct icon for supportive variant', () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Great work!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should display correct icon for motivational variant', () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Keep it up!"
        variant="motivational"
        onDismiss={mockDismiss}
      />
    );

    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('should display correct icon for data-driven variant', () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Task #5 completed"
        variant="data-driven"
        onDismiss={mockDismiss}
      />
    );

    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('should call onDismiss when celebration card is clicked', async () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    const celebrationCard = screen.getByRole('alert');
    fireEvent.click(celebrationCard);

    // Wait for exit animation (300ms)
    await waitFor(
      () => {
        expect(mockDismiss).toHaveBeenCalledTimes(1);
      },
      { timeout: 500 }
    );
  });

  it('should call onDismiss when Escape key is pressed', async () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    // Wait for exit animation (300ms)
    await waitFor(
      () => {
        expect(mockDismiss).toHaveBeenCalledTimes(1);
      },
      { timeout: 500 }
    );
  });

  it('should not call onDismiss when other keys are pressed', async () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Space' });

    // Wait a bit to ensure no dismissal happens
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockDismiss).not.toHaveBeenCalled();
  });

  it('should auto-dismiss after specified duration', async () => {
    vi.useFakeTimers();
    const mockDismiss = vi.fn();

    render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        duration={5000}
        onDismiss={mockDismiss}
      />
    );

    // Fast-forward time: 5000ms duration + 300ms exit animation
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5300);
    });

    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after default duration (7000ms) when not specified', async () => {
    vi.useFakeTimers();
    const mockDismiss = vi.fn();

    render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    // Fast-forward time: 7000ms default + 300ms exit animation
    await act(async () => {
      await vi.advanceTimersByTimeAsync(7300);
    });

    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('should have role="alert" for accessibility', () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    const celebrationCard = screen.getByRole('alert');
    expect(celebrationCard).toBeInTheDocument();
  });

  it('should have aria-live="polite" for accessibility', () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    const celebrationCard = screen.getByRole('alert');
    expect(celebrationCard).toHaveAttribute('aria-live', 'polite');
  });

  it('should have aria-label with celebration message', () => {
    const mockDismiss = vi.fn();
    const message = 'Amazing work!';

    render(
      <CelebrationOverlay
        message={message}
        variant="enthusiastic"
        onDismiss={mockDismiss}
      />
    );

    const celebrationCard = screen.getByRole('alert');
    expect(celebrationCard).toHaveAttribute('aria-label', message);
  });

  it('should be focusable with tabindex', () => {
    const mockDismiss = vi.fn();
    render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    const celebrationCard = screen.getByRole('alert');
    expect(celebrationCard).toHaveAttribute('tabindex', '0');
  });

  it('should announce message to screen reader', async () => {
    const mockDismiss = vi.fn();
    const message = 'Task completed!';

    const { announceToScreenReader } = await import('../../../src/utils/announceToScreenReader');

    render(
      <CelebrationOverlay
        message={message}
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    expect(announceToScreenReader).toHaveBeenCalledWith(message);
  });

  it('should trigger confetti on mount', async () => {
    const mockDismiss = vi.fn();
    const confetti = (await import('canvas-confetti')).default;

    render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    // Wait for confetti to be triggered (100ms delay)
    await waitFor(
      () => {
        expect(confetti).toHaveBeenCalledWith({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F97316', '#FCD34D', '#10B981', '#3B82F6'],
          ticks: 200,
          gravity: 1.2,
          scalar: 1.0,
        });
      },
      { timeout: 500 }
    );
  });

  it('should clean up event listeners on unmount', () => {
    const mockDismiss = vi.fn();
    const { unmount } = render(
      <CelebrationOverlay
        message="Great job!"
        variant="supportive"
        onDismiss={mockDismiss}
      />
    );

    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
