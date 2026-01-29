import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WIPCountIndicator } from '../../../src/components/WIPCountIndicator';
import { TaskProvider } from '../../../src/context/TaskContext';

// Mock useWipStatus hook
vi.mock('../../../src/hooks/useWipStatus', () => ({
  useWipStatus: vi.fn(() => ({
    limit: 7,
    currentCount: 5,
    canAddTask: true,
    loading: false,
    error: null,
    refreshLimit: vi.fn(),
  })),
}));

// Mock tasks API
vi.mock('../../../src/services/tasks', () => ({
  tasks: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
}));

describe('WIPCountIndicator', () => {
  const mockOnOpenSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<TaskProvider>{component}</TaskProvider>);
  };

  it('should display correct count format ([N]/[limit])', async () => {
    renderWithProvider(<WIPCountIndicator onOpenSettings={mockOnOpenSettings} />);
    expect(await screen.findByText('5/7')).toBeInTheDocument();
  });

  it('should have green styling when below 60% (0-60%)', () => {
    const { useWipStatus } = await import('../../../src/hooks/useWipStatus');
    vi.mocked(useWipStatus).mockReturnValue({
      limit: 10,
      currentCount: 3, // 30%
      canAddTask: true,
      loading: false,
      error: null,
      refreshLimit: vi.fn(),
    });

    renderWithProvider(<WIPCountIndicator onOpenSettings={mockOnOpenSettings} />);
    const indicator = screen.getByRole('status');
    expect(indicator.className).toContain('below-limit');
  });

  it('should have yellow styling when 60-90%', () => {
    const { useWipStatus } = await import('../../../src/hooks/useWipStatus');
    vi.mocked(useWipStatus).mockReturnValue({
      limit: 10,
      currentCount: 7, // 70%
      canAddTask: true,
      loading: false,
      error: null,
      refreshLimit: vi.fn(),
    });

    renderWithProvider(<WIPCountIndicator onOpenSettings={mockOnOpenSettings} />);
    const indicator = screen.getByRole('status');
    expect(indicator.className).toContain('approaching-limit');
  });

  it('should have orange styling when 90-100%', () => {
    const { useWipStatus } = await import('../../../src/hooks/useWipStatus');
    vi.mocked(useWipStatus).mockReturnValue({
      limit: 10,
      currentCount: 10, // 100%
      canAddTask: false,
      loading: false,
      error: null,
      refreshLimit: vi.fn(),
    });

    renderWithProvider(<WIPCountIndicator onOpenSettings={mockOnOpenSettings} />);
    const indicator = screen.getByRole('status');
    expect(indicator.className).toContain('at-limit');
  });

  it('should show tooltip on hover', () => {
    renderWithProvider(<WIPCountIndicator onOpenSettings={mockOnOpenSettings} />);
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('title', 'Work In Progress limit helps you stay focused');
  });

  it('should open settings when clicked', () => {
    renderWithProvider(<WIPCountIndicator onOpenSettings={mockOnOpenSettings} />);
    const indicator = screen.getByRole('status');
    fireEvent.click(indicator);
    expect(mockOnOpenSettings).toHaveBeenCalled();
  });

  it('should open settings when Enter key is pressed', () => {
    renderWithProvider(<WIPCountIndicator onOpenSettings={mockOnOpenSettings} />);
    const indicator = screen.getByRole('status');
    fireEvent.keyDown(indicator, { key: 'Enter' });
    expect(mockOnOpenSettings).toHaveBeenCalled();
  });

  it('should open settings when Space key is pressed', () => {
    renderWithProvider(<WIPCountIndicator onOpenSettings={mockOnOpenSettings} />);
    const indicator = screen.getByRole('status');
    fireEvent.keyDown(indicator, { key: ' ' });
    expect(mockOnOpenSettings).toHaveBeenCalled();
  });

  it('should have proper accessibility label', () => {
    renderWithProvider(<WIPCountIndicator onOpenSettings={mockOnOpenSettings} />);
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-label', '5 of 7 active tasks, below limit');
  });

  it('should be keyboard focusable', () => {
    renderWithProvider(<WIPCountIndicator onOpenSettings={mockOnOpenSettings} />);
    const indicator = screen.getByRole('status');
    expect(indicator.tagName).toBe('BUTTON');
  });
});
