const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "BUYER", "PROBLEM_SOLVER"],
      default: "PROBLEM_SOLVER",
    },
    avatar: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    bio: {
      type: String,
      default: "",
    },
    skills: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);