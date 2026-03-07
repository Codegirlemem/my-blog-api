import * as z from "zod";

export const createPostSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(1, "Blog title must be provided")
    .max(100, "Blog title must not exceed 100 characters"),

  content: z.string().trim().min(1, "Blog content must be provided"),
});

export const updatePostSchema = createPostSchema.partial();

export const commentZodSchema = z.strictObject({
  content: z
    .string()
    .trim()
    .min(1, "Comment must be provided")
    .max(200, "Comment cannot exceed 200 characters"),
});
