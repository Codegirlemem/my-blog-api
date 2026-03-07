import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import blogPostRouter from "./posts.route.js";
import blogCommentRouter from "./comments.route.js";
import likePostRouter from "./likes.routes.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/", userRouter);
apiRouter.use("/posts", blogPostRouter);
apiRouter.use("/posts", blogCommentRouter);
apiRouter.use("/posts", likePostRouter);

export default apiRouter;
