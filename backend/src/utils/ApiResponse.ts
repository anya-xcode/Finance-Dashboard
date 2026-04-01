// ============================================
// ApiResponse — Standardized JSON response format
// ============================================
// Every API response follows the same shape so the frontend
// always knows what to expect.

export class ApiResponse<T> {
  public success: boolean;
  public message: string;
  public data: T | null;

  constructor(success: boolean, message: string, data: T | null = null) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  // --- Convenience factory methods ---

  /** Successful response with data */
  static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  /** Successful response without data (e.g., delete operations) */
  static ok(message: string = 'Success'): ApiResponse<null> {
    return new ApiResponse(true, message, null);
  }

  /** Error response */
  static error(message: string): ApiResponse<null> {
    return new ApiResponse(false, message, null);
  }
}
