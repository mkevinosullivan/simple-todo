import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { WIPLimitMessage } from '../../../src/components/WIPLimitMessage';

describe('WIPLimitMessage', () => {
  const defaultProps = {
    canAddTask: false,
    currentCount: 7,
    limit: 7,
    onOpenSettings: vi.fn(),
  };

  it('should render when canAddTask is false', () => {
    render(<WIPLimitMessage {...defaultProps} />);
    expect(screen.getByText(/you have 7 active tasks/i)).toBeInTheDocument();
  });

  it('should not render when canAddTask is true', () => {
    const { container } = render(<WIPLimitMessage {...defaultProps} canAddTask={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display correct active task count', () => {
    render(<WIPLimitMessage {...defaultProps} currentCount={5} limit={7} />);
    expect(screen.getByText(/you have 5 active tasks/i)).toBeInTheDocument();
  });

  it('should open settings when settings link is clicked', () => {
    const onOpenSettings = vi.fn();
    render(<WIPLimitMessage {...defaultProps} onOpenSettings={onOpenSettings} />);

    const settingsLink = screen.getByText(/adjust your limit in settings/i);
    fireEvent.click(settingsLink);

    expect(onOpenSettings).toHaveBeenCalled();
  });

  it('should show first-time education when hasSeenEducation is false', () => {
    render(<WIPLimitMessage {...defaultProps} hasSeenEducation={false} />);
    expect(screen.getByText(/focus feature/i)).toBeInTheDocument();
    expect(screen.getByText(/this helps you focus/i)).toBeInTheDocument();
    expect(screen.getByText(/got it!/i)).toBeInTheDocument();
  });

  it('should hide education content after "Got it!" is clicked', () => {
    const onEducationDismissed = vi.fn();
    render(
      <WIPLimitMessage
        {...defaultProps}
        hasSeenEducation={false}
        onEducationDismissed={onEducationDismissed}
      />
    );

    const gotItButton = screen.getByText(/got it!/i);
    fireEvent.click(gotItButton);

    expect(onEducationDismissed).toHaveBeenCalled();
    expect(screen.queryByText(/focus feature/i)).not.toBeInTheDocument();
  });

  it('should show standard message when hasSeenEducation is true', () => {
    render(<WIPLimitMessage {...defaultProps} hasSeenEducation={true} />);
    expect(screen.queryByText(/focus feature/i)).not.toBeInTheDocument();
    expect(screen.getByText(/complete or delete a task/i)).toBeInTheDocument();
  });

  it('should have pulse animation class when shouldPulse is true', () => {
    const { container } = render(<WIPLimitMessage {...defaultProps} shouldPulse={true} />);
    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer.className).toContain('pulse');
  });

  it('should have proper accessibility attributes', () => {
    render(<WIPLimitMessage {...defaultProps} />);
    const message = screen.getByRole('status');
    expect(message).toHaveAttribute('aria-live', 'polite');
    expect(message).toHaveAttribute(
      'aria-label',
      'Cannot add task. You have 7 active tasks. Complete a task before adding more.'
    );
  });

  it('should include psychological rationale in standard message', () => {
    render(<WIPLimitMessage {...defaultProps} hasSeenEducation={true} />);
    expect(screen.getByText(/research shows limiting wip improves completion rates/i)).toBeInTheDocument();
  });
});
