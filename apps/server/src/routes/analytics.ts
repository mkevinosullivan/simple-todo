import { Router } from 'express';

import { AnalyticsService } from '../services/AnalyticsService.js';
import { DataService } from '../services/DataService.js';
import { TaskService } from '../services/TaskService.js';

const router = Router();

// Initialize services (use DATA_DIR environment variable if set, for testing)
const dataService = new DataService(process.env.DATA_DIR);
const taskService = new TaskService(dataService);
const analyticsService = new AnalyticsService(taskService);

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

export default router;
