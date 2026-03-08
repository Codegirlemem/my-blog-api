import fs from "fs/promises";
import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import UserModel from "../models/user.model.js";
import {
  objectIdSchema,
  updateUserByAdminSchema,
  updateUserSchema,
  usernameInputSchema,
} from "../zod/user.zod.js";
import AppError from "../utils/appError.utils.js";
import {
  deleteCloudImage,
  restrictionDays,
  uploadToCloudinary,
} from "../utils/index.utils.js";
import { TAvatarImage, TUserStatus } from "../types/index.type.js";

export const getAllUsers = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await UserModel.find()
      .select("-__v -restrictionExpires")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Access denied", 401));

    const id = req.params.id
      ? objectIdSchema.parse(req.params.id)
      : req.user._id;

    const isSelf = req.user._id.toString() === id.toString();

    let user;

    if (!isSelf) {
      return next(new AppError("This is a private account", 403));
    } else {
      user = await UserModel.findById(id)
        .select("-__v")
        .populate({
          path: "posts",
          options: { sort: { createdAt: -1 } },
        })
        .lean();
    }

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicProfile = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const username = usernameInputSchema.parse(req.params.username);

    const user = await UserModel.findOne({ username })
      .select("username avatar fullname createdAt")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
      });

    if (!user) return next(new AppError("User not found", 404));

    return res.status(200).json({
      success: true,
      message: "Profile with posts retrieved succefully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Access denied", 401));

    const _id = objectIdSchema.parse(req.user._id);
    const updates = updateUserSchema.parse(req.body);

    const user = await UserModel.findByIdAndUpdate(_id, updates, {
      runValidators: true,
      returnDocument: "after",
    })
      .select(" -__v -restrictionExpires")
      .lean();

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  let avatar: TAvatarImage | undefined;

  try {
    if (!req.user) return next(new AppError("Access denied", 401));

    const _id = objectIdSchema.parse(req.user._id);
    const avatarPath = req.file?.path;

    let user = await UserModel.findById(_id).select(
      "-password -__v -restrictionExpires",
    );

    if (!user) {
      avatarPath && (await fs.unlink(avatarPath));

      return next(new AppError("User not found", 404));
    }

    const previousAvatar = user.avatar?.public_id;

    if (avatarPath) {
      avatar = await uploadToCloudinary(avatarPath);
    }

    if (avatar) {
      user.set({ avatar });
      user = await user.save();
    }

    previousAvatar && (await deleteCloudImage(previousAvatar));

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    avatar && (await deleteCloudImage(avatar.public_id));
    next(error);
  }
};

export const deleteUser = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Access denied", 401));

    const id = req.user._id;
    const user = await UserModel.findById(id);

    if (!user) {
      return next(new AppError("User not found or already deleted", 404));
    }

    const userAvatar = user.avatar?.public_id;
    await user.deleteOne();

    userAvatar && (await deleteCloudImage(userAvatar));

    res.clearCookie(process.env.COOKIE_NAME!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateUserByAdmin = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Access denied", 401));

    const _id = objectIdSchema.parse(req.params.id);
    const isSelf = req.user._id.toString() === _id.toString();

    if (isSelf) {
      return next(
        new AppError("You cannot update your own account by admin action", 403),
      );
    }

    const updates = updateUserByAdminSchema.parse(req.body);

    const adminUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([_, value]) => value !== undefined && value !== null,
      ),
    );

    let user = await UserModel.findById(_id).select(
      "+password -__v -restrictionExpires",
    );

    if (!user) {
      return next(new AppError("User not found", 404));
    }
    const restrict =
      updates.status === TUserStatus.Restricted
        ? new Date(Date.now() + restrictionDays * 24 * 60 * 60 * 1000)
        : null;

    let data: any;

    if (restrict) {
      data = { ...adminUpdates, restrictionExpires: restrict };
    } else {
      data = { ...adminUpdates, restrictionExpires: undefined };
    }

    user.set({ ...data });
    user = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
