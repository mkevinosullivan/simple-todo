/**
 * Validation utilities for API request data
 *
 * Provides reusable validation functions for common data types and formats.
 * Used across API routes to ensure data integrity and prevent invalid data
 * from entering the system.
 */

/**
 * UUID format regex pattern
 *
 * Matches UUID format (versions 1-5): 8-4-4-4-12 hexadecimal characters
 * Validates version bits in 3rd segment ([1-5]) and variant bits in 4th segment ([89ab])
 * Case-insensitive to accept both lowercase and uppercase variants
 *
 * Format: xxxxxxxx-xxxx-Vxxx-Yxxx-xxxxxxxxxxxx
 * - V = version (1-5)
 * - Y = variant (8, 9, a, or b)
 *
 * @example
 * '123e4567-e89b-12d3-a456-426614174000' // valid (version 1)
 * '550e8400-e29b-41d4-a716-446655440000' // valid (version 4)
 * 'invalid-uuid' // invalid
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4 format
 *
 * @param value - The string to validate
 * @returns true if value is a valid UUID format, false otherwise
 *
 * @example
 * isValidUuid('123e4567-e89b-12d3-a456-426614174000'); // true
 * isValidUuid('invalid-uuid'); // false
 * isValidUuid(''); // false
 */
export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}
