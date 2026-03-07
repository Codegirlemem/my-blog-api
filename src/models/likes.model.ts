import { model, Schema, Types } from "mongoose";
import BlogPostModel from "./posts.model.js";
import AppError from "../utils/appError.utils.js";

export const likeSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    post: { type: Types.ObjectId, ref: "BlogPost", required: true },
  },
  { timestamps: true },
);

likeSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc, next) {
    try {
      const postId = this.post;

      const updatedPost = await BlogPostModel.findByIdAndUpdate(postId, {
        $inc: { likeCount: -1 },
      });

      if (!updatedPost) {
        return next(
          new AppError(`Could not decrease post ${postId} likecount`, 400),
        );
      }

      next();
    } catch (error: any) {
      next(error);
    }
  },
);

likeSchema.index({ user: 1, post: 1 }, { unique: true });

export const LikeModel = model("Like", likeSchema);
