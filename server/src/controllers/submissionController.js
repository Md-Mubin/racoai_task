const submissionSchema = require("../models/submissionSchema");
const taskSchema = require("../models/taskSchema");
const projectSchema = require("../models/projectSchema");
const { uploadToCloudinary } = require("../config/cloudinary");
const fs = require("fs");

const submitTask = async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, message: "ZIP file is required" });

        const task = await taskSchema.findById(req.params.taskId).populate("project");
        if (!task) {
            fs.unlinkSync(req.file.path); // clean up local file
            return res.status(404).send({ success: false, message: "Task not found" });
        }

        const project = task.project;

        // Validation checks — clean up local file on every early return
        if (!project.solver || project.solver.toString() !== req.user._id.toString()) {
            fs.unlinkSync(req.file.path);
            return res.status(403).send({ success: false, message: "Only the assigned solver can submit work" });
        }

        if (task.status !== "IN_PROGRESS") {
            fs.unlinkSync(req.file.path);
            return res.status(400).send({ success: false, message: `Task must be IN_PROGRESS to submit. Current: ${task.status}` });
        }

        const pending = await submissionSchema.findOne({ task: task._id, reviewStatus: "PENDING" });
        if (pending) {
            fs.unlinkSync(req.file.path);
            return res.status(409).send({ success: false, message: "A pending submission already exists. Wait for the buyer to review it." });
        }

        // ✅ All checks passed — now upload to Cloudinary
        const count = await submissionSchema.countDocuments({ task: task._id });

        const cloudResult = await uploadToCloudinary(req.file.path, {
            folder: "racoai/submissions",
            resource_type: "raw",
            public_id: `submission_${task._id}_v${count + 1}_${Date.now()}`,
            format: "zip",
        });
        // uploadToCloudinary already deletes the local file after upload

        const submission = await submissionSchema.create({
            task: task._id,
            solver: req.user._id,
            fileUrl: cloudResult.secure_url,   // ✅ Cloudinary URL
            filePublicId: cloudResult.public_id,    // ✅ Cloudinary public_id
            fileName: req.file.originalname || `submission_v${count + 1}.zip`,
            fileSize: req.file.size || null,
            notes: req.body.notes || "",
            version: count + 1,
        });

        task.status = "SUBMITTED";
        await task.save();

        const pendingOrInProgress = await taskSchema.countDocuments({
            project: project._id,
            status: { $in: ["PENDING", "IN_PROGRESS"] },
        });

        if (pendingOrInProgress === 0) {
            await projectSchema.findByIdAndUpdate(project._id, { status: "UNDER_REVIEW" });
        }

        await submission.populate("solver", "name email avatar");
        res.status(201).send({ success: true, message: "Work submitted successfully", data: { submission } });

    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const getTaskSubmissions = async (req, res) => {
    try {
        const task = await taskSchema.findById(req.params.taskId).populate("project");
        if (!task) return res.status(404).send({ success: false, message: "Task not found" });

        const project = task.project;
        const isBuyer = project.buyer.toString() === req.user._id.toString();
        const isSolver = project.solver && project.solver.toString() === req.user._id.toString();

        if (!isBuyer && !isSolver && req.user.role !== "ADMIN") {
            return res.status(403).send({ success: false, message: "Access denied" });
        }

        const submissions = await submissionSchema.find({ task: task._id })
            .sort({ createdAt: -1 })
            .populate("solver", "name email avatar")
            .populate("reviewedBy", "name email");

        res.status(200).send({ success: true, message: "Submissions fetched", data: { submissions } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const reviewSubmission = async (req, res) => {
    try {
        const submission = await submissionSchema.findById(req.params.submissionId).populate({
            path: "task",
            populate: { path: "project" },
        });

        if (!submission) return res.status(404).send({ success: false, message: "Submission not found" });

        const project = submission.task.project;

        if (project.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Only the project buyer can review submissions" });
        }

        if (submission.reviewStatus !== "PENDING") {
            return res.status(400).send({ success: false, message: "This submission has already been reviewed" });
        }

        const { reviewStatus, rejectionReason } = req.body;

        if (reviewStatus === "REJECTED" && !rejectionReason) {
            return res.status(400).send({ success: false, message: "Rejection reason is required when rejecting" });
        }

        submission.reviewStatus = reviewStatus;
        submission.reviewedAt = new Date();
        submission.reviewedBy = req.user._id;
        if (rejectionReason) submission.rejectionReason = rejectionReason;
        await submission.save();

        const task = submission.task;

        if (reviewStatus === "ACCEPTED") {
            task.status = "COMPLETED";
            await task.save();
            const remaining = await taskSchema.countDocuments({ project: project._id, status: { $ne: "COMPLETED" } });
            if (remaining === 0) await projectSchema.findByIdAndUpdate(project._id, { status: "COMPLETED" });
        } else {
            task.status = "IN_PROGRESS";
            await task.save();
            if (project.status === "UNDER_REVIEW") {
                await projectSchema.findByIdAndUpdate(project._id, { status: "IN_PROGRESS" });
            }
        }

        await submission.populate("solver", "name email avatar");
        await submission.populate("reviewedBy", "name email");

        res.status(200).send({ success: true, message: `Submission ${reviewStatus === "ACCEPTED" ? "accepted" : "rejected"}`, data: { submission } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const getSubmission = async (req, res) => {
    try {
        const submission = await submissionSchema.findById(req.params.submissionId)
            .populate("solver", "name email avatar")
            .populate("reviewedBy", "name email")
            .populate({ path: "task", populate: { path: "project", select: "title buyer solver status" } });

        if (!submission) return res.status(404).send({ success: false, message: "Submission not found" });

        const project = submission.task.project;
        const isBuyer = project.buyer.toString() === req.user._id.toString();
        const isSolver = project.solver && project.solver.toString() === req.user._id.toString();

        if (!isBuyer && !isSolver && req.user.role !== "ADMIN") {
            return res.status(403).send({ success: false, message: "Access denied" });
        }

        res.status(200).send({ success: true, message: "Submission fetched", data: { submission } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

module.exports = { submitTask, getTaskSubmissions, reviewSubmission, getSubmission };