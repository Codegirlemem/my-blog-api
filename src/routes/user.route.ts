import express from "express";
import {
  deleteUser,
  getAllUsers,
  getPublicProfile,
  getUserProfile,
  updateUser,
  updateUserByAdmin,
  uploadAvatar,
} from "../controllers/user.controller.js";
import {
  isAdmin,
  isAuthenticated,
  isNotRestricted,
} from "../middlewares/auth.middleware.js";
import upload from "../config/multer.config.js";

const router = express.Router();

// Authenticated user route
router.get("/users/me", isAuthenticated, getUserProfile);
router.get("/users/:username", getPublicProfile);

router.patch("/users/me", isAuthenticated, isNotRestricted, updateUser);
router.patch(
  "/users/me/avatar",
  isAuthenticated,
  isNotRestricted,
  upload.single("avatar"),
  uploadAvatar,
);
router.delete("/users/me", isAuthenticated, deleteUser);

// Admin only route
router.get(
  "/admin/users",
  isAuthenticated,
  isNotRestricted,
  isAdmin,
  getAllUsers,
);

router.get(
  "/admin/users/:id",
  isAuthenticated,
  isNotRestricted,
  isAdmin,
  getUserProfile,
);

router.patch(
  "/admin/users/:id",
  isAuthenticated,
  isNotRestricted,
  isAdmin,
  updateUserByAdmin,
);

export default router;
