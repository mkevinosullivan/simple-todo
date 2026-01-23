import app from './app.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/api/health`);
});
