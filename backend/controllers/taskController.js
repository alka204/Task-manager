const Task = require("../models/Task");
const Project = require("../models/Project");

const createTask = async (req, res) => {
  try {
    const { project, assignedTo } = req.body;

    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (
      !existingProject.members.map((id) => id.toString()).includes(assignedTo.toString())
    ) {
      return res
        .status(400)
        .json({ message: "Assigned member is not part of this project" });
    }

    const task = await Task.create({
      ...req.body,
      createdBy: req.user.userId,
    });

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("project", "name")
      .populate("createdBy", "name email role");

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { assignedTo: req.user.userId };
    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email role")
      .populate("project", "name")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId })
      .populate("assignedTo", "name email role")
      .populate("project", "name")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email role")
      .populate("project", "name")
      .populate("createdBy", "name email role");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role === "member" && task.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can update only your own tasks" });
    }

    task.status = req.body.status;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("project", "name")
      .populate("createdBy", "name email role");

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getAssignedTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
