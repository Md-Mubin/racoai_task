const { emailValid, passValid } = require("../helpers/emailPassValid");
const { createSendToken } = require("../helpers/jwt");
const userSchema = require("../models/userSchema");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) return res.status(400).send({ success: false, message: "All Field Required" })

        if (!emailValid(email)) return res.status(400).send({ success: false, message: "Email is not valid" })

        const existingUser = await userSchema.findOne({ email });
        if (existingUser) return res.status(409).send({ success: false, message: "Email already in use" });

        if (passValid(password)) return res.status(400).send({ success: false, message: passValid(password) })

        const user = new userSchema({
            name, email, password
        });
        await user.save()
        return createSendToken(user, 201, res, "Account created successfully");
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).send({ success: false, message: "All Field Required" })

        const existUser = await userSchema.findOne({ email })
        if (!existUser) return res.status(400).send({ success: false, message: "Invalid email or password"})

        if (!existUser || !(await existUser.comparePassword(password))) {
            return res.status(401).send({ success: false, message: "Invalid email or password" });
        }

        if (!existUser.isActive) return res.status(403).send({ success: false, message: "Your account has been deactivated" });

        return createSendToken(existUser, 200, res, "Logged in successfully");
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const logout = (req, res) => {
    res.cookie("token", "", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).send({ success: true, message: "Logged out successfully" });
};

const getMe = async (req, res) => {
    try {
        const user = await userSchema.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }
        res.status(200).send({ success: true, message: "User fetched", data: { user } });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await userSchema.findById(req.user._id).select("+password");
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).send({ success: false, message: "Current password is incorrect" });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).send({ success: false, message: "New password must be at least 6 characters" });
        }

        user.password = newPassword;
        await user.save();

        return createSendToken(user, 200, res, "Password changed successfully");
    } catch (error) {
        res.status(500).send({ success: false, message: error.message || "Server Error" });
    }
};

module.exports = { register, login, logout, getMe, changePassword };