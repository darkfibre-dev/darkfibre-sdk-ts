/**
 * Error thrown when transaction signing fails
 */
export class SigningError extends Error {
  /**
   * The underlying error that caused the signing failure, if any
   */
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'SigningError';
    this.cause = cause;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SigningError);
    }
  }

  /**
   * Returns a formatted string representation of the error
   */
  public override toString(): string {
    const causeMsg = this.cause ? ` | Caused by: ${this.cause.message}` : '';
    return `${this.name}: ${this.message}${causeMsg}`;
  }
}
