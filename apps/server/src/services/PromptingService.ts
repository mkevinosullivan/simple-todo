import { EventEmitter } from 'events';

import type { PromptEvent, PromptResponse, ProactivePrompt, Task } from '@simple-todo/shared/types';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../utils/logger.js';

import type { DataService } from './DataService.js';
import type { TaskService } from './TaskService.js';

/**
 * PromptingService - Manages scheduling and selection of task prompts
 *
 * This service handles proactive prompting of tasks at configured intervals.
 * It selects active tasks randomly and generates prompts for user engagement.
 * Extends EventEmitter to broadcast prompts via SSE.
 *
 * @example
 * const promptingService = new PromptingService(taskService, dataService);
 * await promptingService.startScheduler();
 * promptingService.on('prompt', (prompt) => console.log(prompt));
 */
export class PromptingService extends EventEmitter {
  private readonly taskService: TaskService;
  private readonly dataService: DataService;
  private scheduler: NodeJS.Timeout | null = null;
  private lastPromptTime: Date | null = null;
  private snoozedPrompts: Map<string, NodeJS.Timeout> = new Map();
  private recentlyPromptedTasks: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private pendingPrompts: Map<string, { promptEvent: PromptEvent; timeoutId: NodeJS.Timeout }> =
    new Map();

  constructor(taskService: TaskService, dataService: DataService) {
    super();
    this.taskService = taskService;
    this.dataService = dataService;
  }

  /**
   * Starts the prompting scheduler
   *
   * Loads configuration and starts interval-based prompting if enabled.
   * Uses configured frequency with random offset to achieve variability.
   *
   * @throws {Error} If configuration cannot be loaded
   *
   * @example
   * await promptingService.startScheduler();
   * // Scheduler runs in background at configured intervals
   */
  async startScheduler(): Promise<void> {
    const config = await this.loadPromptingConfig();

    // Don't start scheduler if prompting is disabled
    if (!config.enabled) {
      logger.info('Prompting is disabled, scheduler will not start');
      return;
    }

    // Calculate interval with random offset (±15 minutes for variability)
    const baseHours = config.frequencyHours;
    const randomOffsetMinutes = (Math.random() - 0.5) * 30; // -15 to +15 minutes
    const totalHours = baseHours + randomOffsetMinutes / 60;
    const intervalMs = totalHours * 60 * 60 * 1000;

    // Start scheduler using setInterval
    this.scheduler = setInterval(() => {
      void this.onScheduledPrompt();
    }, intervalMs);

    // Start cleanup interval for recently prompted tasks (runs every hour)
    this.cleanupInterval = setInterval(() => {
      this.cleanupRecentlyPromptedTasks();
    }, 60 * 60 * 1000); // 1 hour

    logger.info('Prompting scheduler started', {
      frequencyHours: config.frequencyHours,
      intervalMs,
    });
  }

