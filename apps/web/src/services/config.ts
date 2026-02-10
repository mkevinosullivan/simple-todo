import type { Config } from '@simple-todo/shared/types';

import { apiGet, apiPatch, apiPut } from './api.js';

/**
 * WIP Config response from API
 */
export interface WipConfig {
  limit: number;
  currentCount: number;
  canAddTask: boolean;
  hasSeenWIPLimitEducation: boolean;
  hasCompletedSetup?: boolean; // Added for first-launch flow
}

/**
 * Get full application configuration
 *
 * @returns Promise resolving to full Config object
 * @throws {Error} If API request fails
 *
 * @example
 * const config = await getConfig();
 * console.log(config.wipLimit); // 7
 * console.log(config.hasCompletedSetup); // false
 */
export async function getConfig(): Promise<Config> {
  return await apiGet<Config>('/api/config');
}

/**
 * Get current WIP limit configuration
 *
 * @returns Promise resolving to WIP config with limit, current count, and canAddTask flag
 * @throws {Error} If API request fails
 *
 * @example
 * const config = await getWipConfig();
 * console.log(config.limit); // 7
 * console.log(config.currentCount); // 3
 * console.log(config.canAddTask); // true
 */
export async function getWipConfig(): Promise<WipConfig> {
  return await apiGet<WipConfig>('/api/config/wip-limit');
}

/**
 * Update WIP limit configuration
 *
 * @param limit - New WIP limit value (5-10)
 * @returns Promise resolving to updated WIP config
 * @throws {Error} If limit is out of range or API request fails
 *
 * @example
 * const updated = await updateWipLimit(8);
 * console.log(updated.limit); // 8
 */
export async function updateWipLimit(limit: number): Promise<WipConfig> {
  return await apiPut<WipConfig>('/api/config/wip-limit', { limit });
}

/**
 * Education flag response from API
 */
export interface EducationFlagResponse {
  hasSeenWIPLimitEducation: boolean;
}

/**
 * Update education flag to mark that user has seen WIP limit education
 *
 * @param hasSeenWIPLimitEducation - Whether user has seen the education message
 * @returns Promise resolving to updated education flag
 * @throws {Error} If API request fails
 *
 * @example
 * await updateEducationFlag(true);
 */
export async function updateEducationFlag(
  hasSeenWIPLimitEducation: boolean
): Promise<EducationFlagResponse> {
  return await apiPatch<EducationFlagResponse>('/api/config/education', {
    hasSeenWIPLimitEducation,
  });
}

/**
 * Mark user setup as completed (dismiss QuickStartGuide)
 * Updates hasCompletedSetup flag to true
 *
 * @returns Promise resolving to updated full Config object
 * @throws {Error} If API request fails
 *
 * @example
 * const updatedConfig = await markSetupCompleted();
 * console.log(updatedConfig.hasCompletedSetup); // true
 */
export async function markSetupCompleted(): Promise<Config> {
  return await apiPatch<Config>('/api/config', { hasCompletedSetup: true });
}

/**
 * Celebration config response from API
 */
export interface CelebrationConfig {
  celebrationsEnabled: boolean;
  celebrationDurationSeconds: number;
}

/**
 * Get celebration configuration
 *
 * @returns Promise resolving to celebration config with enabled flag and duration
 * @throws {Error} If API request fails
 *
 * @example
 * const config = await getCelebrationConfig();
 * console.log(config.celebrationsEnabled); // true
 * console.log(config.celebrationDurationSeconds); // 7
 */
export async function getCelebrationConfig(): Promise<CelebrationConfig> {
  return await apiGet<CelebrationConfig>('/api/config/celebrations');
}

