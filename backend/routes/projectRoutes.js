const express = require("express");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createProjectValidator,
  projectIdParamValidator,
  memberPayloadValidator,
} = require("../validators/projectValidator");
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

router.post(
  "/",
  auth,
  role("admin"),
  createProjectValidator,
  validateRequest,
  createProject,
);
router.get("/", auth, getProjects);
router.get("/:id", auth, projectIdParamValidator, validateRequest, getProjectById);
router.patch(
  "/:id/members/add",
  auth,
  role("admin"),
  memberPayloadValidator,
  validateRequest,
  addMember,
);
router.patch(
  "/:id/members/remove",
  auth,
  role("admin"),
  memberPayloadValidator,
  validateRequest,
  removeMember,
);
router.delete(
  "/:id",
  auth,
  role("admin"),
  projectIdParamValidator,
  validateRequest,
  deleteProject,
);

module.exports = router;
