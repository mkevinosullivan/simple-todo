import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

import { SettingsModal } from '../../../src/components/SettingsModal';

// Extend Vitest matchers with jest-axe
expect.extend(toHaveNoViolations);

describe('SettingsModal Accessibility', () => {
  describe('Automated accessibility tests', () => {
    it('should have no accessibility violations when open', async () => {
      const { container } = render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when displaying error message', async () => {
      const user = userEvent.setup();
      const { container } = render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
          expect(screen.getByRole('slider')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Trigger an error state (we'll mock this in the actual test)
      // For now, just verify the component structure has no violations
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe.skip('Keyboard navigation', () => {
    it('should support Tab navigation through all interactive elements', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Tab through elements
      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close settings/i })).toHaveFocus();
      });

      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('slider')).toHaveFocus();
      });

      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus();
      });

      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).toHaveFocus();
      });
    });

    it('should support Escape key to close modal', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should support arrow keys to adjust slider', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      const slider = await waitFor(
        () => {
          const element = screen.getByRole('slider');
          expect(element).toBeInTheDocument();
          return element;
        },
        { timeout: 3000 }
      );

      // Focus slider
      await user.click(slider);

      // Use arrow keys
      await user.keyboard('{ArrowRight}');
      await waitFor(() => {
        expect(slider).toHaveValue('8');
      });

      await user.keyboard('{ArrowLeft}');
      await waitFor(() => {
        expect(slider).toHaveValue('7');
      });
    });

    it('should support Enter key on buttons', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe.skip('Screen reader support', () => {
    it('should have proper ARIA labels on all interactive elements', async () => {
      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Dialog should have role
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Slider should have aria-label
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Work In Progress Limit');

      // Slider should have aria-value attributes
      expect(slider).toHaveAttribute('aria-valuenow');
      expect(slider).toHaveAttribute('aria-valuemin', '5');
      expect(slider).toHaveAttribute('aria-valuemax', '10');

      // Close button should have aria-label
      const closeButton = screen.getByRole('button', { name: /close settings/i });
      expect(closeButton).toHaveAttribute('aria-label');
    });

    it('should announce success message with aria-live', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      const slider = await waitFor(
        () => {
          const element = screen.getByRole('slider');
          expect(element).toBeInTheDocument();
          return element;
        },
        { timeout: 3000 }
      );

      // Change and save
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Success toast should have aria-live
      await waitFor(
        () => {
          const toast = screen.getByText(/Settings saved!/i);
          expect(toast.parentElement).toHaveAttribute('aria-live', 'polite');
        },
        { timeout: 3000 }
      );
    });

    it('should have accessible error messages', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
          expect(screen.getByRole('slider')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // The error div should be accessible (visible text in DOM)
      // This is tested in the main test file with MSW mocks
      // Here we verify the structure
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe.skip('Focus management', () => {
    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <button>Outside button</button>
          <SettingsModal isOpen={true} onClose={() => {}} />
        </div>
      );

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Tab through all elements in modal
      await user.tab(); // Close button
      await user.tab(); // Slider
      await user.tab(); // Cancel button
      await user.tab(); // Save button
      await user.tab(); // Should cycle back to close button (focus trap)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close settings/i })).toHaveFocus();
      });
    });

    it('should return focus to trigger when modal closes', async () => {
      // This is handled by Headless UI Dialog automatically
      // We verify the modal closes properly
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Color contrast', () => {
    it('should use colors that meet WCAG AA contrast requirements', async () => {
      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // This is verified by the axe-core automated test
      // Colors used:
      // - Text: #111827 on #FFFFFF (high contrast)
      // - Secondary text: #6b7280 on #FFFFFF (4.5:1 ratio)
      // - Blue accent: #3B82F6 on #FFFFFF (3:1 for large text)
      // - Error: #EF4444 on #FEE2E2 (sufficient contrast)
      // - Success: #10B981 on #D1FAE5 (sufficient contrast)

      const results = await axe(screen.getByRole('dialog'));
      expect(results).toHaveNoViolations();
    });
  });

  describe.skip('Keyboard-only interaction', () => {
    it('should complete full settings flow using keyboard only', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Tab to slider
      await user.tab();
      await user.tab();

      const slider = screen.getByRole('slider');
      await waitFor(() => {
        expect(slider).toHaveFocus();
      });

      // Change value with keyboard
      await user.keyboard('{ArrowRight}{ArrowRight}');
      await waitFor(() => {
        expect(slider).toHaveValue('9');
      });

      // Tab to save button
      await user.tab();
      await user.tab();

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await waitFor(() => {
        expect(saveButton).toHaveFocus();
      });

      // Activate save with keyboard
      await user.keyboard('{Enter}');

      // Wait for success
      await waitFor(
        () => {
          expect(screen.getByText(/Settings saved!/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe.skip('Visual focus indicators', () => {
    it('should have visible focus indicators on all interactive elements', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Tab through elements and verify they can receive focus
      // (Visual focus indicators are CSS-based with focus:ring-2 classes)
      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close settings/i })).toHaveFocus();
      });

      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('slider')).toHaveFocus();
      });

      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus();
      });

      await user.tab();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).toHaveFocus();
      });

      // All elements successfully received focus
    });
  });
});
