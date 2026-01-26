import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Async handler wrapper for Express routes
 * Wraps async route handlers to catch promise rejections and forward to error middleware
 *
 * @param fn - Async route handler function
 * @returns Express RequestHandler
 */
export const asyncHandler = <
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
  Locals extends Record<string, unknown> = Record<string, unknown>,
>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction
  ) => Promise<void>
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> => {
  return (req, res, next): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
