import { Request, Response, NextFunction } from 'express';
import { ApiError, isApiError } from '../utils/ApiError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isApiError(err)) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.statusCode,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    success: false,
    status: 500,
    message: 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};