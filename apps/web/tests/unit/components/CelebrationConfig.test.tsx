import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

import { CelebrationConfig } from '../../../src/components/CelebrationConfig.js';

expect.extend(toHaveNoViolations);

describe('CelebrationConfig', () => {
  const defaultProps = {
    celebrationsEnabled: true,
    celebrationDurationSeconds: 7,
    onUpdate: vi.fn().mockResolvedValue(undefined),
    onPreview: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC: 1
  it('should render section heading "Celebration Preferences"', () => {
    render(<CelebrationConfig {...defaultProps} />);
    expect(
      screen.getByRole('heading', { level: 2, name: /celebration preferences/i })
    ).toBeInTheDocument();
  });

  // AC: 7
  it('should render benefit explanation text', () => {
    render(<CelebrationConfig {...defaultProps} />);
    expect(
      screen.getByText(/celebrations provide positive reinforcement to build momentum/i)
    ).toBeInTheDocument();
  });

  // AC: 2
  it('should render "Enable celebrations" toggle', () => {
    render(<CelebrationConfig {...defaultProps} />);
    const toggle = screen.getByRole('switch', { name: /enable celebrations/i });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toBeChecked();
  });

  // AC: 2
  it('should render toggle as unchecked when celebrationsEnabled is false', () => {
    render(<CelebrationConfig {...defaultProps} celebrationsEnabled={false} />);
    const toggle = screen.getByRole('switch', { name: /enable celebrations/i });
    expect(toggle).not.toBeChecked();
  });

  // AC: 2
  it('should call onUpdate when toggling celebrations off', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<CelebrationConfig {...defaultProps} onUpdate={onUpdate} />);

    const toggle = screen.getByRole('switch', { name: /enable celebrations/i });
    fireEvent.click(toggle);

    expect(onUpdate).toHaveBeenCalledWith(false, 7);
  });

  // AC: 2
  it('should call onUpdate when toggling celebrations on', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<CelebrationConfig {...defaultProps} celebrationsEnabled={false} onUpdate={onUpdate} />);

    const toggle = screen.getByRole('switch', { name: /enable celebrations/i });
    fireEvent.click(toggle);

    expect(onUpdate).toHaveBeenCalledWith(true, 7);
  });

  // AC: 3
  it('should render "Celebration duration" slider', () => {
    render(<CelebrationConfig {...defaultProps} />);
    const slider = screen.getByRole('slider', { name: /celebration duration/i });

    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('min', '3');
    expect(slider).toHaveAttribute('max', '10');
    expect(slider).toHaveValue('7');
  });

  // AC: 3
  it('should display current duration value next to slider', () => {
    render(<CelebrationConfig {...defaultProps} celebrationDurationSeconds={5} />);
    expect(screen.getByText(/5 seconds/i)).toBeInTheDocument();
  });

  // AC: 3
  it('should call onUpdate when slider value changes', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<CelebrationConfig {...defaultProps} onUpdate={onUpdate} />);

    const slider = screen.getByRole('slider', { name: /celebration duration/i });
    fireEvent.change(slider, { target: { value: '5' } });

    expect(onUpdate).toHaveBeenCalledWith(true, 5);
  });

  // AC: 3
  it('should disable slider when celebrations toggle is off', () => {
    render(<CelebrationConfig {...defaultProps} celebrationsEnabled={false} />);

    const slider = screen.getByRole('slider', { name: /celebration duration/i });
    expect(slider).toBeDisabled();
  });

  // AC: 4
  it('should render "Preview Celebration" button', () => {
    render(<CelebrationConfig {...defaultProps} />);
    expect(screen.getByRole('button', { name: /preview celebration/i })).toBeInTheDocument();
  });

  // AC: 4
  it('should call onPreview when preview button is clicked', () => {
    const onPreview = vi.fn();
    render(<CelebrationConfig {...defaultProps} onPreview={onPreview} />);

    const button = screen.getByRole('button', { name: /preview celebration/i });
    fireEvent.click(button);

    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  // AC: 4
  it('should disable preview button when celebrations toggle is off', () => {
    render(<CelebrationConfig {...defaultProps} celebrationsEnabled={false} />);

    const button = screen.getByRole('button', { name: /preview celebration/i });
    expect(button).toBeDisabled();
  });

  // AC: 9 - Semantic HTML
  it('should use semantic HTML structure', () => {
    render(<CelebrationConfig {...defaultProps} />);

    // Section element
    const section = screen.getByRole('heading', { level: 2 }).closest('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby', 'celebration-heading');

    // Heading
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    // Switch/checkbox
    expect(screen.getByRole('switch')).toBeInTheDocument();

    // Slider
    expect(screen.getByRole('slider')).toBeInTheDocument();

    // Button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // AC: 9 - Accessibility
  it('should have proper ARIA attributes on checkbox', () => {
    render(<CelebrationConfig {...defaultProps} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('role', 'switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  // AC: 9 - Accessibility
  it('should have proper ARIA attributes on slider', () => {
    render(<CelebrationConfig {...defaultProps} celebrationDurationSeconds={5} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-label', 'Celebration duration in seconds');
    expect(slider).toHaveAttribute('aria-valuemin', '3');
    expect(slider).toHaveAttribute('aria-valuemax', '10');
    expect(slider).toHaveAttribute('aria-valuenow', '5');
  });

  // AC: 9 - Accessibility
  it('should have aria-disabled on disabled controls', () => {
    render(<CelebrationConfig {...defaultProps} celebrationsEnabled={false} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-disabled', 'true');

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  // AC: 10 - Default values
  it('should accept default values (enabled: true, duration: 7)', () => {
    render(<CelebrationConfig {...defaultProps} celebrationsEnabled={true} celebrationDurationSeconds={7} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();

    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('7');
  });

  // AC: 9 - Accessibility (no violations)
  it('should have no accessibility violations', async () => {
    const { container } = render(<CelebrationConfig {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
