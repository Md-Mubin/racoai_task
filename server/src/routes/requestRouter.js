const express = require("express");
const requestRouter = express.Router();
const { getMyRequests, getRequest, withdrawRequest } = require("../controllers/requestController");
const { protect, authorize } = require("../middleware/auth");

requestRouter.get("/mine", protect, authorize("PROBLEM_SOLVER"), getMyRequests);
requestRouter.get("/:requestId", protect, getRequest);
requestRouter.delete("/:requestId/withdraw", protect, authorize("PROBLEM_SOLVER"), withdrawRequest);

module.exports = requestRouter;