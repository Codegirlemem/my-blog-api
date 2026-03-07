export default class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const duplicateError = (error: any, field: string) => {
  if (error.code === 11000) {
    if (error.keyPattern?.email) {
      const err = new AppError(`User already exist`, 400);

      return err;
    }
    if (error.keyPattern?.name) {
      const err = new AppError(`${field} already exist`, 400);

      return err;
    }
    if (error.keyPattern?.slug) {
      const err = new AppError(`Slug already exist`, 400);

      return err;
    }
  }
  return error;
};
