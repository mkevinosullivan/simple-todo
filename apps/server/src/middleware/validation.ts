import type { NextFunction, Request, Response } from 'express';
import { z, type ZodSchema } from 'zod';

import { logger } from '../utils/logger.js';

/**
 * Zod schema for updating WIP limit configuration
 * Validates that limit is an integer between 5 and 10 (inclusive)
 *
 * @example
 * // Valid request bodies:
 * { limit: 5 }
 * { limit: 7 }
 * { limit: 10 }
 *
 * // Invalid request bodies (will return 400):
 * { limit: 4 }    // Below minimum
 * { limit: 11 }   // Above maximum
 * { limit: "7" }  // String instead of number
 * { limit: 7.5 }  // Not an integer
 * {}              // Missing limit field
 */
export const UpdateWipLimitSchema = z.object({
  limit: z
    .number()
    .int({ message: 'WIP limit must be an integer' })
    .min(5, { message: 'WIP limit must be at least 5' })
    .max(10, { message: 'WIP limit must be at most 10' }),
});

/**
 * Type inference for UpdateWipLimitSchema
 * Use this type for type-safe access to validated request body
 */
export type UpdateWipLimitDto = z.infer<typeof UpdateWipLimitSchema>;

/**
 * Zod schema for updating education flags
 * Validates that hasSeenWIPLimitEducation is a boolean
 *
 * @example
 * // Valid request bodies:
 * { hasSeenWIPLimitEducation: true }
 * { hasSeenWIPLimitEducation: false }
 *
 * // Invalid request bodies (will return 400):
 * { hasSeenWIPLimitEducation: "true" }  // String instead of boolean
 * {}                                     // Missing field
 */
export const UpdateEducationFlagSchema = z.object({
  hasSeenWIPLimitEducation: z.boolean({
    required_error: 'hasSeenWIPLimitEducation is required',
    invalid_type_error: 'hasSeenWIPLimitEducation must be a boolean',
  }),
});

/**
 * Type inference for UpdateEducationFlagSchema
 * Use this type for type-safe access to validated request body
 */
export type UpdateEducationFlagDto = z.infer<typeof UpdateEducationFlagSchema>;

/**
 * Zod schema for partial config updates
 * Allows updating any config field with validation
 *
 * @example
 * // Valid request bodies:
 * { hasCompletedSetup: true }
 * { wipLimit: 8 }
 * { celebrationsEnabled: false }
 * { hasCompletedSetup: true, wipLimit: 7 }
 *
 * // Invalid request bodies (will return 400):
 * { wipLimit: 3 }                    // Out of range
 * { hasCompletedSetup: "true" }     // Wrong type
 * {}                                 // Empty body
 */
export const UpdateConfigSchema = z
  .object({
    wipLimit: z
      .number()
      .int({ message: 'WIP limit must be an integer' })
      .min(5, { message: 'WIP limit must be at least 5' })
      .max(10, { message: 'WIP limit must be at most 10' })
      .optional(),
    promptingEnabled: z.boolean().optional(),
    promptingFrequencyHours: z
      .number()
      .min(1, { message: 'Prompting frequency must be at least 1 hour' })
      .max(6, { message: 'Prompting frequency must be at most 6 hours' })
      .optional(),
    celebrationsEnabled: z.boolean().optional(),
    celebrationDurationSeconds: z
      .number()
      .int()
      .min(3, { message: 'Celebration duration must be at least 3 seconds' })
      .max(10, { message: 'Celebration duration must be at most 10 seconds' })
      .optional(),
    browserNotificationsEnabled: z.boolean().optional(),
    hasCompletedSetup: z.boolean().optional(),
    hasSeenPromptEducation: z.boolean().optional(),
    hasSeenWIPLimitEducation: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

/**
 * Type inference for UpdateConfigSchema
 * Use this type for type-safe access to validated request body
 */
export type UpdateConfigDto = z.infer<typeof UpdateConfigSchema>;

/**
 * Creates Express middleware that validates request body against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * @throws {Error} Returns 400 Bad Request with validation errors if validation fails
 *
 * @example
 * // Usage in route
 * router.put(
 *   '/wip-limit',
 *   validateRequest(UpdateWipLimitSchema),
 *   async (req, res) => {
 *     // req.body.limit is now validated and type-safe
 *     const { limit } = req.body;
 *     await wipLimitService.setWIPLimit(limit);
 *     res.json({ message: 'WIP limit updated', limit });
 *   }
 * );
 */
export function validateRequest<T extends ZodSchema>(
  schema: T
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body against schema
      const result = schema.safeParse(req.body);

      if (!result.success) {
        // Extract validation error messages
        const errorMessages = result.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Request validation failed', {
          path: req.path,
          method: req.method,
          errors: errorMessages,
        });

        // Return 400 Bad Request with descriptive error messages
        res.status(400).json({
          error: 'Validation failed',
          details: errorMessages,
        });
        return;
      }

      // Validation passed, proceed to next middleware
      next();
    } catch (error) {
      // Unexpected error during validation
      logger.error('Validation middleware error', { error });
      res.status(500).json({
        error: 'Internal server error during validation',
      });
    }
  };
}
