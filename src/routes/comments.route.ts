import express from "express";
import {
  isAuthenticated,
  isNotRestricted,
} from "../middlewares/auth.middleware.js";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../controllers/comments.controller.js";

const router = express.Router();

router.post(
  "/:postId/comments",
  isAuthenticated,
  isNotRestricted,
  createComment,
);
router.patch(
  "/comments/:commentId",
  isAuthenticated,
  isNotRestricted,
  updateComment,
);
router.delete(
  "/comments/:commentId",
  isAuthenticated,
  isNotRestricted,
  deleteComment,
);

export default router;
