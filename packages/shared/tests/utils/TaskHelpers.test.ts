import type { Task } from '../../src/types/Task.js';
import { TaskHelpers } from '../../src/utils/TaskHelpers.js';

describe('TaskHelpers.getAge', () => {
  beforeEach(() => {
    // Mock current time to 2026-01-30T12:00:00.000Z
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return 0 for task created just now', () => {
    const task: Task = {
      id: '123',
      text: 'Test task',
      status: 'active',
      createdAt: '2026-01-30T12:00:00.000Z',
      completedAt: null,
    };
    expect(TaskHelpers.getAge(task)).toBe(0);
  });

  it('should calculate age in milliseconds for task created 1 hour ago', () => {
    const task: Task = {
      id: '123',
      text: 'Test task',
      status: 'active',
      createdAt: '2026-01-30T11:00:00.000Z',
      completedAt: null,
    };
    const expectedAge = 60 * 60 * 1000; // 1 hour in milliseconds
    expect(TaskHelpers.getAge(task)).toBe(expectedAge);
  });

  it('should calculate age for task created 1 day ago', () => {
    const task: Task = {
      id: '123',
      text: 'Test task',
      status: 'active',
      createdAt: '2026-01-29T12:00:00.000Z',
      completedAt: null,
    };
    const expectedAge = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    expect(TaskHelpers.getAge(task)).toBe(expectedAge);
  });

  it('should calculate age for task created 15 days ago', () => {
    const task: Task = {
      id: '123',
      text: 'Test task',
      status: 'active',
      createdAt: '2026-01-15T12:00:00.000Z',
      completedAt: null,
    };
    const expectedAge = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds
    expect(TaskHelpers.getAge(task)).toBe(expectedAge);
  });

  it('should work for completed tasks', () => {
    const task: Task = {
      id: '123',
      text: 'Test task',
      status: 'completed',
      createdAt: '2026-01-28T12:00:00.000Z',
      completedAt: '2026-01-29T12:00:00.000Z',
    };
    const expectedAge = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
    expect(TaskHelpers.getAge(task)).toBe(expectedAge);
  });
});

describe('TaskHelpers.getAgeCategory', () => {
  beforeEach(() => {
    // Mock current time to 2026-01-30T12:00:00.000Z
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('fresh category (< 1 day)', () => {
    it('should return "fresh" for task created just now', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-30T12:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('fresh');
    });

    it('should return "fresh" for task created 12 hours ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-30T00:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('fresh');
    });

    it('should return "fresh" for task created 23 hours 59 minutes ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-29T12:01:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('fresh');
    });
  });

  describe('recent category (1-3 days)', () => {
    it('should return "recent" for task created exactly 1 day ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-29T12:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('recent');
    });

    it('should return "recent" for task created 2 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-28T12:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('recent');
    });

    it('should return "recent" for task created 2.9 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-27T14:24:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('recent');
    });
  });

  describe('aging category (3-7 days)', () => {
    it('should return "aging" for task created exactly 3 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-27T12:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('aging');
    });

    it('should return "aging" for task created 5 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-25T12:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('aging');
    });

    it('should return "aging" for task created 6.9 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-23T14:24:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('aging');
    });
  });

  describe('old category (7-14 days)', () => {
    it('should return "old" for task created exactly 7 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-23T12:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('old');
    });

    it('should return "old" for task created 10 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-20T12:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('old');
    });

    it('should return "old" for task created 13.9 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-16T14:24:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('old');
    });
  });

  describe('stale category (> 14 days)', () => {
    it('should return "stale" for task created exactly 14 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2026-01-16T12:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('stale');
    });

    it('should return "stale" for task created 30 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2025-12-31T12:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('stale');
    });

    it('should return "stale" for task created 100 days ago', () => {
      const task: Task = {
        id: '123',
        text: 'Test task',
        status: 'active',
        createdAt: '2025-10-22T12:00:00.000Z',
        completedAt: null,
      };
      expect(TaskHelpers.getAgeCategory(task)).toBe('stale');
    });
  });

  it('should work for completed tasks', () => {
    const task: Task = {
      id: '123',
      text: 'Test task',
      status: 'completed',
      createdAt: '2026-01-25T12:00:00.000Z',
      completedAt: '2026-01-28T12:00:00.000Z',
    };
    // Age calculated from current time (2026-01-30T12:00:00.000Z), not completion time
    // Task is 5 days old, should be "aging"
    expect(TaskHelpers.getAgeCategory(task)).toBe('aging');
  });
});

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
