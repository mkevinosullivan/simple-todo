import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'vitest-axe';

import { QuickStartGuide } from '../../../src/components/QuickStartGuide';

expect.extend(toHaveNoViolations);

describe('QuickStartGuide', () => {
  const defaultProps = {
    wipLimit: 7,
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render welcome heading and app overview', () => {
    render(<QuickStartGuide {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1, name: /welcome/i })).toBeInTheDocument();
    expect(screen.getByText(/stay focused with smart task management/i)).toBeInTheDocument();
  });

  it('should render 3 core features with descriptions', () => {
    render(<QuickStartGuide {...defaultProps} />);

    // WIP Limits
    expect(screen.getByText(/WIP Limits/i)).toBeInTheDocument();
    expect(screen.getByText(/Limit active tasks to maintain focus/i)).toBeInTheDocument();

    // Celebrations
    expect(screen.getByText(/Celebrations/i)).toBeInTheDocument();
    expect(screen.getByText(/positive reinforcement when you complete tasks/i)).toBeInTheDocument();

    // Proactive Prompts
    expect(screen.getByText(/Proactive Prompts/i)).toBeInTheDocument();
    expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
  });

  it('should render 3 getting started steps with WIP limit value', () => {
    render(<QuickStartGuide {...defaultProps} />);

    expect(screen.getByText(/Add your first task above/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete it to see a celebration/i)).toBeInTheDocument();
    expect(screen.getByText(/Your WIP limit is set to 7 tasks/i)).toBeInTheDocument();
  });

  it('should render dynamic WIP limit value in steps', () => {
    render(<QuickStartGuide {...defaultProps} wipLimit={5} />);

    expect(screen.getByText(/Your WIP limit is set to 5 tasks/i)).toBeInTheDocument();
  });

  it('should render "Got it!" button', () => {
    render(<QuickStartGuide {...defaultProps} />);

    const button = screen.getByRole('button', { name: /got it/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onDismiss when button is clicked', () => {
    const onDismiss = vi.fn();
    render(<QuickStartGuide {...defaultProps} onDismiss={onDismiss} />);

    const button = screen.getByRole('button', { name: /got it/i });
    fireEvent.click(button);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should use semantic HTML with proper heading hierarchy', () => {
    render(<QuickStartGuide {...defaultProps} />);

    // Check for h1, h2 headings
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0);

    // Check for lists
    expect(screen.getAllByRole('list').length).toBeGreaterThan(0);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<QuickStartGuide {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should use encouraging and supportive tone', () => {
    render(<QuickStartGuide {...defaultProps} />);

    // Verify positive language
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    expect(screen.getByText(/Getting Started/i)).toBeInTheDocument();
  });

  it('should render feature icons', () => {
    const { container } = render(<QuickStartGuide {...defaultProps} />);

    // Check that emoji icons are present (they use aria-hidden="true")
    const icons = container.querySelectorAll('[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThanOrEqual(3); // At least 3 feature icons
  });

  it('should have proper button accessibility attributes', () => {
    render(<QuickStartGuide {...defaultProps} />);

    const button = screen.getByRole('button', { name: /dismiss quick start guide/i });
    expect(button).toHaveAttribute('aria-label');
  });
});
