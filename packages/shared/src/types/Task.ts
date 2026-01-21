/**
 * Task status type - single source of truth
 */
export type TaskStatus = 'active' | 'completed';

/**
 * Core task entity - minimal, normalized design
 */
export interface Task {
  /** UUID v4 format */
  id: string;
  /** Task description (1-500 characters) */
  text: string;
  /** Task status */
  status: TaskStatus;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** ISO 8601 timestamp or null if active */
  completedAt: string | null;
}
