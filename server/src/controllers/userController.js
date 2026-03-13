const { deleteFromCloudinary } = require("../config/cloudinary");
const userSchema = require("../models/userSchema");
const projectSchema = require("../models/projectSchema");

const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        const users = await userSchema.find(filter).sort({ createdAt: -1 });
        res.status(200).send({ success: true, message: "Users fetched", data: { users } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (id === req.user._id.toString()) {
            return res.status(400).send({ success: false, message: "You cannot change your own role" });
        }

        const user = await userSchema.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        res.status(200).send({ success: true, message: `User role updated to ${role}`, data: { user } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user._id.toString()) {
            return res.status(400).send({ success: false, message: "You cannot deactivate yourself" });
        }

        const user = await userSchema.findById(id);
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).send({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}`, data: { user } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await userSchema.findById(req.params.id);
        if (!user || !user.isActive) {
            return res.status(404).send({ success: false, message: "User not found" });
        }
        res.status(200).send({ success: true, message: "Profile fetched", data: { user } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        let avatarData = {};

        if (req.file) {
            const result = await uploadToCloudinary(req.file.path, {
                folder: "racoai/avatars",
                resource_type: "image",
                public_id: `avatar_${req.user._id}_${Date.now()}`,
                transformation: [{ width: 400, height: 400, crop: "fill" }],
            });
            avatarData = { avatar: result.secure_url, avatarPublicId: result.public_id };
        }

        const user = await userSchema.findByIdAndUpdate(
            req.user._id,
            {
                name: req.body.name,
                bio: req.body.bio,
                ...(req.body.skills && { skills: JSON.parse(req.body.skills) }),
                ...(req.body.links && { links: JSON.parse(req.body.links) }),
                ...avatarData,
            },
            { new: true }
        );

        res.send({ success: true, data: { user } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalBuyers, totalSolvers, totalProjects, openProjects, completedProjects] =
            await Promise.all([
                userSchema.countDocuments(),
                userSchema.countDocuments({ role: "BUYER" }),
                userSchema.countDocuments({ role: "PROBLEM_SOLVER" }),
                projectSchema.countDocuments(),
                projectSchema.countDocuments({ status: "OPEN" }),
                projectSchema.countDocuments({ status: "COMPLETED" }),
            ]);

        res.status(200).send({
            success: true,
            message: "Stats fetched",
            data: {
                users: { total: totalUsers, buyers: totalBuyers, solvers: totalSolvers },
                projects: { total: totalProjects, open: openProjects, completed: completedProjects },
            },
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

module.exports = { getAllUsers, updateUserRole, toggleUserStatus, getUserProfile, updateProfile, getAdminStats };