// ============================================
// ApiError — Custom error class for consistent error handling
// ============================================
// By extending Error, we can throw this anywhere in our code
// and catch it in the global error handler middleware.

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marks this as a "known" error, not a bug

    // Maintains proper stack trace in V8 engines
    Error.captureStackTrace(this, this.constructor);
  }

  // --- Convenience factory methods ---

  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, message);
  }
}