  /**
   * Stops the prompting scheduler
   *
   * Clears the interval timer and resets scheduler state.
   * Should be called during graceful shutdown.
   *
   * @example
   * promptingService.stopScheduler();
   */
  stopScheduler(): void {
    if (this.scheduler) {
      clearInterval(this.scheduler);
      this.scheduler = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Clear all snoozed prompts
    for (const timeout of this.snoozedPrompts.values()) {
      clearTimeout(timeout);
    }
    this.snoozedPrompts.clear();

    // Clear all pending prompt timeouts
    for (const pending of this.pendingPrompts.values()) {
      clearTimeout(pending.timeoutId);
    }
    this.pendingPrompts.clear();

    logger.info('Prompting scheduler stopped');
  }

  /**
   * Handles scheduled prompt event
   *
   * Called by the interval timer to generate and emit prompts.
   * Skips if no active tasks available or minimum interval not reached.
   */
  private async onScheduledPrompt(): Promise<void> {
    // Load config to get frequency for interval validation
    const config = await this.loadPromptingConfig();

    // Check if minimum interval has elapsed since last prompt
    if (this.lastPromptTime) {
      const elapsedMs = Date.now() - this.lastPromptTime.getTime();
      const minIntervalMs = config.frequencyHours * 0.9 * 60 * 60 * 1000; // 90% of configured frequency

      if (elapsedMs < minIntervalMs) {
        logger.info('Skipping prompt - minimum interval not reached', {
          elapsedMs,
          minIntervalMs,
        });
        return;
      }
    }

    // Check if active tasks exist
    const activeTaskCount = await this.taskService.getActiveTaskCount();

    if (activeTaskCount === 0) {
      logger.info('No active tasks, skipping scheduled prompt');
      return;
    }

    // Generate prompt
    const prompt = await this.generatePrompt();

    if (prompt === null) {
      logger.warn('Failed to generate scheduled prompt');
      return;
    }

    // Log the prompt
    logger.info('Scheduled prompt triggered', { prompt });

    // Emit prompt event for SSE broadcasting (Story 4.2)
    this.emit('prompt', prompt);
  }

  /**
   * Generates a proactive prompt for a randomly selected active task
   *
   * @returns ProactivePrompt object with promptId, taskId, taskText, promptedAt, or null if no active tasks
   * @throws {Error} If task selection or prompt generation fails
   *
   * @example
   * const prompt = await promptingService.generatePrompt();
   * if (prompt) {
   *   console.log(`Prompt: ${prompt.taskText} at ${prompt.promptedAt}`);
   * }
   */
  async generatePrompt(): Promise<ProactivePrompt | null> {
    const task = await this.selectTaskForPrompt();

    // No active tasks available
    if (task === null) {
      return null;
    }

    // Generate unique prompt ID
    const promptId = uuidv4();
    const promptedAt = new Date().toISOString();

    // Create prompt object
    const prompt: ProactivePrompt = {
      promptId,
      taskId: task.id,
      taskText: task.text,
      promptedAt,
    };

    // Create PromptEvent for tracking (initially without response)
    const promptEvent: PromptEvent = {
      promptId,
      taskId: task.id,
      promptedAt,
      response: 'timeout', // Will be updated if user responds
      respondedAt: null,
    };

    // Schedule timeout to mark as 'timeout' after 30 seconds
    const timeoutId = setTimeout(() => {
      void this.recordPromptTimeout(promptId);
    }, 30000); // 30 seconds

    // Store pending prompt for response tracking
    this.pendingPrompts.set(promptId, { promptEvent, timeoutId });

    // Track when prompt was generated
    this.lastPromptTime = new Date();

    // Add task to recently prompted list (24-hour cooldown)
    this.recentlyPromptedTasks.set(task.id, Date.now());

    logger.info('Prompt generated', {
      promptId,
      taskId: prompt.taskId,
      promptedAt: prompt.promptedAt,
    });

    return prompt;
  }

  /**
   * Selects one active task for prompting using random selection
   *
   * Uses random selection algorithm for MVP. Future versions will support
   * priority-based and age-based selection algorithms.
   *
   * @returns Randomly selected active task, or null if no active tasks available
   *
   * @example
   * const task = await promptingService.selectTaskForPrompt();
   * if (task) {
   *   console.log(`Selected: ${task.text}`);
   * }
   */
  async selectTaskForPrompt(): Promise<Task | null> {
    const activeTasks = await this.taskService.getAllTasks('active');

    // Return null if no active tasks (scheduler pauses when task list empty)
    if (activeTasks.length === 0) {
      logger.info('No active tasks available for prompting');
      return null;
    }

    // Filter out tasks prompted within last 24 hours (24-hour cooldown)
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const eligibleTasks = activeTasks.filter((task) => {
      const lastPromptTime = this.recentlyPromptedTasks.get(task.id);
      if (lastPromptTime === undefined) {
        return true; // Never prompted before
      }
      return now - lastPromptTime > twentyFourHoursMs;
    });

    // Return null if no eligible tasks
    if (eligibleTasks.length === 0) {
      logger.info('No eligible tasks for prompting (all recently prompted)');
      return null;
    }

    // Random selection for MVP
    const randomIndex = Math.floor(Math.random() * eligibleTasks.length);
    const selectedTask = eligibleTasks[randomIndex];

    logger.info('Task selected for prompt', {
      taskId: selectedTask.id,
      taskText: selectedTask.text,
    });

    return selectedTask;
  }

  /**
   * Loads prompting configuration from config.json
   *
   * @returns Configuration object with enabled status and frequency in hours
   * @throws {Error} If config cannot be loaded
   *
   * @example
   * const config = await promptingService.loadPromptingConfig();
   * // Returns: { enabled: true, frequencyHours: 2.5 }
   */
  private async loadPromptingConfig(): Promise<{ enabled: boolean; frequencyHours: number }> {
    try {
      const config = await this.dataService.loadConfig();
      return {
        enabled: config.promptingEnabled,
        frequencyHours: config.promptingFrequencyHours,
      };
    } catch (err: unknown) {
      logger.error('Failed to load prompting configuration', { error: err });
      throw new Error('Failed to load prompting configuration');
    }
  }

  /**
   * Snoozes a prompt for a specific task, rescheduling it for 1 hour later
   *
   * @param taskId - The task ID to snooze
   * @throws {Error} If task doesn't exist
   *
   * @example
   * await promptingService.snoozePrompt('123e4567-e89b-12d3-a456-426614174000');
   */
  async snoozePrompt(taskId: string): Promise<void> {
    // Validate task exists
    const task = await this.taskService.getTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Cancel existing snooze for this task if exists
    const existingTimeout = this.snoozedPrompts.get(taskId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      logger.info('Cancelled existing snooze for task', { taskId });
    }

    // Schedule prompt for 1 hour from now
    const snoozeDelayMs = 60 * 60 * 1000; // 1 hour
    const timeout = setTimeout(() => {
      void this.onSnoozedPrompt(taskId);
    }, snoozeDelayMs);

    // Store timeout for cancellation
    this.snoozedPrompts.set(taskId, timeout);

    logger.info('Prompt snoozed for 1 hour', { taskId });
  }

  /**
   * Handles snoozed prompt event
   *
   * Called when a snoozed prompt timer fires.
   * Validates task still exists and is active before generating prompt.
   */
  private async onSnoozedPrompt(taskId: string): Promise<void> {
    // Remove from snoozed prompts map
    this.snoozedPrompts.delete(taskId);

    // Validate task still exists and is active
    const task = await this.taskService.getTaskById(taskId);
    if (!task) {
      logger.info('Snoozed task no longer exists, skipping prompt', { taskId });
      return;
    }

    if (task.status !== 'active') {
      logger.info('Snoozed task is no longer active, skipping prompt', { taskId });
      return;
    }

    // Generate unique prompt ID
    const promptId = uuidv4();
    const promptedAt = new Date().toISOString();

    // Generate prompt for specific task
    const prompt: ProactivePrompt = {
      promptId,
      taskId: task.id,
      taskText: task.text,
      promptedAt,
    };

    // Create PromptEvent for tracking
    const promptEvent: PromptEvent = {
      promptId,
      taskId: task.id,
      promptedAt,
      response: 'timeout',
      respondedAt: null,
    };

    // Schedule timeout to mark as 'timeout' after 30 seconds
    const timeoutId = setTimeout(() => {
      void this.recordPromptTimeout(promptId);
    }, 30000);

    // Store pending prompt for response tracking
    this.pendingPrompts.set(promptId, { promptEvent, timeoutId });

    // Track when prompt was generated
    this.lastPromptTime = new Date();

    // Add task to recently prompted list (24-hour cooldown)
    this.recentlyPromptedTasks.set(task.id, Date.now());

    logger.info('Snoozed prompt triggered', { prompt });

    // Emit prompt event for SSE broadcasting
    this.emit('prompt', prompt);
  }

  /**
   * Records a prompt response event for analytics
   *
   * Updates the prompt event with the user's response and persists to storage.
   * Cancels the timeout timer for this prompt.
   *
   * @param promptId - The unique prompt ID to record response for
   * @param response - The user's response type ('complete' | 'dismiss' | 'snooze')
   * @throws {Error} If prompt ID not found or persistence fails
   *
   * @example
   * await promptingService.recordPromptResponse('123e4567-e89b-12d3-a456-426614174000', 'complete');
   */
  async recordPromptResponse(promptId: string, response: PromptResponse): Promise<void> {
    try {
      // Find pending prompt
      const pending = this.pendingPrompts.get(promptId);
      if (!pending) {
        logger.warn('Prompt ID not found in pending prompts', { promptId, response });
        // Don't throw - this could be a late response after timeout
        return;
      }

      // Cancel timeout timer
      clearTimeout(pending.timeoutId);

      // Update prompt event with response
      pending.promptEvent.response = response;
      pending.promptEvent.respondedAt = new Date().toISOString();

      // Remove from pending prompts
      this.pendingPrompts.delete(promptId);

      // Load existing prompt events
      const events = await this.dataService.loadPromptEvents();

      // Append completed event
      events.push(pending.promptEvent);

      // Save updated events
      await this.dataService.savePromptEvents(events);

      logger.info('Prompt response recorded', {
        promptId,
        response,
        respondedAt: pending.promptEvent.respondedAt,
      });
    } catch (err: unknown) {
      logger.error('Failed to record prompt response', { error: err, promptId, response });
      throw new Error('Failed to record prompt response');
    }
  }

  /**
   * Records a prompt timeout event for analytics
   *
   * Called when the 30-second timeout expires without user response.
   * Saves the prompt event with 'timeout' response and null respondedAt.
   *
   * @param promptId - The unique prompt ID that timed out
   *
   * @example
   * await promptingService.recordPromptTimeout('123e4567-e89b-12d3-a456-426614174000');
   */
  private async recordPromptTimeout(promptId: string): Promise<void> {
    try {
      // Find pending prompt
      const pending = this.pendingPrompts.get(promptId);
      if (!pending) {
        // Already handled (user responded before timeout)
        return;
      }

      // Remove from pending prompts
      this.pendingPrompts.delete(promptId);

      // Event already has response: 'timeout' and respondedAt: null from initialization
      // Load existing prompt events
      const events = await this.dataService.loadPromptEvents();

      // Append timeout event
      events.push(pending.promptEvent);

      // Save updated events
      await this.dataService.savePromptEvents(events);

      logger.info('Prompt timeout recorded', {
        promptId,
        taskId: pending.promptEvent.taskId,
      });
    } catch (err: unknown) {
      logger.error('Failed to record prompt timeout', { error: err, promptId });
      // Don't throw - timeout is background operation
    }
  }

  /**
   * Logs a prompt response event for analytics (DEPRECATED - use recordPromptResponse)
   *
   * @deprecated Use recordPromptResponse(promptId, response) instead
   * @param taskId - The task ID that was prompted
   * @param response - The user's response type
   *
   * @example
   * await promptingService.logPromptResponse('123e4567-e89b-12d3-a456-426614174000', 'complete');
   */
  async logPromptResponse(taskId: string, response: PromptResponse): Promise<void> {
    try {
      // Find the most recent pending prompt for this task
      let matchingPromptId: string | null = null;
      for (const [promptId, pending] of this.pendingPrompts.entries()) {
        if (pending.promptEvent.taskId === taskId) {
          matchingPromptId = promptId;
          break; // Use first match (should only be one active prompt per task)
        }
      }

      if (matchingPromptId) {
        // Use new recordPromptResponse method
        await this.recordPromptResponse(matchingPromptId, response);
      } else {
        // Fallback: create orphan event (for backward compatibility)
        const events = await this.dataService.loadPromptEvents();
        const event: PromptEvent = {
          promptId: uuidv4(),
          taskId,
          promptedAt: new Date().toISOString(),
          response,
          respondedAt: new Date().toISOString(),
        };
        events.push(event);
        await this.dataService.savePromptEvents(events);

        logger.warn('Created orphan prompt event (no matching pending prompt)', {
          taskId,
          response,
        });
      }
    } catch (err: unknown) {
      logger.error('Failed to log prompt response', { error: err, taskId, response });
      throw new Error('Failed to log prompt response');
    }
  }

  /**
   * Cleans up recently prompted tasks older than 24 hours
   *
   * Called periodically by cleanup interval to prevent memory growth.
   */
  private cleanupRecentlyPromptedTasks(): void {
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    let removedCount = 0;

    for (const [taskId, timestamp] of this.recentlyPromptedTasks.entries()) {
      if (now - timestamp > twentyFourHoursMs) {
        this.recentlyPromptedTasks.delete(taskId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.info('Cleaned up recently prompted tasks', { removedCount });
    }
  }

  /**
   * Cancels a snoozed prompt for a specific task
   *
   * Used when tasks are completed or deleted to prevent prompts for non-existent tasks.
   *
   * @param taskId - The task ID to cancel snooze for
   *
   * @example
   * promptingService.cancelSnooze('123e4567-e89b-12d3-a456-426614174000');
   */
  cancelSnooze(taskId: string): void {
    const timeout = this.snoozedPrompts.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.snoozedPrompts.delete(taskId);
      logger.info('Snoozed prompt cancelled', { taskId });
    }
  }

  /**
   * Updates prompting configuration and restarts scheduler
   *
   * Stops current scheduler, updates config, and restarts scheduler if enabled.
   * Frequency changes apply to next scheduled prompt.
   *
   * @param dto - Configuration update object
   * @param dto.enabled - Whether prompting is enabled
   * @param dto.frequencyHours - Prompting frequency in hours (1-6)
   * @throws {Error} If configuration cannot be saved
   *
   * @example
   * await promptingService.updatePromptingConfig({ enabled: true, frequencyHours: 3 });
   */
  async updatePromptingConfig(dto: {
    enabled: boolean;
    frequencyHours: number;
  }): Promise<void> {
    try {
      // Stop current scheduler if running
      this.stopScheduler();

      // Load current config
      const config = await this.dataService.loadConfig();

      // Update prompting fields
      config.promptingEnabled = dto.enabled;
      config.promptingFrequencyHours = dto.frequencyHours;

      // Persist updated config
      await this.dataService.saveConfig(config);

      logger.info('Prompting configuration updated', {
        enabled: dto.enabled,
        frequencyHours: dto.frequencyHours,
      });

      // Restart scheduler if enabled
      if (dto.enabled) {
        await this.startScheduler();
      }
    } catch (err: unknown) {
      logger.error('Failed to update prompting configuration', { error: err });
      throw new Error('Failed to update prompting configuration');
    }
  }

  /**
   * Triggers an immediate prompt for testing purposes
   *
   * Generates a prompt immediately without affecting regular scheduling.
   * Emits SSE event to connected clients.
   *
   * @returns ProactivePrompt object or null if no active tasks
   *
   * @example
   * const prompt = await promptingService.triggerImmediatePrompt();
   * if (prompt) {
   *   console.log('Test prompt generated:', prompt);
   * }
   */
  async triggerImmediatePrompt(): Promise<ProactivePrompt | null> {
    const prompt = await this.generatePrompt();

    if (prompt === null) {
      logger.info('No active tasks available for immediate prompt');
      return null;
    }

    // Emit prompt event for SSE broadcasting
    this.emit('prompt', prompt);

    logger.info('Immediate test prompt triggered', { prompt });
    return prompt;
  }

  /**
   * Gets estimated time of next scheduled prompt
   *
   * Returns rough estimate (±15 min due to randomness) based on last prompt time
   * and configured frequency. Returns null if prompting disabled or never prompted.
   *
   * @returns Date of next prompt or null if disabled/never prompted
   *
   * @example
   * const nextTime = await promptingService.getNextPromptTime();
   * if (nextTime) {
   *   console.log('Next prompt at:', nextTime.toISOString());
   * }
   */
  async getNextPromptTime(): Promise<Date | null> {
    // Load config to check if prompting enabled
    const config = await this.loadPromptingConfig();

    if (!config.enabled) {
      return null;
    }

    // Return null if never prompted before
    if (this.lastPromptTime === null) {
      return null;
    }

    // Calculate next prompt time (last prompt + frequency)
    const nextPromptMs =
      this.lastPromptTime.getTime() + config.frequencyHours * 60 * 60 * 1000;
    return new Date(nextPromptMs);
  }
}
