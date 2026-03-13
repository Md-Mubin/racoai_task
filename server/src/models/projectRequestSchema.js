const mongoose = require("mongoose");

const projectRequestSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  solver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true
  },
  proposedBudget: { type: Number, min: 1, default: null },
  estimatedDays: { type: Number, min: 1, default: null },
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    default: "PENDING",
  },
  rejectionNote: { type: String, default: null },
}, { timestamps: true });

projectRequestSchema.index({ project: 1, solver: 1 }, { unique: true });

module.exports = mongoose.model("ProjectRequest", projectRequestSchema);