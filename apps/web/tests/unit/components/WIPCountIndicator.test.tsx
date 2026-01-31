import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WIPCountIndicator } from '../../../src/components/WIPCountIndicator';

describe('WIPCountIndicator', () => {
  const mockOnOpenSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display correct count format ([N]/[limit])', () => {
    render(
      <WIPCountIndicator currentCount={5} limit={7} onOpenSettings={mockOnOpenSettings} />
    );
    expect(screen.getByText('5/7')).toBeInTheDocument();
  });

  it('should have green styling when below 60% (0-60%)', () => {
    render(
      <WIPCountIndicator
        currentCount={3}
        limit={10}
        onOpenSettings={mockOnOpenSettings}
      />
    );
    const indicator = screen.getByRole('status');
    expect(indicator.className).toContain('below-limit');
  });

  it('should have yellow styling when 60-90%', () => {
    render(
      <WIPCountIndicator
        currentCount={7}
        limit={10}
        onOpenSettings={mockOnOpenSettings}
      />
    );
    const indicator = screen.getByRole('status');
    expect(indicator.className).toContain('approaching-limit');
  });

  it('should have orange styling when 90-100%', () => {
    render(
      <WIPCountIndicator
        currentCount={10}
        limit={10}
        onOpenSettings={mockOnOpenSettings}
      />
    );
    const indicator = screen.getByRole('status');
    expect(indicator.className).toContain('at-limit');
  });

  it('should show tooltip on hover', () => {
    render(
      <WIPCountIndicator currentCount={5} limit={7} onOpenSettings={mockOnOpenSettings} />
    );
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('title', 'Work In Progress limit helps you stay focused');
  });

  it('should open settings when clicked', () => {
    render(
      <WIPCountIndicator currentCount={5} limit={7} onOpenSettings={mockOnOpenSettings} />
    );
    const indicator = screen.getByRole('status');
    fireEvent.click(indicator);
    expect(mockOnOpenSettings).toHaveBeenCalled();
  });

  it('should open settings when Enter key is pressed', () => {
    render(
      <WIPCountIndicator currentCount={5} limit={7} onOpenSettings={mockOnOpenSettings} />
    );
    const indicator = screen.getByRole('status');
    fireEvent.keyDown(indicator, { key: 'Enter' });
    expect(mockOnOpenSettings).toHaveBeenCalled();
  });

  it('should open settings when Space key is pressed', () => {
    render(
      <WIPCountIndicator currentCount={5} limit={7} onOpenSettings={mockOnOpenSettings} />
    );
    const indicator = screen.getByRole('status');
    fireEvent.keyDown(indicator, { key: ' ' });
    expect(mockOnOpenSettings).toHaveBeenCalled();
  });

  it('should have proper accessibility label', () => {
    render(
      <WIPCountIndicator currentCount={5} limit={7} onOpenSettings={mockOnOpenSettings} />
    );
    const indicator = screen.getByRole('status');
    // 5/7 = 71.4% which is in the "approaching limit" range (60-90%)
    expect(indicator).toHaveAttribute('aria-label', '5 of 7 active tasks, approaching limit');
  });

  it('should be keyboard focusable', () => {
    render(
      <WIPCountIndicator currentCount={5} limit={7} onOpenSettings={mockOnOpenSettings} />
    );
    const indicator = screen.getByRole('status');
    expect(indicator.tagName).toBe('BUTTON');
  });
});
