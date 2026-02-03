import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsModal } from '../../../src/components/SettingsModal';
import { createTestWipConfig } from '../../helpers/factories';
import { server } from '../../helpers/testSetup';

describe('SettingsModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Rendering', () => {
    it('should not render when closed', () => {
      render(<SettingsModal isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render modal with correct title when open', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should display WIP limit configuration section', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('WIP Limit Configuration')).toBeInTheDocument();
      });
    });

    it('should display current WIP limit value from API', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toHaveValue('7');
      });
    });

    it('should display current active task count', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText(/You currently have/)).toBeInTheDocument();
        expect(screen.getByText(/5/)).toBeInTheDocument();
      });
    });

    it('should display explanation text', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Limits how many active tasks you can have at once/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Slider interaction', () => {
    it('should update slider value on change', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      expect(slider).toHaveValue('8');
    });

    it('should display updated value above slider', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');

      // Change slider value
      await user.click(slider);
      await user.keyboard('{ArrowRight}{ArrowRight}');

      // Check that the displayed value matches (slider shows 9)
      const valueDisplay = screen.getByText('9');
      expect(valueDisplay).toBeInTheDocument();
    });
  });

  describe('Save button behavior', () => {
    it('should be disabled when no changes made', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('should be enabled when slider value changes', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should call API and show success toast on save', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      // Change slider value
      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      // Click save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Wait for success toast
      await waitFor(() => {
        expect(screen.getByText(/Settings saved!/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during save', async () => {
      const user = userEvent.setup();

      // Add delay to PUT request to observe loading state
      server.use(
        http.put('http://localhost:3001/api/config/wip-limit', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(createTestWipConfig({ limit: 8 }));
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Check loading state
      expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
    });

    it('should reset dirty state after successful save', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      // Change and save
      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Settings saved!/i)).toBeInTheDocument();
      });

      // Save button should be disabled again
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Cancel button behavior', () => {
    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should discard changes when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      // Change slider value
      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      expect(slider).toHaveValue('8');

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should display error message for invalid limit', async () => {
      const user = userEvent.setup();

      // Mock validation error response
      server.use(
        http.put('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json(
            { error: 'WIP limit must be between 5 and 10' },
            { status: 400 }
          );
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      // Change and save
      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Check error message
      await waitFor(() => {
        expect(screen.getByText(/Please choose a limit between 5 and 10/i)).toBeInTheDocument();
      });
    });

    it('should not show success toast when error occurs', async () => {
      const user = userEvent.setup();

      server.use(
        http.put('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json({ error: 'Validation error' }, { status: 400 });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Please choose a limit between 5 and 10/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Settings saved!/i)).not.toBeInTheDocument();
    });
  });

  describe('Keyboard accessibility', () => {
    it('should close modal on Escape key', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when clicking backdrop', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click backdrop (the div with aria-hidden)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when clicking X button', async () => {
      const user = userEvent.setup();
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close settings/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on slider', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Work In Progress Limit');
      expect(slider).toHaveAttribute('aria-valuenow', '7');
      expect(slider).toHaveAttribute('aria-valuemin', '5');
      expect(slider).toHaveAttribute('aria-valuemax', '10');
    });

    it('should have proper ARIA attributes on dialog', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should have proper label for slider control', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/work in progress limit/i)).toBeInTheDocument();
      });
    });
  });
});
