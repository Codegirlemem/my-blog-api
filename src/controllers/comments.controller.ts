import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import AppError from "../utils/appError.utils.js";
import { objectIdSchema } from "../zod/user.zod.js";
import { commentZodSchema } from "../zod/posts.zod.js";
import BlogPostModel from "../models/posts.model.js";
import PostCommentModel from "../models/comments.model.js";
import { TRoles } from "../types/index.type.js";

export const createComment = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));

    const postId = objectIdSchema.parse(req.params.postId);
    const { content } = commentZodSchema.parse(req.body);

    const post = await BlogPostModel.findById(postId);
    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    const comment = await PostCommentModel.create({
      content,
      author: req.user._id,
      post: postId,
    });

    await BlogPostModel.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });

    const populatedComment = await comment.populate(
      "author",
      "username avatar",
    );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));

    const commentId = objectIdSchema.parse(req.params.commentId);
    console.log(commentId);

    const { content } = commentZodSchema.parse(req.body);

    const comment = await PostCommentModel.findById(commentId);

    if (!comment) {
      return next(new AppError("Comment not found", 404));
    }
    const isAuthor = comment.author.equals(req.user._id);

    if (!isAuthor) {
      return next(new AppError("You can only edit your own comments", 403));
    }

    comment.content = content;
    const updatedComment = await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment updated",
      data: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));

    const commentId = objectIdSchema.parse(req.params.commentId);
    const comment = await PostCommentModel.findById(commentId);

    if (!comment) {
      return next(new AppError("Comment not found", 404));
    }

    const isAuthor = comment.author.equals(req.user._id);
    const isAdmin = req.user.role === TRoles.Admin;

    if (!isAuthor && !isAdmin) {
      return next(
        new AppError("You do not have permission to delete this comment", 403),
      );
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
