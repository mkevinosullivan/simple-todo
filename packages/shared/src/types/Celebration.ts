/**
 * Celebration message variant types
 */
export type CelebrationVariant =
  | 'enthusiastic'
  | 'supportive'
  | 'motivational'
  | 'data-driven';

/**
 * Celebration message returned from the API
 */
export interface CelebrationMessage {
  message: string;
  variant: CelebrationVariant;
  duration?: number; // Optional override for display duration (ms)
}
