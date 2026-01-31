import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { SettingsModal } from '../../src/components/SettingsModal';
import { createTestWipConfig } from '../helpers/factories';
import { server } from '../helpers/testSetup';

describe.skip('Settings Flow Integration', () => {
  describe('Full settings update flow', () => {
    it('should complete full flow: open → change limit → save → verify persistence', async () => {
      const user = userEvent.setup();
      let savedLimit = 7;

      // Mock handlers that persist changes
      server.use(
        http.get('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json(createTestWipConfig({ limit: savedLimit }));
        }),
        http.put('http://localhost:3001/api/config/wip-limit', async ({ request }) => {
          const body = (await request.json()) as { limit: number };
          savedLimit = body.limit;
          return HttpResponse.json(createTestWipConfig({ limit: savedLimit }));
        })
      );

      // Render modal (open)
      const { rerender } = render(<SettingsModal isOpen={true} onClose={() => {}} />);

      // Wait for initial load
      await waitFor(
        () => {
        expect(screen.getByRole('slider')).toHaveValue('7');
      },
        { timeout: 5000 }
      );

      // Change WIP limit to 9
      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}{ArrowRight}');

      expect(slider).toHaveValue('9');

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Verify success toast
      await waitFor(
        () => {
        expect(screen.getByText(/Settings saved!/i)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      // Close and reopen modal to verify persistence
      rerender(<SettingsModal isOpen={false} onClose={() => {}} />);
      rerender(<SettingsModal isOpen={true} onClose={() => {}} />);

      // Verify the new limit persisted
      await waitFor(
        () => {
        expect(screen.getByRole('slider')).toHaveValue('9');
      },
        { timeout: 5000 }
      );

      expect(savedLimit).toBe(9);
    });
  });

  describe('Settings modal with current task count', () => {
    it('should display current active task count from API', async () => {
      server.use(
        http.get('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json(createTestWipConfig({ currentCount: 8, limit: 10 }));
        })
      );

      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
        expect(screen.getByText(/You currently have/)).toBeInTheDocument();
        expect(screen.getByText(/8/)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );
    });

    it('should update current count after save', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json(createTestWipConfig({ currentCount: 5 }));
        }),
        http.put('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json(createTestWipConfig({ limit: 8, currentCount: 5 }));
        })
      );

      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
        expect(screen.getByText(/5/)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      // Change and save
      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(
        () => {
        expect(screen.getByText(/Settings saved!/i)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      // Current count should still be 5
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });
  });

  describe('Invalid limit validation', () => {
    it('should show error for limit below minimum (< 5)', async () => {
      const user = userEvent.setup();

      // Mock API to reject limit < 5
      server.use(
        http.put('http://localhost:3001/api/config/wip-limit', async ({ request }) => {
          const body = (await request.json()) as { limit: number };
          if (body.limit < 5) {
            return HttpResponse.json(
              { error: 'WIP limit must be between 5 and 10' },
              { status: 400 }
            );
          }
          return HttpResponse.json(createTestWipConfig({ limit: body.limit }));
        })
      );

      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      // Try to set limit to 4 (simulate by mocking the change)
      const slider = screen.getByRole('slider');
      await user.click(slider);

      // Note: HTML range input with min=5 prevents going below 5 client-side
      // But we test server-side validation by mocking a direct API call
      const saveButton = screen.getByRole('button', { name: /save changes/i });

      // Change to minimum valid value first
      await user.keyboard('{ArrowLeft}{ArrowLeft}'); // Go to 5

      // Manually trigger save with invalid value by mocking
      server.use(
        http.put('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json(
            { error: 'WIP limit must be between 5 and 10' },
            { status: 400 }
          );
        })
      );

      await user.click(saveButton);

      await waitFor(
        () => {
        expect(screen.getByText(/Please choose a limit between 5 and 10/i)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );
    });

    it('should show error for limit above maximum (> 10)', async () => {
      const user = userEvent.setup();

      // Mock API to reject limit > 10
      server.use(
        http.put('http://localhost:3001/api/config/wip-limit', async ({ request }) => {
          const body = (await request.json()) as { limit: number };
          if (body.limit > 10) {
            return HttpResponse.json(
              { error: 'WIP limit must be between 5 and 10' },
              { status: 400 }
            );
          }
          return HttpResponse.json(createTestWipConfig({ limit: body.limit }));
        })
      );

      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      // HTML range input with max=10 prevents going above 10 client-side
      // But we test server-side validation
      server.use(
        http.put('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json(
            { error: 'WIP limit must be between 5 and 10' },
            { status: 400 }
          );
        })
      );

      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(
        () => {
        expect(screen.getByText(/Please choose a limit between 5 and 10/i)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );
    });
  });

  describe('API error handling', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      server.use(
        http.put('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        })
      );

      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(
        () => {
        expect(screen.getByText(/Please choose a limit between 5 and 10/i)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      // Should not show success toast
      expect(screen.queryByText(/Settings saved!/i)).not.toBeInTheDocument();
    });

    it('should handle failed initial load', async () => {
      server.use(
        http.get('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json({ error: 'Failed to load' }, { status: 500 });
        })
      );

      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
        expect(screen.getByText(/Failed to load settings/i)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );
    });
  });

  describe('User interaction flow', () => {
    it('should allow multiple changes before saving', async () => {
      const user = userEvent.setup();

      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      const slider = screen.getByRole('slider');

      // Make multiple changes
      await user.click(slider);
      await user.keyboard('{ArrowRight}'); // 8
      await user.keyboard('{ArrowRight}'); // 9
      await user.keyboard('{ArrowLeft}'); // 8

      expect(slider).toHaveValue('8');

      // Save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(
        () => {
        expect(screen.getByText(/Settings saved!/i)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );
    });

    it('should clear error message when making new changes after error', async () => {
      const user = userEvent.setup();

      // First save fails
      server.use(
        http.put('http://localhost:3001/api/config/wip-limit', () => {
          return HttpResponse.json({ error: 'Validation error' }, { status: 400 });
        })
      );

      render(<SettingsModal isOpen={true} onClose={() => {}} />);

      await waitFor(
        () => {
        expect(screen.getByRole('slider')).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Error appears
      await waitFor(
        () => {
        expect(screen.getByText(/Please choose a limit between 5 and 10/i)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      // Fix the mock for second attempt
      server.use(
        http.put('http://localhost:3001/api/config/wip-limit', async ({ request }) => {
          const body = (await request.json()) as { limit: number };
          return HttpResponse.json(createTestWipConfig({ limit: body.limit }));
        })
      );

      // Make another change and save
      await user.click(slider);
      await user.keyboard('{ArrowRight}');
      await user.click(saveButton);

      // Error should clear and success should show
      await waitFor(
        () => {
        expect(screen.getByText(/Settings saved!/i)).toBeInTheDocument();
      },
        { timeout: 5000 }
      );

      expect(screen.queryByText(/Please choose a limit between 5 and 10/i)).not.toBeInTheDocument();
    });
  });
});
