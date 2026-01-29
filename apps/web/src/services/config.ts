import { apiGet, apiPatch, apiPut } from './api.js';

/**
 * WIP Config response from API
 */
export interface WipConfig {
  limit: number;
  currentCount: number;
  canAddTask: boolean;
  hasSeenWIPLimitEducation: boolean;
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
