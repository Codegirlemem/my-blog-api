import { model, Schema, Types } from "mongoose";
import BlogPostModel from "./posts.model.js";
import AppError from "../utils/appError.utils.js";

export const postCommentSchema = new Schema(
  {
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Author  is required"],
      index: true,
    },
    post: {
      type: Types.ObjectId,
      ref: "BlogPost",
      required: [true, "Blog post ID  is required"],
      index: true,
    },
    content: {
      type: String,
      trim: true,
      required: [true, "Comment is required"],
      minLength: [1, "Comment must have atleast one character"],
      maxLength: [200, "omment cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  },
);

postCommentSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc, next) {
    try {
      const postId = this.post;

      const updatedPost = await BlogPostModel.findByIdAndUpdate(postId, {
        $inc: { commentCount: -1 },
      });

      if (!updatedPost) {
        return next(
          new AppError(`Could not decrease post ${postId} commentCount`, 400),
        );
      }

      next();
    } catch (error: any) {
      next(error);
    }
  },
);
const PostCommentModel = model("PostComments", postCommentSchema);

export default PostCommentModel;
