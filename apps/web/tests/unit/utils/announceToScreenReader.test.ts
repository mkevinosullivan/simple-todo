import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { announceToScreenReader } from '../../../src/utils/announceToScreenReader';

describe('announceToScreenReader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear any existing sr-only elements
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('should create a live region element with correct ARIA attributes', () => {
    announceToScreenReader('Test message', 'polite');

    const announcement = document.querySelector('[role="status"]');
    expect(announcement).toBeInTheDocument();
    expect(announcement).toHaveAttribute('aria-live', 'polite');
    expect(announcement).toHaveAttribute('aria-atomic', 'true');
    expect(announcement).toHaveClass('sr-only');
    expect(announcement).toHaveTextContent('Test message');
  });

  it('should support assertive priority', () => {
    announceToScreenReader('Urgent message', 'assertive');

    const announcement = document.querySelector('[role="status"]');
    expect(announcement).toHaveAttribute('aria-live', 'assertive');
  });

  it('should default to polite priority', () => {
    announceToScreenReader('Default message');

    const announcement = document.querySelector('[role="status"]');
    expect(announcement).toHaveAttribute('aria-live', 'polite');
  });

  it('should remove element after 1 second', () => {
    announceToScreenReader('Temporary message');

    // Announcement should exist immediately
    expect(document.querySelector('[role="status"]')).toBeInTheDocument();

    // Fast-forward time by 1 second
    vi.advanceTimersByTime(1000);

    // Announcement should be removed
    expect(document.querySelector('[role="status"]')).not.toBeInTheDocument();
  });

  it('should create multiple announcements if called multiple times', () => {
    announceToScreenReader('First message');
    announceToScreenReader('Second message');

    const announcements = document.querySelectorAll('[role="status"]');
    expect(announcements).toHaveLength(2);
    expect(announcements[0]).toHaveTextContent('First message');
    expect(announcements[1]).toHaveTextContent('Second message');
  });

  it('should remove announcements independently', () => {
    announceToScreenReader('First message');

    // Advance time by 500ms
    vi.advanceTimersByTime(500);

    announceToScreenReader('Second message');

    // Advance time by another 600ms (total 1100ms)
    vi.advanceTimersByTime(600);

    // First message should be removed, second should still exist
    const announcements = document.querySelectorAll('[role="status"]');
    expect(announcements).toHaveLength(1);
    expect(announcements[0]).toHaveTextContent('Second message');

    // Advance time by another 500ms to remove second message
    vi.advanceTimersByTime(500);
    expect(document.querySelectorAll('[role="status"]')).toHaveLength(0);
  });
});
