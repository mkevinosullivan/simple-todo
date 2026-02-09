import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

import { PromptingConfig } from '../../../src/components/PromptingConfig.js';
import * as promptsService from '../../../src/services/prompts.js';

expect.extend(toHaveNoViolations);

// Mock the prompts service
vi.mock('../../../src/services/prompts.js', () => ({
  prompts: {
    test: vi.fn(),
  },
}));

describe('PromptingConfig', () => {
  const defaultProps = {
    enabled: true,
    frequencyHours: 2.5,
    nextPromptTime: null,
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render section heading "Proactive Prompts"', () => {
      render(<PromptingConfig {...defaultProps} />);
      expect(
        screen.getByRole('heading', { level: 2, name: /proactive prompts/i })
      ).toBeInTheDocument();
    });

    it('should render "Enable proactive prompts" toggle', () => {
      render(<PromptingConfig {...defaultProps} />);
      const toggle = screen.getByRole('switch', { name: /enable proactive prompts/i });
      expect(toggle).toBeInTheDocument();
      expect(toggle).toBeChecked();
    });

    it('should render toggle as unchecked when enabled is false', () => {
      render(<PromptingConfig {...defaultProps} enabled={false} />);
      const toggle = screen.getByRole('switch', { name: /enable proactive prompts/i });
      expect(toggle).not.toBeChecked();
    });

    it('should render "Prompt frequency" slider', () => {
      render(<PromptingConfig {...defaultProps} />);
      const slider = screen.getByRole('slider', { name: /prompt frequency in hours/i });

      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('min', '1');
      expect(slider).toHaveAttribute('max', '6');
      expect(slider).toHaveAttribute('step', '0.5');
      expect(slider).toHaveValue('2.5');
    });

    it('should render "See a sample prompt" button', () => {
      render(<PromptingConfig {...defaultProps} />);
      expect(screen.getByRole('button', { name: /test proactive prompt/i })).toBeInTheDocument();
      expect(screen.getByText('See a sample prompt')).toBeInTheDocument();
    });
  });

  describe('Toggle Interaction', () => {
    it('should call onUpdate when toggling prompts off', () => {
      const onUpdate = vi.fn();
      render(<PromptingConfig {...defaultProps} onUpdate={onUpdate} />);

      const toggle = screen.getByRole('switch', { name: /enable proactive prompts/i });
      fireEvent.click(toggle);

      expect(onUpdate).toHaveBeenCalledWith(false, 2.5);
    });

    it('should call onUpdate when toggling prompts on', () => {
      const onUpdate = vi.fn();
      render(<PromptingConfig {...defaultProps} enabled={false} onUpdate={onUpdate} />);

      const toggle = screen.getByRole('switch', { name: /enable proactive prompts/i });
      fireEvent.click(toggle);

      expect(onUpdate).toHaveBeenCalledWith(true, 2.5);
    });
  });

  describe('Frequency Slider', () => {
    it('should display current frequency value', () => {
      render(<PromptingConfig {...defaultProps} frequencyHours={3} />);
      expect(screen.getByText(/every 3 hours/i)).toBeInTheDocument();
    });

    it('should display "1 hour" for singular value', () => {
      render(<PromptingConfig {...defaultProps} frequencyHours={1} />);
      expect(screen.getByText(/every 1 hour$/i)).toBeInTheDocument();
    });

    it('should display explanation text with current frequency', () => {
      render(<PromptingConfig {...defaultProps} frequencyHours={2.5} />);
      expect(
        screen.getByText(/the app will suggest a task.*every 2.5 hours/i)
      ).toBeInTheDocument();
    });

    it('should call onUpdate when slider value changes', () => {
      const onUpdate = vi.fn();
      render(<PromptingConfig {...defaultProps} onUpdate={onUpdate} />);

      const slider = screen.getByRole('slider', { name: /prompt frequency in hours/i });
      fireEvent.change(slider, { target: { value: '4' } });

      expect(onUpdate).toHaveBeenCalledWith(true, 4);
    });

    it('should allow half-hour increments (step: 0.5)', () => {
      const onUpdate = vi.fn();
      render(<PromptingConfig {...defaultProps} onUpdate={onUpdate} />);

      const slider = screen.getByRole('slider', { name: /prompt frequency in hours/i });
      fireEvent.change(slider, { target: { value: '3.5' } });

      expect(onUpdate).toHaveBeenCalledWith(true, 3.5);
    });

    it('should disable slider when toggle is off', () => {
      render(<PromptingConfig {...defaultProps} enabled={false} />);

      const slider = screen.getByRole('slider', { name: /prompt frequency in hours/i });
      expect(slider).toBeDisabled();
    });

    it('should update explanation text when frequency changes', () => {
      const { rerender } = render(<PromptingConfig {...defaultProps} frequencyHours={2} />);
      expect(screen.getByText(/every 2 hours/i)).toBeInTheDocument();

      rerender(<PromptingConfig {...defaultProps} frequencyHours={5} />);
      expect(screen.getByText(/every 5 hours/i)).toBeInTheDocument();
    });
  });

  describe('Next Prompt Time Display', () => {
    it('should not display next prompt time when disabled', () => {
      const futureTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      render(<PromptingConfig {...defaultProps} enabled={false} nextPromptTime={futureTime} />);

      expect(screen.queryByText(/next prompt in/i)).not.toBeInTheDocument();
    });

    it('should not display next prompt time when nextPromptTime is null', () => {
      render(<PromptingConfig {...defaultProps} enabled={true} nextPromptTime={null} />);

      expect(screen.queryByText(/next prompt in/i)).not.toBeInTheDocument();
    });

    it('should display next prompt time when enabled and time exists', () => {
      const futureTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      render(<PromptingConfig {...defaultProps} enabled={true} nextPromptTime={futureTime} />);

      expect(screen.getByText(/next prompt in approximately 2 hours/i)).toBeInTheDocument();
    });

    it('should display minutes for times less than 1 hour', () => {
      const futureTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      render(<PromptingConfig {...defaultProps} enabled={true} nextPromptTime={futureTime} />);

      expect(screen.getByText(/next prompt in approximately 30 minutes/i)).toBeInTheDocument();
    });

    it('should display "1 hour" for singular hour value', () => {
      const futureTime = new Date(Date.now() + 90 * 60 * 1000); // 1.5 hours from now
      render(<PromptingConfig {...defaultProps} enabled={true} nextPromptTime={futureTime} />);

      expect(screen.getByText(/next prompt in approximately 1 hour$/i)).toBeInTheDocument();
    });

    it('should display "1 minute" for singular minute value', () => {
      const futureTime = new Date(Date.now() + 61 * 1000); // 61 seconds from now
      render(<PromptingConfig {...defaultProps} enabled={true} nextPromptTime={futureTime} />);

      expect(screen.getByText(/next prompt in approximately 1 minute$/i)).toBeInTheDocument();
    });

    it('should display "Prompt coming soon" for past times', () => {
      const pastTime = new Date(Date.now() - 60 * 1000); // 1 minute ago
      render(<PromptingConfig {...defaultProps} enabled={true} nextPromptTime={pastTime} />);

      expect(screen.getByText(/prompt coming soon/i)).toBeInTheDocument();
    });
  });

  describe('Test Prompt Button', () => {
    it('should trigger test prompt when clicked', async () => {
      const testPrompt = vi.fn().mockResolvedValue({
        taskId: '123',
        taskText: 'Test task',
        promptedAt: new Date().toISOString(),
      });
      vi.mocked(promptsService.prompts.test).mockImplementation(testPrompt);

      render(<PromptingConfig {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test proactive prompt/i });
      fireEvent.click(button);

      expect(testPrompt).toHaveBeenCalledTimes(1);
    });

    it('should show "Triggering prompt..." while request is in flight', async () => {
      const testPrompt = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      );
      vi.mocked(promptsService.prompts.test).mockImplementation(testPrompt);

      render(<PromptingConfig {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test proactive prompt/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Triggering prompt...')).toBeInTheDocument();
      });
    });

    it('should show "Prompt sent!" on successful test', async () => {
      const testPrompt = vi.fn().mockResolvedValue({
        taskId: '123',
        taskText: 'Test task',
        promptedAt: new Date().toISOString(),
      });
      vi.mocked(promptsService.prompts.test).mockImplementation(testPrompt);

      render(<PromptingConfig {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test proactive prompt/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Prompt sent!')).toBeInTheDocument();
      });
    });

    it('should show "Add a task first to test prompts" when no tasks available', async () => {
      const testPrompt = vi.fn().mockResolvedValue(null);
      vi.mocked(promptsService.prompts.test).mockImplementation(testPrompt);

      render(<PromptingConfig {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test proactive prompt/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Add a task first to test prompts')).toBeInTheDocument();
      });
    });

    it('should show "Failed to trigger prompt" on error', async () => {
      const testPrompt = vi.fn().mockRejectedValue(new Error('API error'));
      vi.mocked(promptsService.prompts.test).mockImplementation(testPrompt);

      render(<PromptingConfig {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test proactive prompt/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Failed to trigger prompt')).toBeInTheDocument();
      });
    });

    it('should disable button while request is in flight', async () => {
      const testPrompt = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      );
      vi.mocked(promptsService.prompts.test).mockImplementation(testPrompt);

      render(<PromptingConfig {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test proactive prompt/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should re-enable button after successful test', async () => {
      vi.useFakeTimers();
      const testPrompt = vi.fn().mockResolvedValue({
        taskId: '123',
        taskText: 'Test task',
        promptedAt: new Date().toISOString(),
      });
      vi.mocked(promptsService.prompts.test).mockImplementation(testPrompt);

      render(<PromptingConfig {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test proactive prompt/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Prompt sent!')).toBeInTheDocument();
      });

      // Fast-forward 2 seconds
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(screen.getByText('See a sample prompt')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('should re-enable button after error (3 seconds)', async () => {
      vi.useFakeTimers();
      const testPrompt = vi.fn().mockRejectedValue(new Error('API error'));
      vi.mocked(promptsService.prompts.test).mockImplementation(testPrompt);

      render(<PromptingConfig {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test proactive prompt/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Failed to trigger prompt')).toBeInTheDocument();
      });

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(screen.getByText('See a sample prompt')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Semantic HTML & Accessibility', () => {
    it('should use semantic HTML structure', () => {
      render(<PromptingConfig {...defaultProps} />);

      // Section element
      const section = screen.getByRole('heading', { level: 2 }).closest('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-labelledby', 'prompting-heading');

      // Heading
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

      // Switch/checkbox
      expect(screen.getByRole('switch')).toBeInTheDocument();

      // Slider
      expect(screen.getByRole('slider')).toBeInTheDocument();

      // Button
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes on toggle', () => {
      render(<PromptingConfig {...defaultProps} />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('role', 'switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('should have proper ARIA attributes on slider', () => {
      render(<PromptingConfig {...defaultProps} frequencyHours={3} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Prompt frequency in hours');
      expect(slider).toHaveAttribute('aria-valuemin', '1');
      expect(slider).toHaveAttribute('aria-valuemax', '6');
      expect(slider).toHaveAttribute('aria-valuenow', '3');
    });

    it('should have aria-disabled on disabled controls', () => {
      render(<PromptingConfig {...defaultProps} enabled={false} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have aria-disabled on test button when disabled', async () => {
      const testPrompt = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      );
      vi.mocked(promptsService.prompts.test).mockImplementation(testPrompt);

      render(<PromptingConfig {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test proactive prompt/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<PromptingConfig {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
