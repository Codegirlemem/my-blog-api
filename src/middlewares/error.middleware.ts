import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ZodError, z } from "zod";
import multer from "multer";
import AppError from "../utils/appError.utils.js";
import { CapitalizeFirstLetter } from "../utils/index.utils.js";

const { JsonWebTokenError, NotBeforeError, TokenExpiredError } = jwt;

const globalErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: z.flattenError(err),
    });
  }

  if (
    err instanceof JsonWebTokenError ||
    err instanceof TokenExpiredError ||
    err instanceof NotBeforeError
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File size must not exceed 5MB",
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Only one file upload allowed",
        });

      default:
        return res.status(400).json({
          success: false,
          message: "File upload error",
        });
    }
  }

  if (err.code === 11000) {
    const field = Object.values(err.keyValue)[0] as string;

    return res.status(400).json({
      success: false,
      message: `${CapitalizeFirstLetter(field)} already exists`,
    });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((err: any) => {
      const path = err.path;
      const name = err.name;

      if (name === "CastError") {
        return `Invalid input type for field ${path}`;
      }
      return err.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
  }

  return res.status(500).json({
    success: false,
    message: isDev ? err.message : "Something went wrong!",
  });
};

export default globalErrorMiddleware;
