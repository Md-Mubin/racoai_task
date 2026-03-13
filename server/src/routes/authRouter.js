const express = require("express");
const authRouter = express.Router();
const { register, login, logout, getMe, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", protect, getMe);
authRouter.patch("/change-password", protect, changePassword);

module.exports = authRouter;