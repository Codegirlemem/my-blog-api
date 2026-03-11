import mongoose from "mongoose";
import * as z from "zod";
import { TRoles, TUserStatus } from "../types/index.type.js";

export const objectIdSchema = z.coerce
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  })
  .transform((val) => new mongoose.Types.ObjectId(val));

export const emailInputSchema = z.email();
export const passwordInputSchema = z
  .string()
  .trim()
  .min(6, "Password must be at least 6 characters")
  .max(30, "Password must not exceed 30 characters");

export const usernameInputSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must not exceed 20 characters");

export const fullnameInputSchema = z
  .string()
  .trim()
  .min(3, "Full name must be at least 3 characters")
  .max(20, "Full name must not exceed 20 characters");

export const userZodSchema = z.strictObject({
  email: emailInputSchema,
  password: passwordInputSchema,
  username: usernameInputSchema,
  role: z.enum(Object.values(TRoles)).default(TRoles.User),
});

export const loginZodSchema = userZodSchema.pick({
  email: true,
  password: true,
});

export const updateUserSchema = userZodSchema
  .omit({ email: true, role: true })
  .partial()
  .extend({
    fullname: fullnameInputSchema.optional(),
  })
  .strict()
  .refine(
    (data) =>
      Object.values(data).some(
        (value) => value !== undefined && value !== null && value !== "",
      ),
    {
      message: "At least one field must be provided",
    },
  );

export const updateUserByAdminSchema = z
  .strictObject({
    status: z.enum(Object.values(TUserStatus)).optional(),
    role: z.enum(Object.values(TRoles)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
