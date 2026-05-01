const express = require("express");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createTaskValidator,
  updateTaskValidator,
  taskIdParamValidator,
  updateTaskStatusValidator,
} = require("../validators/taskValidator");
const {
  createTask,
  getTasks,
  getAssignedTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

router.post(
  "/",
  auth,
  role("admin"),
  createTaskValidator,
  validateRequest,
  createTask,
);
router.get("/", auth, getTasks);
router.get("/assigned", auth, getAssignedTasks);
router.put(
  "/:id",
  auth,
  role("admin"),
  updateTaskValidator,
  validateRequest,
  updateTask,
);
router.patch(
  "/:id/status",
  auth,
  updateTaskStatusValidator,
  validateRequest,
  updateTaskStatus,
);
router.delete(
  "/:id",
  auth,
  role("admin"),
  taskIdParamValidator,
  validateRequest,
  deleteTask,
);

module.exports = router;
