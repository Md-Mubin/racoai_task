const projectRequestSchema = require("../models/projectRequestSchema");
const projectSchema = require("../models/projectSchema");

const createRequest = async (req, res) => {
    try {
        const project = await projectSchema.findById(req.params.projectId);
        if (!project) return res.status(404).send({ success: false, message: "Project not found" });

        if (project.status !== "OPEN") {
            return res.status(400).send({ success: false, message: "This project is not accepting requests" });
        }

        if (project.buyer.toString() === req.user._id.toString()) {
            return res.status(400).send({ success: false, message: "You cannot apply to your own project" });
        }

        const existing = await projectRequestSchema.findOne({ project: project._id, solver: req.user._id });
        if (existing) {
            return res.status(409).send({ success: false, message: "You have already requested to work on this project" });
        }

        const { message, proposedBudget, estimatedDays } = req.body;
        const request = await projectRequestSchema.create({
            project: project._id,
            solver: req.user._id,
            message,
            proposedBudget: proposedBudget || null,
            estimatedDays: estimatedDays || null,
        });

        await request.populate("solver", "name email avatar bio skills");
        res.status(201).send({ success: true, message: "Request submitted successfully", data: { request } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const getProjectRequests = async (req, res) => {
    try {
        const project = await projectSchema.findById(req.params.projectId);
        if (!project) return res.status(404).send({ success: false, message: "Project not found" });

        if (req.user.role !== "ADMIN" && project.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Access denied" });
        }

        const filter = { project: project._id };
        if (req.query.status) filter.status = req.query.status;

        const requests = await projectRequestSchema.find(filter)
            .sort({ createdAt: -1 })
            .populate("solver", "name email avatar bio skills");

        res.status(200).send({ success: true, message: "Requests fetched", data: { requests } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const filter = { solver: req.user._id };
        if (req.query.status) filter.status = req.query.status;

        const requests = await projectRequestSchema.find(filter)
            .sort({ createdAt: -1 })
            .populate("project", "title description budget deadline status");

        res.status(200).send({ success: true, message: "Your requests fetched", data: { requests } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const getRequest = async (req, res) => {
    try {
        const request = await projectRequestSchema.findById(req.params.requestId)
            .populate("solver", "name email avatar bio skills")
            .populate("project", "title description budget status buyer");

        if (!request) return res.status(404).send({ success: false, message: "Request not found" });

        const isProjectBuyer = request.project.buyer.toString() === req.user._id.toString();
        const isRequestSolver = request.solver._id.toString() === req.user._id.toString();

        if (req.user.role !== "ADMIN" && !isProjectBuyer && !isRequestSolver) {
            return res.status(403).send({ success: false, message: "Access denied" });
        }

        res.status(200).send({ success: true, message: "Request fetched", data: { request } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const withdrawRequest = async (req, res) => {
    try {
        const request = await projectRequestSchema.findById(req.params.requestId);
        if (!request) return res.status(404).send({ success: false, message: "Request not found" });

        if (request.solver.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "You can only withdraw your own requests" });
        }

        if (request.status !== "PENDING") {
            return res.status(400).send({ success: false, message: "Only PENDING requests can be withdrawn" });
        }

        await request.deleteOne();
        res.status(200).send({ success: true, message: "Request withdrawn successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

module.exports = { createRequest, getProjectRequests, getMyRequests, getRequest, withdrawRequest };