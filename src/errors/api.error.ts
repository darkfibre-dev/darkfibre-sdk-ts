/**
 * Error thrown when API requests fail
 */
export class APIError extends Error {
  /**
   * Error code from the API
   */
  public readonly code: string;

  /**
   * HTTP status code
   */
  public readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  /**
   * Returns a formatted string representation of the error
   */
  public override toString(): string {
    return `${this.name} [${this.code}] (${this.status}): ${this.message}`;
  }
}
