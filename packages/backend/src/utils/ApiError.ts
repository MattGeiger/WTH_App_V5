export class ApiError extends Error {
  public isOperational: boolean;

  constructor(
    public statusCode: number,
    message: string,
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Custom error class for settings-related validation errors.
 * Inherits from ApiError with a fixed status code of 400.
 */
export class SettingsValidationError extends ApiError {
  constructor(message: string) {
    super(400, message);
  }
}

/**
 * Type guard to identify ApiError instances.
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
