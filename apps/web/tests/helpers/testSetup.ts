import { configure } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { handlers } from '../mocks/handlers';

// Configure Testing Library defaults
configure({
  asyncUtilTimeout: 5000, // Increase default waitFor timeout to 5 seconds
});

/**
 * Setup MSW server for API mocking
 */
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});
