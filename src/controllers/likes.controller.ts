import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import AppError from "../utils/appError.utils.js";
import BlogPostModel from "../models/posts.model.js";
import { objectIdSchema } from "../zod/user.zod.js";
import { LikeModel } from "../models/likes.model.js";
import { TBlogPost } from "../types/index.type.js";

export const toggleLikePost = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));
    console.log(req.params.postId);

    const postId = objectIdSchema.parse(req.params.postId);
    const userId = req.user._id;

    const post = await BlogPostModel.findById(postId);
    if (!post) return next(new AppError("Post not found", 404));

    const existingLike = await LikeModel.findOne({
      post: postId,
      user: userId,
    });

    if (existingLike) {
      // Unlike post if user already liked post
      await existingLike.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Post unliked successfully",
        isLiked: false,
      });
    } else {
      // Like post if user has not liked it yet
      await LikeModel.create({ post: postId, user: userId });
      await BlogPostModel.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });

      return res.status(200).json({
        success: true,
        message: "Post liked successfully",
        isLiked: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getPostLikes = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = objectIdSchema.parse(req.params.postId);

    const post = (await BlogPostModel.findById(postId)
      .select("title likeCount")
      .populate({
        path: "likers",
        populate: {
          path: "user",
          select: "username avatar fullname",
        },
      })) as TBlogPost;

    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    res.status(200).json({
      success: true,
      count: post.likeCount,
      data: post.likers,
    });
  } catch (error) {}
};
