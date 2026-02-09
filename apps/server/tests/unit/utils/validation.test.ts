import { describe, expect, it } from '@jest/globals';

import { isValidUuid } from '../../../src/utils/validation.js';

describe('isValidUuid', () => {
  describe('Valid UUIDs', () => {
    it('should accept valid UUID v1', () => {
      // UUID v1 (time-based)
      const uuid = '550e8400-e29b-11d4-a716-446655440000';
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('should accept valid UUID v4 (application default)', () => {
      // UUID v4 (random)
      const uuid = '123e4567-e89b-41d4-a716-446655440000';
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('should accept valid UUID v4 with variant bit 8', () => {
      const uuid = '550e8400-e29b-41d4-8716-446655440000';
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('should accept valid UUID v4 with variant bit 9', () => {
      const uuid = '550e8400-e29b-41d4-9716-446655440000';
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('should accept valid UUID v4 with variant bit a', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('should accept valid UUID v4 with variant bit b', () => {
      const uuid = '550e8400-e29b-41d4-b716-446655440000';
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('should accept valid UUID v5', () => {
      // UUID v5 (SHA-1 hash)
      const uuid = '886313e1-3b8a-5372-9b90-0c9aee199e5d';
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('should accept UUID with uppercase letters', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000';
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('should accept UUID with mixed case', () => {
      const uuid = '550e8400-E29B-41d4-A716-446655440000';
      expect(isValidUuid(uuid)).toBe(true);
    });
  });

  describe('Invalid UUIDs - Wrong Version', () => {
    it('should reject UUID with version 0', () => {
      const uuid = '550e8400-e29b-01d4-a716-446655440000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject UUID with version 6', () => {
      const uuid = '550e8400-e29b-61d4-a716-446655440000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject UUID with version 7', () => {
      const uuid = '550e8400-e29b-71d4-a716-446655440000';
      expect(isValidUuid(uuid)).toBe(false);
    });
  });

  describe('Invalid UUIDs - Wrong Variant', () => {
    it('should reject UUID with variant bit 0', () => {
      const uuid = '550e8400-e29b-41d4-0716-446655440000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject UUID with variant bit 7', () => {
      const uuid = '550e8400-e29b-41d4-7716-446655440000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject UUID with variant bit c', () => {
      const uuid = '550e8400-e29b-41d4-c716-446655440000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject UUID with variant bit f', () => {
      const uuid = '550e8400-e29b-41d4-f716-446655440000';
      expect(isValidUuid(uuid)).toBe(false);
    });
  });

  describe('Invalid UUIDs - Malformed Format', () => {
    it('should reject UUID without hyphens', () => {
      const uuid = '550e8400e29b41d4a716446655440000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject UUID with too few characters', () => {
      const uuid = '550e8400-e29b-41d4-a716-44665544000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject UUID with too many characters', () => {
      const uuid = '550e8400-e29b-41d4-a716-4466554400000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject UUID with wrong hyphen positions', () => {
      const uuid = '550e84-00e29b-41d4-a716-446655440000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject UUID with non-hexadecimal characters', () => {
      const uuid = '550e8400-e29b-41d4-a716-44665544000g';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject UUID with spaces', () => {
      const uuid = '550e8400 e29b-41d4-a716-446655440000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject random text', () => {
      const uuid = 'not-a-valid-uuid-format-at-all';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should reject simple invalid string', () => {
      const uuid = 'invalid-uuid';
      expect(isValidUuid(uuid)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should reject empty string', () => {
      expect(isValidUuid('')).toBe(false);
    });

    it('should reject string with only hyphens', () => {
      expect(isValidUuid('----')).toBe(false);
    });

    it('should reject nil UUID (all zeros) with invalid version/variant', () => {
      const uuid = '00000000-0000-0000-0000-000000000000';
      expect(isValidUuid(uuid)).toBe(false);
    });

    it('should accept UUID with all fs (valid version and variant)', () => {
      const uuid = 'ffffffff-ffff-4fff-bfff-ffffffffffff';
      expect(isValidUuid(uuid)).toBe(true);
    });
  });

  describe('Real-World UUIDs', () => {
    it('should accept UUID generated by uuid.v4()', () => {
      // Example of actual UUID v4 output
      const uuid = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('should accept another real UUID v4', () => {
      const uuid = '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b';
      expect(isValidUuid(uuid)).toBe(true);
    });

    it('should accept UUID v1 from database', () => {
      const uuid = 'c9a646d3-9c61-11e7-abc4-cec278b6b50a';
      expect(isValidUuid(uuid)).toBe(true);
    });
  });
});
