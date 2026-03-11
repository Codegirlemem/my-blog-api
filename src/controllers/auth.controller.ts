import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { loginZodSchema, userZodSchema } from "../zod/user.zod.js";
import AppError from "../utils/appError.utils.js";
import { AuthPayload } from "../types/index.type.js";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const signupInfo = userZodSchema.parse(req.body);

    const newUser = new UserModel(signupInfo);

    await newUser.save();

    return res
      .status(201)
      .json({ success: true, message: "User created succesfully" });
  } catch (error: any) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const loginInfo = loginZodSchema.parse(req.body);

    const foundUser = await UserModel.findOne({
      email: loginInfo.email,
    }).select("+password");

    if (!foundUser) {
      return next(new AppError("Invalid credentials", 401));
    }

    const isValid = await foundUser.comparePassword(loginInfo.password);

    if (!isValid) {
      return next(new AppError("Invalid credentials", 401));
    }

    const payload: AuthPayload = {
      id: foundUser._id,
      role: foundUser.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    res.cookie(process.env.COOKIE_NAME!, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie(process.env.COOKIE_NAME!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
