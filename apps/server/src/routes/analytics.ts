import { Router } from 'express';

import { AnalyticsService } from '../services/AnalyticsService.js';
import { DataService } from '../services/DataService.js';
import { TaskService } from '../services/TaskService.js';

const router = Router();

// Initialize services (use DATA_DIR environment variable if set, for testing)
const dataService = new DataService(process.env.DATA_DIR);
const taskService = new TaskService(dataService);
const analyticsService = new AnalyticsService(taskService, dataService);

/**
 * GET /api/analytics
 * Get task statistics
 *
 * Returns task count breakdown by status (active and completed).
 *
 * @returns {Object} Task statistics
 * @returns {number} completedCount - Number of completed tasks
 * @returns {number} activeCount - Number of active tasks
 *
 * @example
 * GET /api/analytics
 * Response: { "completedCount": 5, "activeCount": 3 }
 */
router.get('/', (req, res) => {
  void (async () => {
    try {
      const stats = await analyticsService.getTaskCountByStatus();

      res.status(200).json({
        completedCount: stats.completed,
        activeCount: stats.active,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  })();
});

/**
 * GET /api/analytics/prompts
 * Get prompt response analytics
 *
 * Returns aggregated statistics about prompt responses including response rate,
 * breakdown by type, and average response time.
 *
 * @returns {Object} Prompt analytics
 * @returns {number} promptResponseRate - Percentage of prompts with user engagement (0-100)
 * @returns {Object} responseBreakdown - Counts by response type (complete, dismiss, snooze, timeout)
 * @returns {number} averageResponseTime - Average response time in milliseconds
 *
 * @example
 * GET /api/analytics/prompts
 * Response: {
 *   "promptResponseRate": 45.2,
 *   "responseBreakdown": { "complete": 12, "dismiss": 5, "snooze": 3, "timeout": 10 },
 *   "averageResponseTime": 5420
 * }
 */
router.get('/prompts', (req, res) => {
  void (async () => {
    try {
      const [promptResponseRate, responseBreakdown, averageResponseTime] = await Promise.all([
        analyticsService.getPromptResponseRate(),
        analyticsService.getPromptResponseBreakdown(),
        analyticsService.getAverageResponseTime(),
      ]);

      res.status(200).json({
        promptResponseRate,
        responseBreakdown,
        averageResponseTime,
      });
    } catch (error) {
      console.error('Error fetching prompt analytics:', error);
      res.status(500).json({ error: 'Failed to retrieve prompt analytics' });
    }
  })();
});

export default router;
