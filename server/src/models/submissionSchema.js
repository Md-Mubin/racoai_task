const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  solver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, default: null },
  notes: {
    type: String,
    default: "",
  },
  reviewStatus: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    default: "PENDING",
  },
  reviewedAt: { type: Date, default: null },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  version: { type: Number, default: 1 },
}, { timestamps: true });

submissionSchema.index({ task: 1, solver: 1 });
submissionSchema.index({ reviewStatus: 1 });

module.exports = mongoose.model("Submission", submissionSchema);