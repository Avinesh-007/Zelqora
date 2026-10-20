import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error safely without exposing confidential parameters
  console.error(`[Error] [${req.method} ${req.path}]:`, message);

  res.status(status).json({
    error: status >= 500 ? 'Internal Server Error' : 'Request Failed',
    message: status >= 500 && ENV.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.' 
      : message
  });
}
