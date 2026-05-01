const Task = require("../models/Task");

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const match = req.user.role === "admin" ? {} : { assignedTo: req.user.userId };

    const tasks = await Task.find(match).select("status deadline");

    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "Completed").length,
      pendingTasks: tasks.filter((t) => t.status === "Pending").length,
      inProgressTasks: tasks.filter((t) => t.status === "In Progress").length,
      overdueTasks: tasks.filter(
        (t) => new Date(t.deadline) < now && t.status !== "Completed",
      ).length,
    };

    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
