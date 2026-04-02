// ============================================
// Error Handler — Global error handling middleware
// ============================================
// Catches all errors thrown anywhere in the app and
// returns a consistent JSON error response.

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // If it's our custom ApiError, use its status code
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      data: err.message,
    });
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      data: null,
    });
    return;
  }

  // Handle duplicate key errors (MongoDB error code 11000)
  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Duplicate entry. This resource already exists.',
      data: null,
    });
    return;
  }

  // Unknown error — log it and return generic 500
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    data: null,
  });
};
