import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import AppError from "../utils/appError.utils.js";
import { createPostSchema, updatePostSchema } from "../zod/posts.zod.js";
import BlogPostModel from "../models/posts.model.js";
import { objectIdSchema } from "../zod/user.zod.js";
import { TRoles } from "../types/index.type.js";
import { LikeModel } from "../models/likes.model.js";

export const createPost = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));

    const { title, content } = createPostSchema.parse(req.body);

    const newPost = await BlogPostModel.create({
      title,
      content,
      author: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));

    const postId = objectIdSchema.parse(req.params.postId);
    const updates = updatePostSchema.parse(req.body);

    const post = await BlogPostModel.findById(postId);

    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    if (!post.author.equals(req.user._id)) {
      return next(new AppError("You can only edit your own posts", 403));
    }

    post.set(updates);
    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));
    const isAdmin = req.user.role === TRoles.Admin;
    const postId = objectIdSchema.parse(req.params.postId);

    const post = await BlogPostModel.findById(postId);

    if (!post) {
      return next(new AppError("Post not found", 404));
    }
    const isAuthor = post.author.equals(req.user._id);

    if (!isAuthor && !isAdmin) {
      return next(
        new AppError("You do not have permission to delete this post", 403),
      );
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = objectIdSchema.parse(req.params.postId);

    const post = await BlogPostModel.findById(postId)
      .populate("author", "username avatar")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username avatar",
        },
        options: { limit: 20, sort: { createdAt: -1 } },
      })
      .lean();

    if (!post) {
      return next(new AppError("Post not found", 404));
    }
    let isLiked;
    if (req.user) {
      isLiked = await LikeModel.exists({
        post: postId,
        user: req.user._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post retrieved successfully",
      data: { ...post, isliked: isLiked },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPosts = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const posts = await BlogPostModel.find()
      .select("title createdAt likeCount commentCount")
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};
