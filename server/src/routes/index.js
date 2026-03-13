const express = require("express");
const authRouter = require("./authRouter");
const projectRouter = require("./projectRouter");
const requestRouter = require("./requestRouter");
const submissionRouter = require("./submissionRouter");
const userRouter = require("./userRouter");
const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/projects", projectRouter);
router.use("/requests", requestRouter);
router.use("/submissions", submissionRouter);

router.get("/health", (req, res) => {
  res.json({ success: true, message: "API is running", timestamp: new Date() });
});

module.exports = router;