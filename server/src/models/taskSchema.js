const mongoose = require("mongoose");

const ALLOWED_TASK_TRANSITIONS = {
  PENDING: ["IN_PROGRESS"],
  IN_PROGRESS: ["SUBMITTED"],
  SUBMITTED: ["COMPLETED", "REJECTED"],
  REJECTED: ["IN_PROGRESS"],
  COMPLETED: [],
};

const taskSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
    validate: {
      validator: (v) => v > new Date(),
      message: "Deadline must be in the future",
    },
  },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "MEDIUM",
  },
  status: {
    type: String,
    enum: ["PENDING", "IN_PROGRESS", "SUBMITTED", "COMPLETED", "REJECTED"],
    default: "PENDING",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order: { type: Number, default: 0 },
}, { timestamps: true });

taskSchema.statics.ALLOWED_TRANSITIONS = ALLOWED_TASK_TRANSITIONS;

taskSchema.methods.canTransitionTo = function (newStatus) {
  return (ALLOWED_TASK_TRANSITIONS[this.status] || []).includes(newStatus);
};

module.exports = mongoose.model("Task", taskSchema);