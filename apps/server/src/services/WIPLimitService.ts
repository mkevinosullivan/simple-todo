import type { Config } from '@simple-todo/shared/types';

import type { DataService } from './DataService.js';
import type { TaskService } from './TaskService.js';

/**
 * WIPLimitService - Business logic for WIP (Work In Progress) limit enforcement
 * Enforces configurable task limits and provides helpful messaging
 *
 * @example Route Integration - How to use WIPLimitService in API routes
 *
 * // Example 1: Check WIP limit before creating a task (POST /api/tasks)
 * router.post('/tasks', async (req, res) => {
 *   const { text } = req.body;
 *
 *   // Check if task can be added without exceeding limit
 *   const canAdd = await wipLimitService.canAddTask();
 *   if (!canAdd) {
 *     const message = await wipLimitService.getWIPLimitMessage();
 *     return res.status(400).json({ error: message });
 *   }
 *
 *   // WIP limit OK, create task
 *   const task = await taskService.createTask(text);
 *   res.status(201).json(task);
 * });
 *
 * // Example 2: Get current WIP limit (GET /api/config/wip-limit)
 * router.get('/config/wip-limit', async (req, res) => {
 *   const limit = await wipLimitService.getWIPLimit();
 *   const currentCount = await wipLimitService.getCurrentWIPCount();
 *
 *   res.json({
 *     limit,
 *     currentCount,
 *     canAddTask: currentCount < limit
 *   });
 * });
 *
 * // Example 3: Update WIP limit (PUT /api/config/wip-limit)
 * router.put('/config/wip-limit', async (req, res) => {
 *   const { limit } = req.body;
 *
 *   try {
 *     await wipLimitService.setWIPLimit(limit);
 *     res.json({ message: 'WIP limit updated successfully', limit });
 *   } catch (error) {
 *     // Service throws descriptive errors (e.g., "WIP limit must be between 5 and 10")
 *     res.status(400).json({ error: error.message });
 *   }
 * });
 */
export class WIPLimitService {
  private readonly taskService: TaskService;
  private readonly dataService: DataService;

  constructor(taskService: TaskService, dataService: DataService) {
    this.taskService = taskService;
    this.dataService = dataService;
  }

  /**
   * Gets the current WIP limit from configuration
   *
   * @returns The WIP limit value (5-10)
   * @throws {Error} If unable to read config
   *
   * @example
   * const limit = await wipLimitService.getWIPLimit();
   * console.log(limit); // 7 (default)
   */
  async getWIPLimit(): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const config: Config = await this.dataService.loadConfig();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return config.wipLimit;
  }

  /**
   * Updates WIP limit configuration
   *
   * @param limit - New WIP limit value (must be 5-10 inclusive)
   * @throws {Error} If limit is outside valid range (5-10)
   * @throws {Error} If limit is not a number
   * @throws {Error} If unable to persist config to file
   *
   * @example
   * await wipLimitService.setWIPLimit(8);
   */
  async setWIPLimit(limit: number): Promise<void> {
    // Validate input is a number
    if (typeof limit !== 'number' || isNaN(limit)) {
      throw new Error('WIP limit must be a number');
    }

    // Validate limit is in valid range
    if (limit < 5 || limit > 10) {
      throw new Error('WIP limit must be between 5 and 10');
    }

    // Load current config
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const config: Config = await this.dataService.loadConfig();

    // Update WIP limit
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    config.wipLimit = limit;

    // Persist to file
    await this.dataService.saveConfig(config);
  }

  /**
   * Gets the count of currently active tasks
   *
   * @returns Count of active tasks
   * @throws {Error} If unable to query task count
   *
   * @example
   * const count = await wipLimitService.getCurrentWIPCount();
   * console.log(count); // 5
   */
  async getCurrentWIPCount(): Promise<number> {
    return await this.taskService.getActiveTaskCount();
  }

  /**
   * Checks if a new task can be added without exceeding WIP limit
   *
   * @returns True if current active task count is below WIP limit, false otherwise
   * @throws {Error} If unable to read config or query task count
   *
   * @example
   * const canAdd = await wipLimitService.canAddTask();
   * if (canAdd) {
   *   await taskService.createTask('New task');
   * }
   */
  async canAddTask(): Promise<boolean> {
    const currentCount = await this.getCurrentWIPCount();
    const limit = await this.getWIPLimit();
    return currentCount < limit;
  }

  /**
   * Generates encouraging message when WIP limit is reached
   *
   * @returns Helpful message including current active task count
   *
   * @example
   * const message = await wipLimitService.getWIPLimitMessage();
   * // "You have 7 active tasks - complete one before adding more to maintain focus!"
   */
  async getWIPLimitMessage(): Promise<string> {
    const count = await this.getCurrentWIPCount();
    return `You have ${count} active tasks - complete one before adding more to maintain focus!`;
  }
}
