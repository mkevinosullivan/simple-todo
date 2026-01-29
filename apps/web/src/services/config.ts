import { apiGet, apiPut } from './api.js';

/**
 * WIP Config response from API
 */
export interface WipConfig {
  limit: number;
  currentCount: number;
  canAddTask: boolean;
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
  return await apiGet<WipConfig>('/config/wip-limit');
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
  return await apiPut<WipConfig>('/config/wip-limit', { limit });
}
