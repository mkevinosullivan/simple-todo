import { DataService } from './DataService.js';
import { PromptingService } from './PromptingService.js';
import { TaskService } from './TaskService.js';

/**
 * Shared service instances
 *
 * These instances are shared across the application to ensure consistent state.
 * Particularly important for PromptingService which needs to emit events to SSE connections.
 */

export const dataService = new DataService(process.env.DATA_DIR);
export const taskService = new TaskService(dataService);
export const promptingService = new PromptingService(taskService, dataService);

/**
 * Wire activity detection events
 *
 * PromptingService listens to TaskService events to track user activity
 * and avoid interrupting active work sessions with prompts.
 */
taskService.on('taskCreated', () => {
  promptingService.recordUserActivity();
});

taskService.on('taskCompleted', () => {
  promptingService.recordUserActivity();
});
