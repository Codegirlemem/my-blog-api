import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
} from "../controllers/posts.controller.js";
import {
  isAuthenticated,
  isNotRestricted,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:postId", getPostById);
router.post("/", isAuthenticated, isNotRestricted, createPost);
router.patch("/:postId", isAuthenticated, isNotRestricted, updatePost);
router.delete("/:postId", isAuthenticated, isNotRestricted, deletePost);

export default router;
