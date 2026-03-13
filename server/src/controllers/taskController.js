const projectSchema = require("../models/projectSchema");
const taskSchema = require("../models/taskSchema");

const getProjectAndVerifyAccess = async (projectId, userId, userRole) => {
    const project = await projectSchema.findById(projectId);
    if (!project) return { error: { status: 404, message: "Project not found" } };

    const isBuyer = project.buyer.toString() === userId.toString();
    const isSolver = project.solver && project.solver.toString() === userId.toString();
    const isAdmin = userRole === "ADMIN";

    if (!isBuyer && !isSolver && !isAdmin) {
        return { error: { status: 403, message: "You do not have access to this project" } };
    }

    return { project, isBuyer, isSolver, isAdmin };
};

const createTask = async (req, res) => {
    try {
        const { project, isSolver, error } = await getProjectAndVerifyAccess(req.params.projectId, req.user._id, req.user.role);
        if (error) return res.status(error.status).send({ success: false, message: error.message });

        if (!isSolver) {
            return res.status(403).send({ success: false, message: "Only the assigned solver can create tasks" });
        }

        if (!["ASSIGNED", "IN_PROGRESS"].includes(project.status)) {
            return res.status(400).send({ success: false, message: "Tasks can only be created on ASSIGNED or IN_PROGRESS projects" });
        }

        const { title, description, deadline, priority, order } = req.body;
        const task = await taskSchema.create({
            project: project._id, title, description, deadline,
            priority: priority || "MEDIUM",
            order: order || 0,
            createdBy: req.user._id,
        });

        if (project.status === "ASSIGNED") {
            project.status = "IN_PROGRESS";
            await project.save();
        }

        res.status(201).send({ success: true, message: "Task created successfully", data: { task } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const getProjectTasks = async (req, res) => {
    try {
        const { error } = await getProjectAndVerifyAccess(req.params.projectId, req.user._id, req.user.role);
        if (error) return res.status(error.status).send({ success: false, message: error.message });

        const filter = { project: req.params.projectId };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.priority) filter.priority = req.query.priority;

        const tasks = await taskSchema.find(filter)
            .sort({ order: 1, createdAt: 1 })
            .populate("createdBy", "name email avatar");

        res.status(200).send({ success: true, message: "Tasks fetched", data: { tasks } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const getTask = async (req, res) => {
    try {
        const { error } = await getProjectAndVerifyAccess(req.params.projectId, req.user._id, req.user.role);
        if (error) return res.status(error.status).send({ success: false, message: error.message });

        const task = await taskSchema.findOne({ _id: req.params.taskId, project: req.params.projectId })
            .populate("createdBy", "name email avatar");

        if (!task) return res.status(404).send({ success: false, message: "Task not found" });

        res.status(200).send({ success: true, message: "Task fetched", data: { task } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const updateTask = async (req, res) => {
    try {
        const { isSolver, error } = await getProjectAndVerifyAccess(req.params.projectId, req.user._id, req.user.role);
        if (error) return res.status(error.status).send({ success: false, message: error.message });

        if (!isSolver && req.user.role !== "ADMIN") {
            return res.status(403).send({ success: false, message: "Only the assigned solver can update tasks" });
        }

        const task = await taskSchema.findOne({ _id: req.params.taskId, project: req.params.projectId });
        if (!task) return res.status(404).send({ success: false, message: "Task not found" });

        const { title, description, deadline, priority, order } = req.body;
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (deadline) updateData.deadline = deadline;
        if (priority) updateData.priority = priority;
        if (order !== undefined) updateData.order = order;

        const updated = await taskSchema.findByIdAndUpdate(task._id, updateData, { new: true, runValidators: true })
            .populate("createdBy", "name email avatar");

        res.status(200).send({ success: true, message: "Task updated", data: { task: updated } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { project, isBuyer, isSolver, error } = await getProjectAndVerifyAccess(req.params.projectId, req.user._id, req.user.role);
        if (error) return res.status(error.status).send({ success: false, message: error.message });

        const task = await taskSchema.findOne({ _id: req.params.taskId, project: req.params.projectId });
        if (!task) return res.status(404).send({ success: false, message: "Task not found" });

        const { newStatus } = req.body;
        if (!newStatus) return res.status(400).send({ success: false, message: "newStatus is required" });

        const solverOnly = ["IN_PROGRESS", "SUBMITTED"];
        const buyerOnly = ["COMPLETED", "REJECTED"];

        if (isSolver && !solverOnly.includes(newStatus) && req.user.role !== "ADMIN") {
            return res.status(403).send({ success: false, message: `Solvers can only move tasks to: ${solverOnly.join(", ")}` });
        }

        if (isBuyer && !buyerOnly.includes(newStatus) && req.user.role !== "ADMIN") {
            return res.status(403).send({ success: false, message: `Buyers can only move tasks to: ${buyerOnly.join(", ")}` });
        }

        if (!task.canTransitionTo(newStatus)) {
            return res.status(400).send({ success: false, message: `Cannot transition task from ${task.status} to ${newStatus}` });
        }

        task.status = newStatus;
        await task.save();

        if (newStatus === "COMPLETED") {
            const incomplete = await taskSchema.countDocuments({ project: project._id, status: { $ne: "COMPLETED" } });
            if (incomplete === 0) await projectSchema.findByIdAndUpdate(project._id, { status: "COMPLETED" });
        }

        res.status(200).send({ success: true, message: `Task status updated to ${newStatus}`, data: { task } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { isSolver, error } = await getProjectAndVerifyAccess(req.params.projectId, req.user._id, req.user.role);
        if (error) return res.status(error.status).send({ success: false, message: error.message });

        if (!isSolver && req.user.role !== "ADMIN") {
            return res.status(403).send({ success: false, message: "Only the assigned solver can delete tasks" });
        }

        const task = await taskSchema.findOne({ _id: req.params.taskId, project: req.params.projectId });
        if (!task) return res.status(404).send({ success: false, message: "Task not found" });

        if (task.status !== "PENDING") {
            return res.status(400).send({ success: false, message: "Only PENDING tasks can be deleted" });
        }

        await task.deleteOne();
        res.status(200).send({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

module.exports = { createTask, getProjectTasks, getTask, updateTask, updateTaskStatus, deleteTask };