import { model, Schema, Types } from "mongoose";
import PostCommentModel from "./comments.model.js";
import { LikeModel } from "./likes.model.js";

export const blogPostSchema = new Schema(
  {
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Author  is required"],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
      minLength: [1, "Title must have atleast one character"],
      maxLength: [100, "Title must not exceed 100 characters"],
    },
    content: {
      type: String,
      trim: true,
      required: [true, "Content is required"],
      minLength: [1, "Content must have atleast one character"],
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

blogPostSchema.virtual("comments", {
  ref: "PostComments",
  localField: "_id",
  foreignField: "post",
});

blogPostSchema.virtual("likers", {
  ref: "Like",
  localField: "_id",
  foreignField: "post",
});

blogPostSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const postId = this._id;

    await Promise.all([
      PostCommentModel.deleteMany({ post: postId }),
      LikeModel.deleteMany({ post: postId }),
    ]);

    console.log(`Successfully removed likes and comments for post: ${postId}`);
  },
);

const BlogPostModel = model("BlogPost", blogPostSchema);

export default BlogPostModel;
