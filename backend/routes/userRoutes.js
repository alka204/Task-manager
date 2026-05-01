const express = require("express");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { getTeamMembers } = require("../controllers/userController");

const router = express.Router();

router.get("/members", auth, role("admin"), getTeamMembers);

module.exports = router;
