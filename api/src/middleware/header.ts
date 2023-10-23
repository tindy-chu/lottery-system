import type { Request, Response, NextFunction } from 'express';

/**
 * This function sets necessary HTTP headers for implementing
 * Server-Sent Events. It makes the connection suitable for a
 * real-time, one-way stream from server to client.
 */
const sse = (req: Request, res: Response, next: NextFunction) => {
  // Set Content-Type to event stream for enabling SSE
  res.setHeader('Content-Type', 'text/event-stream');

  // Disable caching to ensure that events are sent in real-time
  res.setHeader('Cache-Control', 'no-cache');

  // Keep the connection alive for real-time updates
  res.setHeader('Connection', 'keep-alive');

  // Proceed to the next middleware or route handler
  next();
};

const headerMiddleware = { sse };
export default headerMiddleware;
