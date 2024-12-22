import { ApiError } from './ApiError';
import { ErrorTypes } from './errorConstants';
import { Prisma } from '@prisma/client';

export const handleServiceError = (error: unknown, defaultMessage: string): never => {
  console.error('Service Error:', error);

  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ApiError(400, 'This entry already exists');
      case 'P2003':
        throw new ApiError(400, 'Invalid reference. Please check your inputs.');
      case 'P2025':
        throw new ApiError(404, 'Item not found');
      default:
        console.error('Prisma error:', error);
        throw new ApiError(400, defaultMessage);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error('Validation error:', error);
    throw new ApiError(400, 'Invalid input data');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error('Database initialization error:', error);
    throw new ApiError(500, 'Database connection error');
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error);
    throw new ApiError(400, error.message || defaultMessage);
  }

  throw new ApiError(500, defaultMessage);
};
