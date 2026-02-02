import { describe, expect, it } from 'vitest';

import { formatRelativeTime } from '../../../src/utils/formatRelativeTime';

describe('formatRelativeTime', () => {
  it('should return "just now" for less than 1 minute', () => {
    expect(formatRelativeTime(30000)).toBe('just now'); // 30 seconds
  });

  it('should return minutes for less than 1 hour', () => {
    expect(formatRelativeTime(300000)).toBe('5 minutes ago'); // 5 minutes
  });

  it('should return hours for less than 24 hours', () => {
    expect(formatRelativeTime(7200000)).toBe('2 hours ago'); // 2 hours
  });

  it('should return days for less than 1 week', () => {
    expect(formatRelativeTime(259200000)).toBe('3 days ago'); // 3 days
  });

  it('should return weeks for 7+ days', () => {
    expect(formatRelativeTime(1209600000)).toBe('2 weeks ago'); // 14 days
  });

  describe('boundary conditions', () => {
    it('should handle transition from hours to days at 24h boundary', () => {
      expect(formatRelativeTime(86399000)).toBe('23 hours ago'); // Just under 24h
      expect(formatRelativeTime(86400000)).toBe('1 day ago'); // Exactly 24h
    });

    it('should handle transition from days to weeks at 7d boundary', () => {
      expect(formatRelativeTime(604799000)).toContain('day'); // Just under 7 days
      expect(formatRelativeTime(604800000)).toBe('1 week ago'); // Exactly 7 days
    });

    it('should handle singular vs plural correctly', () => {
      expect(formatRelativeTime(60000)).toBe('1 minute ago'); // Not "1 minutes"
      expect(formatRelativeTime(3600000)).toBe('1 hour ago'); // Not "1 hours"
      expect(formatRelativeTime(86400000)).toBe('1 day ago'); // Not "1 days"
    });
  });

  describe('edge cases', () => {
    it('should handle zero milliseconds', () => {
      expect(formatRelativeTime(0)).toBe('just now');
    });

    it('should handle very large values', () => {
      expect(formatRelativeTime(999999999999)).toContain('week');
    });

    it('should handle negative values', () => {
      expect(formatRelativeTime(-1000)).toBe('just now');
    });

    it('should handle NaN', () => {
      expect(formatRelativeTime(NaN)).toBe('just now');
    });
  });
});
