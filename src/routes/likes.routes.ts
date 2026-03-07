import express from "express";

import {
  isAuthenticated,
  isNotRestricted,
} from "../middlewares/auth.middleware.js";
import {
  getPostLikes,
  toggleLikePost,
} from "../controllers/likes.controller.js";

const router = express.Router();

router.post(
  "/:postId/toggle-like",
  isAuthenticated,
  isNotRestricted,
  toggleLikePost,
);

// public route
router.get("/:postId/likes", getPostLikes);

export default router;
