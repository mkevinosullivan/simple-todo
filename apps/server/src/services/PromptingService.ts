import { EventEmitter } from 'events';

import type { ProactivePrompt, Task } from '@simple-todo/shared/types';

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
      logger.info('Prompting scheduler stopped');
    }
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
   * @returns ProactivePrompt object with taskId, taskText, promptedAt, or null if no active tasks
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

    // Create prompt object
    const prompt: ProactivePrompt = {
      taskId: task.id,
      taskText: task.text,
      promptedAt: new Date().toISOString(),
    };

    // Track when prompt was generated
    this.lastPromptTime = new Date();

    logger.info('Prompt generated', {
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

    // Random selection for MVP
    const randomIndex = Math.floor(Math.random() * activeTasks.length);
    const selectedTask = activeTasks[randomIndex];

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
}
