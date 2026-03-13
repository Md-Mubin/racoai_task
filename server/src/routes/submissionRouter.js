const express = require("express");
const submissionRouter = express.Router();
const { submitTask, getTaskSubmissions, getSubmission, reviewSubmission } = require("../controllers/submissionController");
const { protect, authorize } = require("../middleware/auth");
const { uploadZip } = require("../config/cloudinary");
const { handleMulterError } = require("../helpers/error");

submissionRouter.post("/tasks/:taskId/submit", protect, authorize("PROBLEM_SOLVER"),
  uploadZip.single("file"),
  handleMulterError,
  submitTask
);

submissionRouter.get("/tasks/:taskId", protect, getTaskSubmissions);
submissionRouter.get("/:submissionId", protect, getSubmission);

submissionRouter.patch("/:submissionId/review", protect, authorize("BUYER"), reviewSubmission);

module.exports = submissionRouter;