import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { FirstLaunchScreen } from '../../../src/components/FirstLaunchScreen';

describe('FirstLaunchScreen', () => {
  describe('Rendering', () => {
    it('should render welcome message', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      expect(screen.getByText('Welcome to Simple To-Do App!')).toBeInTheDocument();
    });

    it('should render feature icons and explanatory text', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      expect(screen.getByText(/Focus through limits/i)).toBeInTheDocument();
      expect(screen.getByText(/Celebrate progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Proactive prompts/i)).toBeInTheDocument();
    });

    it('should render explanation text', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      expect(
        screen.getByText(
          /This app helps you focus by limiting how many tasks you can have active at once/i
        )
      ).toBeInTheDocument();
    });

    it('should render WIP limit selector with 6 options (5-10)', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      for (let limit = 5; limit <= 10; limit++) {
        expect(screen.getByRole('radio', { name: `Select WIP limit ${limit}` })).toBeInTheDocument();
      }
    });

    it('should highlight default WIP limit of 7', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      const button7 = screen.getByRole('radio', { name: 'Select WIP limit 7' });
      expect(button7).toHaveAttribute('aria-checked', 'true');
    });

    it('should render helper text', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      expect(
        screen.getByText(/Most users find 7 tasks works well. You can change this later in Settings./i)
      ).toBeInTheDocument();
    });

    it('should render Get Started button', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
    });

    it('should render Use Default Settings button', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      expect(screen.getByRole('button', { name: /Use Default Settings/i })).toBeInTheDocument();
    });

    it('should render pilot feedback message', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      expect(
        screen.getByText(
          /This is a pilot version. We'd love your feedback - find the Feedback link in Settings!/i
        )
      ).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update selection when clicking a WIP limit button', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      // Click WIP limit 8
      const button8 = screen.getByRole('radio', { name: 'Select WIP limit 8' });
      fireEvent.click(button8);

      // Verify selection updated
      expect(button8).toHaveAttribute('aria-checked', 'true');
      const button7 = screen.getByRole('radio', { name: 'Select WIP limit 7' });
      expect(button7).toHaveAttribute('aria-checked', 'false');
    });

    it('should call onComplete with selected limit when Get Started clicked', async () => {
      const onComplete = vi.fn().mockResolvedValue(undefined);
      render(<FirstLaunchScreen onComplete={onComplete} />);

      // Select WIP limit 8
      const button8 = screen.getByRole('radio', { name: 'Select WIP limit 8' });
      fireEvent.click(button8);

      // Click Get Started
      const getStartedBtn = screen.getByRole('button', { name: /Get Started/i });
      fireEvent.click(getStartedBtn);

      await waitFor(
        () => {
          expect(onComplete).toHaveBeenCalledWith(8);
        },
        { timeout: 3000 }
      );
    });

    it('should call onComplete with default limit 7 when Use Default Settings clicked', async () => {
      const onComplete = vi.fn().mockResolvedValue(undefined);
      render(<FirstLaunchScreen onComplete={onComplete} />);

      // Select a different limit first
      const button5 = screen.getByRole('radio', { name: 'Select WIP limit 5' });
      fireEvent.click(button5);

      // Click Use Default Settings
      const useDefaultsBtn = screen.getByRole('button', { name: /Use Default Settings/i });
      fireEvent.click(useDefaultsBtn);

      await waitFor(
        () => {
          expect(onComplete).toHaveBeenCalledWith(7); // Always 7, not 5
        },
        { timeout: 3000 }
      );
    });

    it('should show loading state during API call', async () => {
      const onComplete = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<FirstLaunchScreen onComplete={onComplete} />);

      const getStartedBtn = screen.getByRole('button', { name: /Get Started/i });
      fireEvent.click(getStartedBtn);

      // Should show "Saving..." text
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /Saving.../i })).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Should disable buttons during loading
      const savingBtn = screen.getByRole('button', { name: /Saving.../i });
      expect(savingBtn).toBeDisabled();
    });

    it('should show error message on API failure', async () => {
      const onComplete = vi.fn().mockRejectedValue(new Error('Network error'));
      render(<FirstLaunchScreen onComplete={onComplete} />);

      const getStartedBtn = screen.getByRole('button', { name: /Get Started/i });
      fireEvent.click(getStartedBtn);

      await waitFor(
        () => {
          expect(screen.getByRole('alert')).toHaveTextContent(/Failed to save settings. Please try again./i);
        },
        { timeout: 3000 }
      );
    });

    it('should allow retry after error', async () => {
      const onComplete = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);
      render(<FirstLaunchScreen onComplete={onComplete} />);

      // First attempt - fails
      const getStartedBtn = screen.getByRole('button', { name: /Get Started/i });
      fireEvent.click(getStartedBtn);

      await waitFor(
        () => {
          expect(screen.getByRole('alert')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Second attempt - succeeds
      fireEvent.click(getStartedBtn);

      await waitFor(
        () => {
          expect(onComplete).toHaveBeenCalledTimes(2);
          expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      // Tab through WIP limit buttons
      const button5 = screen.getByRole('radio', { name: /Select WIP limit 5/i });
      button5.focus();
      expect(button5).toHaveFocus();

      // Tab to Get Started button
      const getStartedBtn = screen.getByRole('button', { name: /Get Started/i });
      getStartedBtn.focus();
      expect(getStartedBtn).toHaveFocus();
    });

    it('should support Enter key to select WIP limit', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      const button8 = screen.getByRole('radio', { name: 'Select WIP limit 8' });
      fireEvent.keyDown(button8, { key: 'Enter' });

      expect(button8).toHaveAttribute('aria-checked', 'true');
    });

    it('should support Space key to select WIP limit', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      const button6 = screen.getByRole('radio', { name: 'Select WIP limit 6' });
      fireEvent.keyDown(button6, { key: ' ' });

      expect(button6).toHaveAttribute('aria-checked', 'true');
    });

    it('should have ARIA labels on WIP limit buttons', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      for (let limit = 5; limit <= 10; limit++) {
        const button = screen.getByRole('radio', { name: `Select WIP limit ${limit}` });
        expect(button).toHaveAttribute('aria-label', `Select WIP limit ${limit}`);
      }
    });

    it('should have radiogroup role on limit selector', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      const radiogroup = screen.getByRole('radiogroup', { name: /Select WIP limit/i });
      expect(radiogroup).toBeInTheDocument();
    });

    it('should announce selected limit to screen readers', () => {
      const onComplete = vi.fn();
      render(<FirstLaunchScreen onComplete={onComplete} />);

      const button9 = screen.getByRole('radio', { name: 'Select WIP limit 9' });
      fireEvent.click(button9);

      expect(button9).toHaveAttribute('aria-checked', 'true');
    });
  });
});
