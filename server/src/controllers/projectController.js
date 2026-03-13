const { deleteFromCloudinary } = require("../config/cloudinary");
const projectSchema = require("../models/projectSchema");
const taskSchema = require("../models/taskSchema");
const projectRequestSchema = require("../models/projectRequestSchema");

const createProject = async (req, res) => {
    try {
        const { title, description, budget, deadline, tags } = req.body;
        const project = await projectSchema.create({
            title, description, budget, deadline,
            tags: tags || [],
            buyer: req.user._id,
        });
        res.status(201).send({ success: true, message: "Project created successfully", data: { project } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const getAllProjects = async (req, res) => {
    try {
        const { status, search, minBudget, maxBudget } = req.query;
        const filter = {};

        if (req.user.role === "BUYER") filter.buyer = req.user._id;
        else if (req.user.role === "PROBLEM_SOLVER") filter.status = status || "OPEN";
        else if (req.user.role === "ADMIN" && status) filter.status = status;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (minBudget || maxBudget) {
            filter.budget = {};
            if (minBudget) filter.budget.$gte = parseFloat(minBudget);
            if (maxBudget) filter.budget.$lte = parseFloat(maxBudget);
        }

        const projects = await projectSchema.find(filter)
            .sort({ createdAt: -1 })
            .populate("buyer", "name email avatar")
            .populate("solver", "name email avatar");

        res.status(200).send({ success: true, message: "Projects fetched", data: { projects } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const getProject = async (req, res) => {
    try {
        const project = await projectSchema.findById(req.params.id)
            .populate("buyer", "name email avatar bio")
            .populate("solver", "name email avatar bio skills");

        if (!project) {
            return res.status(404).send({ success: false, message: "Project not found" });
        }

        const isBuyer = project.buyer._id.toString() === req.user._id.toString();
        const isSolver = project.solver && project.solver._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "ADMIN";

        if (!isAdmin && !isBuyer && !isSolver && project.status !== "OPEN") {
            return res.status(403).send({ success: false, message: "Access denied" });
        }

        const taskCount = await taskSchema.countDocuments({ project: project._id });
        res.status(200).send({ success: true, message: "Project fetched", data: { project, taskCount } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const updateProject = async (req, res) => {
    try {
        const project = await projectSchema.findById(req.params.id);
        if (!project) return res.status(404).send({ success: false, message: "Project not found" });

        if (project.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Only the project buyer can update it" });
        }

        if (project.status !== "OPEN") {
            return res.status(400).send({ success: false, message: "Project can only be edited when OPEN" });
        }

        const { title, description, budget, deadline, tags } = req.body;
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (budget) updateData.budget = budget;
        if (deadline) updateData.deadline = deadline;
        if (tags) updateData.tags = tags;

        const updated = await projectSchema.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate("buyer", "name email avatar")
            .populate("solver", "name email avatar");

        res.status(200).send({ success: true, message: "Project updated", data: { project: updated } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await projectSchema.findById(req.params.id);
        if (!project) return res.status(404).send({ success: false, message: "Project not found" });

        if (project.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Only the project buyer can delete it" });
        }

        if (project.status !== "OPEN") {
            return res.status(400).send({ success: false, message: "Only OPEN projects can be deleted" });
        }

        if (project.attachments?.length > 0) {
            await Promise.allSettled(project.attachments.map((a) => deleteFromCloudinary(a.publicId, "raw")));
        }

        await Promise.all([
            projectRequestSchema.deleteMany({ project: project._id }),
            taskSchema.deleteMany({ project: project._id }),
        ]);

        await project.deleteOne();
        res.status(200).send({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const assignSolver = async (req, res) => {
    try {
        const project = await projectSchema.findById(req.params.id);
        if (!project) return res.status(404).send({ success: false, message: "Project not found" });

        if (project.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Only the project buyer can assign a solver" });
        }

        if (project.status !== "OPEN") {
            return res.status(400).send({ success: false, message: "Solver can only be assigned to OPEN projects" });
        }

        const { requestId } = req.body;
        if (!requestId) return res.status(400).send({ success: false, message: "requestId is required" });

        const request = await projectRequestSchema.findById(requestId);
        if (!request || request.project.toString() !== project._id.toString()) {
            return res.status(404).send({ success: false, message: "Request not found for this project" });
        }

        if (request.status !== "PENDING") {
            return res.status(400).send({ success: false, message: "This request has already been processed" });
        }

        await Promise.all([
            projectRequestSchema.findByIdAndUpdate(requestId, { status: "ACCEPTED" }),
            projectRequestSchema.updateMany(
                { project: project._id, _id: { $ne: requestId }, status: "PENDING" },
                { status: "REJECTED" }
            ),
        ]);

        const updated = await projectSchema.findByIdAndUpdate(
            project._id,
            { solver: request.solver, status: "ASSIGNED" },
            { new: true }
        ).populate("buyer", "name email avatar").populate("solver", "name email avatar skills");

        res.status(200).send({ success: true, message: "Solver assigned successfully", data: { project: updated } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const transitionStatus = async (req, res) => {
    try {
        const { newStatus } = req.body;
        const project = await projectSchema.findById(req.params.id);
        if (!project) return res.status(404).send({ success: false, message: "Project not found" });

        if (req.user.role !== "ADMIN" && project.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Access denied" });
        }

        if (!project.canTransitionTo(newStatus)) {
            return res.status(400).send({ success: false, message: `Cannot transition from ${project.status} to ${newStatus}` });
        }

        project.status = newStatus;
        await project.save();

        res.status(200).send({ success: true, message: `Project status updated to ${newStatus}`, data: { project } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

module.exports = { createProject, getAllProjects, getProject, updateProject, deleteProject, assignSolver, transitionStatus };