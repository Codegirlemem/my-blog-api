import { model, Schema, Types } from "mongoose";

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

const PostCommentModel = model("PostComments", postCommentSchema);

export default PostCommentModel;
