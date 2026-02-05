import app from './app.js';
import { DataService } from './services/DataService.js';
import { PromptingService } from './services/PromptingService.js';
import { TaskService } from './services/TaskService.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3001;

// Initialize services for prompting
const dataService = new DataService(process.env.DATA_DIR);
const taskService = new TaskService(dataService);
const promptingService = new PromptingService(taskService, dataService);

// Start the server
const server = app.listen(PORT, async () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/api/health`);

  // Start the prompting scheduler
  try {
    await promptingService.startScheduler();
  } catch (err: unknown) {
    logger.error('Failed to start prompting scheduler', { error: err });
  }
});

// Graceful shutdown handlers
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} signal received: closing HTTP server`);

  // Stop the prompting scheduler
  promptingService.stopScheduler();

  // Close the server
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
