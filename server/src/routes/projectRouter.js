const express = require("express");
const projectRouter = express.Router();
const { getAllProjects, createProject, getProject, updateProject, deleteProject, assignSolver, transitionStatus } = require("../controllers/projectController");
const { createRequest, getProjectRequests } = require("../controllers/requestController");
const { createTask, getProjectTasks, getTask, updateTask, updateTaskStatus, deleteTask } = require("../controllers/taskController");
const { protect, authorize } = require("../middleware/auth");

// Projects
projectRouter.route("/")
  .get(protect, getAllProjects)
  .post(protect, authorize("BUYER"), createProject);
  
projectRouter.route("/:id")
  .get(protect, getProject)
  .patch(protect, authorize("BUYER"), updateProject)
  .delete(protect, authorize("BUYER"), deleteProject);

projectRouter.patch("/:id/assign", protect, authorize("BUYER"), assignSolver);
projectRouter.patch("/:id/status", protect, authorize("BUYER", "ADMIN"), transitionStatus);

// Requests (nested)
projectRouter.post("/:projectId/requests", protect, authorize("PROBLEM_SOLVER"), createRequest);
projectRouter.get("/:projectId/requests", protect, authorize("BUYER", "ADMIN"), getProjectRequests);

// Tasks (nested)
projectRouter.post("/:projectId/tasks", protect, authorize("PROBLEM_SOLVER"), createTask);
projectRouter.get("/:projectId/tasks", protect, getProjectTasks);
projectRouter.get("/:projectId/tasks/:taskId", protect, getTask);
projectRouter.patch("/:projectId/tasks/:taskId", protect, authorize("PROBLEM_SOLVER", "ADMIN"), updateTask);
projectRouter.patch("/:projectId/tasks/:taskId/status", protect, updateTaskStatus);
projectRouter.delete("/:projectId/tasks/:taskId", protect, authorize("PROBLEM_SOLVER", "ADMIN"), deleteTask);

module.exports = projectRouter;