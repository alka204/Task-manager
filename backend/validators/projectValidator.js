const { body, param } = require("express-validator");

const objectIdRule = (field) =>
  body(field).isMongoId().withMessage(`${field} must be a valid ObjectId`);

const createProjectValidator = [
  body("name").trim().notEmpty().withMessage("Project name is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Project description is required"),
  body("members")
    .optional()
    .isArray()
    .withMessage("Members must be an array of user ids"),
];

const projectIdParamValidator = [
  param("id").isMongoId().withMessage("Project id must be valid"),
];

const memberPayloadValidator = [
  objectIdRule("memberId"),
  param("id").isMongoId().withMessage("Project id must be valid"),
];

module.exports = {
  createProjectValidator,
  projectIdParamValidator,
  memberPayloadValidator,
};
