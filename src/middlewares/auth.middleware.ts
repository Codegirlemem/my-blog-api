import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.utils.js";
import { TRoles, TUserStatus } from "../types/index.type.js";
import { UserRequest } from "../types/express.js";
import { AuthPayload } from "../types/index.type.js";
import UserModel from "../models/user.model.js";

const { JsonWebTokenError, NotBeforeError, TokenExpiredError } = jwt;

export const isAuthenticated = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies[process.env.COOKIE_NAME!];

    if (!token) {
      return next(new AppError("Unauthenticated user. Login to continue", 401));
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as AuthPayload;

    const user = await UserModel.findById(decodedToken.id)
      .select("-password -__v")
      .lean();

    if (!user) {
      return next(new AppError("User does not exist", 401));
    }

    if (user.status === TUserStatus.Blocked) {
      return next(new AppError("Account blocked permanently", 403));
    }

    req.user = {
      ...user,
      iat: decodedToken.iat,
      exp: decodedToken.exp,
    };

    next();
  } catch (error: unknown) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError ||
      error instanceof NotBeforeError
    ) {
      return next(
        new AppError("Invalid or expired token. Please login again", 401),
      );
    }
    next(error);
  }
};

export const isAdmin = (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== TRoles.Admin) {
    return next(new AppError("Forbidden: Admin", 403));
  }

  next();
};

export const isNotRestricted = (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(new AppError("Unathenticated user: Login to continue", 401));
  }
  if (
    req.user.status === TUserStatus.Restricted &&
    req.user.restrictionExpires &&
    req.user.restrictionExpires > new Date()
  ) {
    return next(
      new AppError(
        `Account temporarily restricted from posting till ${req.user.restrictionExpires.toLocaleString()}`,
        403,
      ),
    );
  }

  next();
};
