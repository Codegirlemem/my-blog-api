import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import * as z from "zod";
import { InferSchemaType } from "mongoose";
import { userSchema } from "../models/user.model.js";
import { updateUserByAdminSchema, updateUserSchema } from "../zod/user.zod.js";
import { blogPostSchema } from "../models/posts.model.js";

export enum TRoles {
  User = "user",
  Admin = "admin",
}

export interface AuthPayload extends JwtPayload {
  id: mongoose.Types.ObjectId;
  role: TRoles;
}

export enum TUserStatus {
  Active = "active",
  Restricted = "restricted",
  Blocked = "Blocked",
}

export type TAvatarImage = {
  secure_url: string;
  public_id: string;
};

type UserBase = InferSchemaType<typeof userSchema>;
export type LeanUserModel = UserBase & {
  _id: mongoose.Types.ObjectId;
};

export type UserAuthPayload = LeanUserModel & JwtPayload;

export type TUserProfileUpdate = z.infer<typeof updateUserSchema>;
export type TUserUpdateData = TUserProfileUpdate & { avatar?: TAvatarImage };
export type TAdminProfileUpdate = z.infer<typeof updateUserByAdminSchema>;

type BlogPostBase = InferSchemaType<typeof blogPostSchema>;

// 2. Define the specific shape of your Virtuals
export type TBlogPost = BlogPostBase & {
  _id: mongoose.Types.ObjectId;

  comments?: {
    _id: mongoose.Types.ObjectId;
    content: string;
    author: {
      _id: mongoose.Types.ObjectId;
      username: string;
      avatar?: { secure_url: string };
    };
    createdAt: Date;
  }[];

  likers?: {
    _id: mongoose.Types.ObjectId;
    user: {
      _id: mongoose.Types.ObjectId;
      username: string;
      avatar?: { secure_url: string };
      fullname?: string;
    };
  }[];
};
