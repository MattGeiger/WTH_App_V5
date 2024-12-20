import { ApiError } from './ApiError';
import { ErrorTypes } from './errorConstants';
import { Prisma } from '@prisma/client';

export const handleServiceError = (error: unknown, defaultMessage: string): never => {
  console.error('Service Error:', error);

  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    switch (error.code) {
      case 'P2002':
        throw new ApiError(ErrorTypes.VALIDATION, 'Unique constraint failed');
      case 'P2003':
        throw new ApiError(ErrorTypes.VALIDATION, 'Foreign key constraint failed');
      case 'P2025':
        throw new ApiError(ErrorTypes.NOT_FOUND, 'Record not found');
      default:
        throw new ApiError(ErrorTypes.INTERNAL, defaultMessage);
    }
  }

  throw new ApiError(ErrorTypes.INTERNAL, defaultMessage);
};