const jwt = require("jsonwebtoken");
const userSchema = require("../models/userSchema");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).send({ success: false, message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userSchema.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).send({ success: false, message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ success: false, message: "Invalid or expired token" });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).send({ success: false, message: `Access denied. Required: ${roles.join(" or ")}` });
  }
  next();
};

module.exports = { protect, authorize };