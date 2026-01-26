import { TaskHelpers } from '../../src/utils/TaskHelpers.js';

describe('TaskHelpers.getTextLength', () => {
  it('should return correct character count for normal text', () => {
    expect(TaskHelpers.getTextLength('Buy groceries')).toBe(13);
  });

  it('should handle empty string', () => {
    expect(TaskHelpers.getTextLength('')).toBe(0);
  });

  it('should count special characters and spaces', () => {
    expect(TaskHelpers.getTextLength('Hello World!')).toBe(12);
    expect(TaskHelpers.getTextLength('Task with emoji 🎉')).toBe(18);
    expect(TaskHelpers.getTextLength('Special chars: @#$%')).toBe(19);
  });

  it('should handle maximum length text (500 characters)', () => {
    const maxLengthText = 'a'.repeat(500);
    expect(TaskHelpers.getTextLength(maxLengthText)).toBe(500);
  });
});

describe('TaskHelpers.getDuration', () => {
  it('should return null for active tasks (null completedAt)', () => {
    const result = TaskHelpers.getDuration('2026-01-20T10:00:00.000Z', null);
    expect(result).toBeNull();
  });

  it('should calculate correct milliseconds for completed tasks', () => {
    const createdAt = '2026-01-20T10:00:00.000Z';
    const completedAt = '2026-01-20T11:00:00.000Z';
    const result = TaskHelpers.getDuration(createdAt, completedAt);
    expect(result).toBe(3600000); // 1 hour in milliseconds
  });

  it('should handle same timestamp (instant completion)', () => {
    const timestamp = '2026-01-20T10:00:00.000Z';
    const result = TaskHelpers.getDuration(timestamp, timestamp);
    expect(result).toBe(0);
  });

  it('should handle tasks completed much later (days/weeks)', () => {
    const createdAt = '2026-01-01T00:00:00.000Z';
    const completedAt = '2026-01-15T00:00:00.000Z'; // 14 days later
    const result = TaskHelpers.getDuration(createdAt, completedAt);
    expect(result).toBe(14 * 24 * 60 * 60 * 1000); // 14 days in milliseconds
  });

  it('should handle edge case where completedAt before createdAt', () => {
    // This tests data integrity - should not normally happen, but function should handle it
    const createdAt = '2026-01-20T12:00:00.000Z';
    const completedAt = '2026-01-20T10:00:00.000Z'; // 2 hours earlier
    const result = TaskHelpers.getDuration(createdAt, completedAt);
    expect(result).toBe(-7200000); // Negative duration indicates data corruption
  });
});

describe('TaskHelpers.isValidISOTimestamp', () => {
  it('should accept valid ISO 8601 strings', () => {
    expect(TaskHelpers.isValidISOTimestamp('2026-01-20T10:00:00.000Z')).toBe(true);
    expect(TaskHelpers.isValidISOTimestamp('2026-12-31T23:59:59.999Z')).toBe(true);
    expect(TaskHelpers.isValidISOTimestamp('2026-01-01T00:00:00.000Z')).toBe(true);
  });

  it('should reject incomplete format', () => {
    expect(TaskHelpers.isValidISOTimestamp('2026-01-20')).toBe(false);
    expect(TaskHelpers.isValidISOTimestamp('2026-01-20T10:00:00')).toBe(false);
    expect(TaskHelpers.isValidISOTimestamp('2026-01-20T10:00:00.000')).toBe(false);
  });

  it('should reject invalid date values', () => {
    expect(TaskHelpers.isValidISOTimestamp('2026-13-45T99:99:99.999Z')).toBe(false);
  });

  it('should reject non-timestamp strings', () => {
    expect(TaskHelpers.isValidISOTimestamp('invalid')).toBe(false);
    expect(TaskHelpers.isValidISOTimestamp('')).toBe(false);
    expect(TaskHelpers.isValidISOTimestamp('not a timestamp')).toBe(false);
  });

  it('should reject non-Z timezone formats', () => {
    expect(TaskHelpers.isValidISOTimestamp('2026-01-20T10:00:00.000+00:00')).toBe(false);
    expect(TaskHelpers.isValidISOTimestamp('2026-01-20T10:00:00.000-05:00')).toBe(false);
    expect(TaskHelpers.isValidISOTimestamp('2026-01-20T10:00:00.000')).toBe(false);
  });
});
