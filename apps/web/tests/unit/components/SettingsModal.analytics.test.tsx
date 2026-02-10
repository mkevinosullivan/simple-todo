import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsModal } from '../../../src/components/SettingsModal';
import { server } from '../../helpers/testSetup';

describe('SettingsModal - Prompt Analytics Section', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Analytics Display', () => {
    it('should display Prompt Analytics section header', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Prompt Analytics')).toBeInTheDocument();
      });
    });

    it('should display analytics section description', async () => {
      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(
          screen.getByText('Track your engagement with proactive task prompts.')
        ).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching analytics', async () => {
      // Add delay to simulate slow API
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            promptResponseRate: 45.2,
            responseBreakdown: { complete: 12, dismiss: 5, snooze: 3, timeout: 10 },
            averageResponseTime: 5420,
          });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      // Loading text should appear initially
      expect(screen.getByText('Loading analytics...')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument();
      });
    });

    it('should display response rate with percentage', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json({
            promptResponseRate: 45.2,
            responseBreakdown: { complete: 12, dismiss: 5, snooze: 3, timeout: 10 },
            averageResponseTime: 5420,
          });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Response Rate')).toBeInTheDocument();
      });

      // Check for response rate value (45.2%)
      expect(screen.getByText('45.2%')).toBeInTheDocument();
    });

    it('should display "Exceeds 40% target" indicator when rate >= 40%', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json({
            promptResponseRate: 55.0,
            responseBreakdown: { complete: 12, dismiss: 5, snooze: 3, timeout: 10 },
            averageResponseTime: 5420,
          });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('✓ Exceeds 40% target')).toBeInTheDocument();
      });
    });

    it('should display "Target: ≥40%" indicator when rate < 40%', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json({
            promptResponseRate: 35.0,
            responseBreakdown: { complete: 7, dismiss: 3, snooze: 1, timeout: 15 },
            averageResponseTime: 4200,
          });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Target: ≥40%')).toBeInTheDocument();
      });
    });

    it('should display response breakdown counts', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json({
            promptResponseRate: 45.2,
            responseBreakdown: { complete: 12, dismiss: 5, snooze: 3, timeout: 10 },
            averageResponseTime: 5420,
          });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument();
      });

      expect(screen.getByText('Dismissed')).toBeInTheDocument();
      expect(screen.getByText('Snoozed')).toBeInTheDocument();
      expect(screen.getByText('Timed Out')).toBeInTheDocument();

      // Check counts
      expect(screen.getByText('12')).toBeInTheDocument(); // complete
      expect(screen.getByText('5')).toBeInTheDocument(); // dismiss
      expect(screen.getByText('3')).toBeInTheDocument(); // snooze
      expect(screen.getByText('10')).toBeInTheDocument(); // timeout
    });

    it('should display average response time in seconds', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json({
            promptResponseRate: 45.2,
            responseBreakdown: { complete: 12, dismiss: 5, snooze: 3, timeout: 10 },
            averageResponseTime: 5420, // 5.42 seconds
          });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
      });

      // Average time: 5420ms = 5.4s
      expect(screen.getByText('5.4s')).toBeInTheDocument();
    });

    it('should display "N/A" when average response time is 0', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json({
            promptResponseRate: 0,
            responseBreakdown: { complete: 0, dismiss: 0, snooze: 0, timeout: 5 },
            averageResponseTime: 0,
          });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
      });

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should display "No prompt data available yet" message when analytics is null', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json(null);
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('No prompt data available yet.')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error gracefully', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json(
            { error: 'Failed to retrieve prompt analytics' },
            { status: 500 }
          );
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        // Should show "No prompt data available yet" on error
        expect(screen.getByText('No prompt data available yet.')).toBeInTheDocument();
      });
    });

    it('should handle network error gracefully', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.error();
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        // Should show "No prompt data available yet" on network error
        expect(screen.getByText('No prompt data available yet.')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should display 0% response rate with all zero counts', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json({
            promptResponseRate: 0,
            responseBreakdown: { complete: 0, dismiss: 0, snooze: 0, timeout: 0 },
            averageResponseTime: 0,
          });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('0.0%')).toBeInTheDocument();
      });

      // All counts should be 0
      const zeroTexts = screen.getAllByText('0');
      expect(zeroTexts.length).toBeGreaterThanOrEqual(4); // complete, dismiss, snooze, timeout
    });

    it('should correctly format very short response times', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json({
            promptResponseRate: 100,
            responseBreakdown: { complete: 5, dismiss: 0, snooze: 0, timeout: 0 },
            averageResponseTime: 123, // 0.123 seconds
          });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('0.1s')).toBeInTheDocument();
      });
    });

    it('should correctly format very long response times', async () => {
      server.use(
        http.get('http://localhost:3001/api/analytics/prompts', () => {
          return HttpResponse.json({
            promptResponseRate: 50,
            responseBreakdown: { complete: 1, dismiss: 0, snooze: 0, timeout: 1 },
            averageResponseTime: 123456, // 123.456 seconds
          });
        })
      );

      render(<SettingsModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('123.5s')).toBeInTheDocument();
      });
    });
  });
});
