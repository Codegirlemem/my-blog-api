import { model, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import { TRoles, TUserStatus } from "../types/index.type.js";

export const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      immutable: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
      select: false,
    },
    username: {
      type: String,
      trim: true,
      required: [true, "Username is required"],
      minLength: [3, "Username must be atleast three characters"],
      maxLength: [20, "Username must not exceed 20 characters"],
    },
    fullname: {
      type: String,
      trim: true,
      minLength: [3, "Fullname must be atleast three characters"],
      maxLength: [20, "Fullname  must not exceed 20 characters"],
    },
    role: {
      type: String,
      enum: {
        values: Object.values(TRoles),
        message: `{VALUE} is not supported`,
      },
      default: TRoles.User,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TUserStatus),
        message: `{VALUE} is not supported`,
      },
      default: TUserStatus.Active,
    },
    avatar: {
      type: {
        public_id: { type: String, required: true },
        secure_url: { type: String, required: true },
      },
      default: null,
    },
    restrictionExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

    methods: {
      async comparePassword(enteredPassword: string) {
        return bcrypt.compare(enteredPassword, this.password);
      },
    },
  },
);

userSchema.virtual("posts", {
  ref: "BlogPost",
  localField: "_id",
  foreignField: "author",
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const UserModel = model("User", userSchema);

export default UserModel;
