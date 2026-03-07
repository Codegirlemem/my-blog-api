import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.utils.js";
import { ZodError, z } from "zod";
import multer from "multer";

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

  if (err.code === 11000 && err.keyPattern?.email) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }
  if (err.name === "ValidationError") {
    // Extract just the messages
    const messages = Object.values(err.errors).map((err: any) => {
      const path = err.path;
      const name = err.name;
      if (err.name === "CastError") {
        return `Invalid input type for field ${err.path}`;
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
