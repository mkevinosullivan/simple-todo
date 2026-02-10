/**
 * Application configuration interface
 * Stores user preferences and settings with default values
 */
export interface Config {
  /** WIP (Work In Progress) limit (5-10 range) */
  wipLimit: number;
  /** Enable proactive prompting feature */
  promptingEnabled: boolean;
  /** Prompting frequency in hours (1-6 range) */
  promptingFrequencyHours: number;
  /** Enable celebration messages on task completion */
  celebrationsEnabled: boolean;
  /** Celebration display duration in seconds (3-10 range) */
  celebrationDurationSeconds: number;
  /** Enable browser notifications */
  browserNotificationsEnabled: boolean;
  /** Whether user has completed initial setup */
  hasCompletedSetup: boolean;
  /** Whether user has seen the prompt education screen */
  hasSeenPromptEducation: boolean;
  /** Whether user has seen the WIP limit education message */
  hasSeenWIPLimitEducation: boolean;
  /** Enable quiet hours feature */
  quietHoursEnabled: boolean;
  /** Quiet hours start time in 24-hour format "HH:mm" */
  quietHoursStart: string;
  /** Quiet hours end time in 24-hour format "HH:mm" */
  quietHoursEnd: string;
}

/**
 * Default configuration values
 * Applied on first app launch or when config.json is missing
 */
export const DEFAULT_CONFIG: Config = {
  wipLimit: 7, // Middle of 5-10 range
  promptingEnabled: true,
  promptingFrequencyHours: 2.5,
  celebrationsEnabled: true,
  celebrationDurationSeconds: 7,
  browserNotificationsEnabled: false,
  hasCompletedSetup: false,
  hasSeenPromptEducation: false,
  hasSeenWIPLimitEducation: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

/**
 * DTO for updating prompting configuration
 * Used by PUT /api/config/prompting endpoint
 */
export interface UpdatePromptingConfigDto {
  /** Whether prompting is enabled */
  enabled: boolean;
  /** Prompting frequency in hours (1-6 range) */
  frequencyHours: number;
}

/**
 * DTO for updating quiet hours configuration
 * Used by PUT /api/config/quiet-hours endpoint
 */
export interface UpdateQuietHoursConfigDto {
  /** Whether quiet hours is enabled */
  enabled: boolean;
  /** Start time in 24-hour format "HH:mm" */
  startTime: string;
  /** End time in 24-hour format "HH:mm" */
  endTime: string;
}
