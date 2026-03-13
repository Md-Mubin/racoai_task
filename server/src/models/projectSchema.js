const mongoose = require("mongoose");

const ALLOWED_TRANSITIONS = {
  OPEN: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "OPEN"],
  IN_PROGRESS: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["IN_PROGRESS", "COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Project title is required"],
    trim: true,
    minlength: [5, "Title must be at least 5 characters"],
    maxlength: [150, "Title cannot exceed 150 characters"],
  },
  description: {
    type: String,
    required: [true, "Project description is required"],
    minlength: [20, "Description must be at least 20 characters"],
    maxlength: [3000, "Description cannot exceed 3000 characters"],
  },
  budget: {
    type: Number,
    required: [true, "Budget is required"],
    min: [1, "Budget must be greater than 0"],
  },
  deadline: {
    type: Date,
    required: [true, "Deadline is required"],
    validate: {
      validator: (v) => v > new Date(),
      message: "Deadline must be in the future",
    },
  },
  status: {
    type: String,
    enum: ["OPEN", "ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED", "CANCELLED"],
    default: "OPEN",
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  solver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  tags: { type: [String], default: [] },
  attachments: [
    {
      url: String,
      publicId: String,
      fileName: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

projectSchema.statics.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;

projectSchema.methods.canTransitionTo = function (newStatus) {
  return (ALLOWED_TRANSITIONS[this.status] || []).includes(newStatus);
};

module.exports = mongoose.model("Project", projectSchema);