import { Router, type Request, type Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * Returns server status and current timestamp
 *
 * @route GET /api/health
 * @returns {object} 200 - Server health status
 * @returns {string} status - Always "ok" when server is running
 * @returns {string} timestamp - Current server time in ISO8601 format
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
