import type { CelebrationMessage } from '@simple-todo/shared/types';

import { apiGet } from './api';

/**
 * Celebration API service - handles celebration message fetching
 */
export const celebrations = {
  /**
   * Fetch a random celebration message from the server
   *
   * @returns Celebration message object
   * @throws {Error} If API request fails
   */
  async getMessage(): Promise<CelebrationMessage> {
    return apiGet<CelebrationMessage>('/api/celebrations/message');
  },
};
