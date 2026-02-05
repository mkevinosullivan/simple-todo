import type { CelebrationMessage } from '@simple-todo/shared/types';

import type { TaskService } from './TaskService.js';

/**
 * CelebrationService - Generates varied celebration messages with rotation
 * to minimize repetition and provide positive reinforcement for task completion.
 */
export class CelebrationService {
  private readonly messagePool: ReadonlyArray<CelebrationMessage>;
  private recentMessages: string[] = [];
  private readonly maxRecentMessages = 5;

  constructor(private readonly taskService?: TaskService) {
    // Initialize message pool with 10+ messages covering all 4 variants
    this.messagePool = [
      // Enthusiastic (3 messages)
      {
        message: 'Amazing! You crushed it! 🎉',
        variant: 'enthusiastic',
      },
      {
        message: 'Boom! Another one bites the dust! ✨',
        variant: 'enthusiastic',
      },
      {
        message: 'Crushed it! Keep going! 🚀',
        variant: 'enthusiastic',
      },
      // Supportive (4 messages)
      {
        message: "One more done! You're making progress.",
        variant: 'supportive',
      },
      {
        message: "Great work! That's progress!",
        variant: 'supportive',
      },
      {
        message: 'Task complete! Nice job staying focused.',
        variant: 'supportive',
      },
      {
        message: "Progress made! You're doing great.",
        variant: 'supportive',
      },
      // Motivational (3 messages)
      {
        message: 'Task completed! Keep the momentum going!',
        variant: 'motivational',
      },
      {
        message: "Well done! You're on a roll!",
        variant: 'motivational',
      },
      {
        message: "Excellent! You're building momentum!",
        variant: 'motivational',
      },
      // Data-driven (1 message - will be dynamically populated)
      {
        message: "Task completed! That's [N] this week!",
        variant: 'data-driven',
      },
    ];
  }

  /**
   * Generates a random celebration message with variant for display styling.
   * Avoids showing the same message twice in a row by tracking recent selections.
   *
   * @param taskId - Optional task ID for data-driven message personalization
   * @returns CelebrationMessage with message text, variant, and optional duration
   *
   * @example
   * const celebration = await celebrationService.getCelebrationMessage();
   * console.log(celebration.message); // "Amazing! You crushed it! 🎉"
   * console.log(celebration.variant); // "enthusiastic"
   */
  async getCelebrationMessage(_taskId?: string): Promise<CelebrationMessage> {
    // Filter out recently used messages to avoid repetition
    const availableMessages = this.messagePool.filter(
      (msg) => !this.recentMessages.includes(msg.message),
    );

    // Handle edge case: if all messages are recent (pool < maxRecentMessages)
    // Reset recent messages to allow selection
    const messagesToChooseFrom =
      availableMessages.length > 0 ? availableMessages : this.messagePool;

    // Select random message from available pool
    const randomIndex = Math.floor(Math.random() * messagesToChooseFrom.length);
    const selectedMessage = messagesToChooseFrom[randomIndex];

    // Create a copy to avoid mutating the pool
    let finalMessage: CelebrationMessage = { ...selectedMessage };

    // Handle data-driven messages with dynamic task count
    if (selectedMessage.variant === 'data-driven') {
      finalMessage = await this.generateDataDrivenMessage(selectedMessage);
    }

    // Update recent messages tracking
    this.recentMessages.push(selectedMessage.message);
    if (this.recentMessages.length > this.maxRecentMessages) {
      this.recentMessages.shift(); // Remove oldest message
    }

    return finalMessage;
  }

  /**
   * Generates a data-driven message with actual task count
   * @private
   */
  private async generateDataDrivenMessage(
    template: CelebrationMessage,
  ): Promise<CelebrationMessage> {
    try {
      if (!this.taskService) {
        // Graceful degradation if TaskService unavailable
        return {
          ...template,
          message: 'Task completed! Great progress!',
        };
      }

      // Get completed task count for current week
      const count = await this.getCompletedTasksThisWeek();

      // Replace [N] placeholder with actual count
      const message = template.message.replace('[N]', count.toString());

      return {
        ...template,
        message,
      };
    } catch (error) {
      // Graceful degradation on error
      return {
        ...template,
        message: 'Task completed! Great progress!',
      };
    }
  }

  /**
   * Counts completed tasks in the current week
   * @private
   */
  private async getCompletedTasksThisWeek(): Promise<number> {
    if (!this.taskService) {
      return 0;
    }

    // Get start of current week (Sunday at 00:00:00)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all tasks and filter for completed tasks this week
    const allTasks = await this.taskService.getAllTasks();
    const completedThisWeek = allTasks.filter((task) => {
      if (task.status !== 'completed' || !task.completedAt) {
        return false;
      }
      const completedDate = new Date(task.completedAt);
      return completedDate >= startOfWeek;
    });

    return completedThisWeek.length;
  }
}
