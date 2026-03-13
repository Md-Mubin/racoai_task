const express = require("express");
const userRouter = express.Router();
const { getAllUsers, getAdminStats, updateUserRole, toggleUserStatus, getUserProfile, updateProfile } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const { uploadAvatar } = require("../config/cloudinary");

userRouter.get("/", protect, authorize("ADMIN"), getAllUsers);

userRouter.get("/stats", protect, authorize("ADMIN"), getAdminStats);

userRouter.patch("/:id/role", protect, authorize("ADMIN"), updateUserRole);

userRouter.patch("/:id/status", protect, authorize("ADMIN"), toggleUserStatus);

userRouter.get("/:id/profile", protect, getUserProfile);

userRouter.patch("/me/profile", protect, uploadAvatar.single("avatar"), updateProfile);

module.exports = userRouter;