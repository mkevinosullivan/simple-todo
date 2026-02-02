import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AgeIndicator } from '../../../src/components/AgeIndicator';

describe('AgeIndicator', () => {
  describe('Rendering and Colors', () => {
    it('should not render indicator for fresh tasks', () => {
      const { container } = render(
        <AgeIndicator ageCategory="fresh" createdAt="2026-02-02T10:00:00.000Z" />
      );

      // Fresh tasks should return null (no indicator)
      expect(container.firstChild).toBeNull();
    });

    it('should render light blue indicator for recent tasks', () => {
      const { container } = render(
        <AgeIndicator ageCategory="recent" createdAt="2026-01-31T10:00:00.000Z" />
      );

      const badge = container.querySelector('[style*="background-color"]');
      expect(badge).toHaveStyle({ backgroundColor: '#60A5FA' });
    });

    it('should render yellow indicator for aging tasks', () => {
      const { container } = render(
        <AgeIndicator ageCategory="aging" createdAt="2026-01-28T10:00:00.000Z" />
      );

      const badge = container.querySelector('[style*="background-color"]');
      expect(badge).toHaveStyle({ backgroundColor: '#FBBF24' });
    });

    it('should render orange indicator for old tasks', () => {
      const { container } = render(
        <AgeIndicator ageCategory="old" createdAt="2026-01-20T10:00:00.000Z" />
      );

      const badge = container.querySelector('[style*="background-color"]');
      expect(badge).toHaveStyle({ backgroundColor: '#F97316' });
    });

    it('should render red indicator for stale tasks', () => {
      const { container } = render(
        <AgeIndicator ageCategory="stale" createdAt="2026-01-10T10:00:00.000Z" />
      );

      const badge = container.querySelector('[style*="background-color"]');
      expect(badge).toHaveStyle({ backgroundColor: '#F43F5E' });
    });
  });

  describe('Tooltip and Accessibility', () => {
    it('should show tooltip with relative time', () => {
      // Create a timestamp 5 days ago
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

      render(<AgeIndicator ageCategory="aging" createdAt={fiveDaysAgo} />);

      const indicator = screen.getByRole('img');
      expect(indicator).toHaveAttribute('title', expect.stringContaining('days ago'));
    });

    it('should have aria-label for screen readers', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

      render(<AgeIndicator ageCategory="aging" createdAt={fiveDaysAgo} />);

      const indicator = screen.getByRole('img');
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('Created'));
    });

    it('should be keyboard focusable with tabIndex=0', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

      render(<AgeIndicator ageCategory="aging" createdAt={fiveDaysAgo} />);

      const indicator = screen.getByRole('img');
      expect(indicator).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid ISO timestamp gracefully', () => {
      const { container } = render(<AgeIndicator ageCategory="recent" createdAt="invalid-timestamp" />);

      // Should return null for invalid timestamp
      expect(container.firstChild).toBeNull();
    });

    it('should handle empty string timestamp', () => {
      const { container } = render(<AgeIndicator ageCategory="recent" createdAt="" />);

      expect(container.firstChild).toBeNull();
    });

    it('should handle malformed date string', () => {
      const { container } = render(<AgeIndicator ageCategory="recent" createdAt="2026-13-45" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Age Category Boundaries', () => {
    it('should render correctly for task at exactly 24 hours (recent boundary)', () => {
      const exactlyOneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { container } = render(<AgeIndicator ageCategory="recent" createdAt={exactlyOneDayAgo} />);

      const badge = container.querySelector('[style*="background-color"]');
      expect(badge).toHaveStyle({ backgroundColor: '#60A5FA' });
    });

    it('should render correctly for task at exactly 3 days (aging boundary)', () => {
      const exactlyThreeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

      const { container } = render(<AgeIndicator ageCategory="aging" createdAt={exactlyThreeDaysAgo} />);

      const badge = container.querySelector('[style*="background-color"]');
      expect(badge).toHaveStyle({ backgroundColor: '#FBBF24' });
    });

    it('should render correctly for task at exactly 7 days (old boundary)', () => {
      const exactlySevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { container } = render(<AgeIndicator ageCategory="old" createdAt={exactlySevenDaysAgo} />);

      const badge = container.querySelector('[style*="background-color"]');
      expect(badge).toHaveStyle({ backgroundColor: '#F97316' });
    });

    it('should render correctly for task at exactly 14 days (stale boundary)', () => {
      const exactlyFourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      const { container } = render(<AgeIndicator ageCategory="stale" createdAt={exactlyFourteenDaysAgo} />);

      const badge = container.querySelector('[style*="background-color"]');
      expect(badge).toHaveStyle({ backgroundColor: '#F43F5E' });
    });
  });
});
