export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors?: string[];

  constructor(message: string, statusCode: number, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    if (errors) this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}