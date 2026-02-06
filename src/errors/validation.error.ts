/**
 * Error thrown when input validation fails
 */
export class ValidationError extends Error {
  /**
   * The field that failed validation
   */
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Returns a formatted string representation of the error
   */
  public override toString(): string {
    const fieldMsg = this.field ? ` (field: ${this.field})` : '';
    return `${this.name}: ${this.message}${fieldMsg}`;
  }
}
