const { body, param } = require("express-validator");

const createTaskValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Invalid status"),
  body("priority")
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("deadline").isISO8601().withMessage("Deadline must be a valid date"),
  body("assignedTo").isMongoId().withMessage("assignedTo must be a valid user id"),
  body("project").isMongoId().withMessage("project must be a valid project id"),
];

const updateTaskValidator = [
  param("id").isMongoId().withMessage("Task id must be valid"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Invalid priority"),
  body("deadline").optional().isISO8601().withMessage("Invalid deadline"),
  body("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("assignedTo must be a valid user id"),
  body("project")
    .optional()
    .isMongoId()
    .withMessage("project must be a valid project id"),
];

const taskIdParamValidator = [
  param("id").isMongoId().withMessage("Task id must be valid"),
];

const updateTaskStatusValidator = [
  param("id").isMongoId().withMessage("Task id must be valid"),
  body("status")
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Invalid status"),
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  taskIdParamValidator,
  updateTaskStatusValidator,
};
