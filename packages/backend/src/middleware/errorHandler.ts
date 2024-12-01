import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode} - ${message}`);
  
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: statusCode === 500 ? 'Internal Server Error' : message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};