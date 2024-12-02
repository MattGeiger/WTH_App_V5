export class ApiError extends Error {
    constructor(
      public statusCode: number,
      message: string,
      public isOperational = true,
      stack = ''
    ) {
      super(message);
      this.statusCode = statusCode;
      
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export const isApiError = (error: unknown): error is ApiError => {
    return error instanceof ApiError;
  };