/**
 * Update celebration configuration
 *
 * @param celebrationsEnabled - Whether to enable celebrations
 * @param celebrationDurationSeconds - Duration in seconds (3-10)
 * @returns Promise resolving to updated full Config object
 * @throws {Error} If duration is out of range or API request fails
 *
 * @example
 * const updated = await updateCelebrationConfig(false, 5);
 * console.log(updated.celebrationsEnabled); // false
 * console.log(updated.celebrationDurationSeconds); // 5
 */
export async function updateCelebrationConfig(
  celebrationsEnabled: boolean,
  celebrationDurationSeconds: number
): Promise<Config> {
  return await apiPut<Config>('/api/config/celebrations', {
    celebrationsEnabled,
    celebrationDurationSeconds,
  });
}

/**
 * Prompting config response from API
 */
export interface PromptingConfig {
  enabled: boolean;
  frequencyHours: number;
  nextPromptTime?: string;
}

/**
 * Get prompting configuration
 *
 * @returns Promise resolving to prompting config with enabled flag, frequency, and optional next prompt time
 * @throws {Error} If API request fails
 *
 * @example
 * const config = await getPromptingConfig();
 * console.log(config.enabled); // true
 * console.log(config.frequencyHours); // 2.5
 */
export async function getPromptingConfig(): Promise<PromptingConfig> {
  return await apiGet<PromptingConfig>('/api/config/prompting');
}

/**
 * Update prompting configuration
 *
 * @param enabled - Whether to enable proactive prompting
 * @param frequencyHours - Prompting frequency in hours (1-6)
 * @returns Promise resolving to updated prompting config
 * @throws {Error} If frequencyHours is out of range or API request fails
 *
 * @example
 * const updated = await updatePromptingConfig(true, 3);
 * console.log(updated.enabled); // true
 * console.log(updated.frequencyHours); // 3
 */
export async function updatePromptingConfig(
  enabled: boolean,
  frequencyHours: number
): Promise<PromptingConfig> {
  return await apiPut<PromptingConfig>('/api/config/prompting', {
    enabled,
    frequencyHours,
  });
}

/**
 * Update browser notifications configuration
 *
 * @param enabled - Whether to enable browser notifications
 * @returns Promise resolving to updated full Config object
 * @throws {Error} If API request fails
 *
 * @example
 * const updated = await updateBrowserNotifications(true);
 * console.log(updated.browserNotificationsEnabled); // true
 */
export async function updateBrowserNotifications(enabled: boolean): Promise<Config> {
  return await apiPut<Config>('/api/config/browser-notifications', {
    enabled,
  });
}

/**
 * Quiet hours config response from API
 */
export interface QuietHoursConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

/**
 * Get quiet hours configuration
 *
 * @returns Promise resolving to quiet hours config with enabled flag, startTime, and endTime
 * @throws {Error} If API request fails
 *
 * @example
 * const config = await getQuietHoursConfig();
 * console.log(config.enabled); // false
 * console.log(config.startTime); // "22:00"
 * console.log(config.endTime); // "08:00"
 */
export async function getQuietHoursConfig(): Promise<QuietHoursConfig> {
  return await apiGet<QuietHoursConfig>('/api/config/quiet-hours');
}

/**
 * Update quiet hours configuration
 *
 * @param enabled - Whether to enable quiet hours
 * @param startTime - Start time in HH:mm format (00:00-23:59)
 * @param endTime - End time in HH:mm format (00:00-23:59)
 * @returns Promise resolving to updated quiet hours config
 * @throws {Error} If time format is invalid or API request fails
 *
 * @example
 * const updated = await updateQuietHoursConfig(true, "22:00", "08:00");
 * console.log(updated.enabled); // true
 * console.log(updated.startTime); // "22:00"
 * console.log(updated.endTime); // "08:00"
 */
export async function updateQuietHoursConfig(
  enabled: boolean,
  startTime: string,
  endTime: string
): Promise<QuietHoursConfig> {
  return await apiPut<QuietHoursConfig>('/api/config/quiet-hours', {
    enabled,
    startTime,
    endTime,
  });
}
