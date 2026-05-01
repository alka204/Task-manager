const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

const createProject = async (req, res) => {
  try {
    const { name, description, members = [] } = req.body;

    const uniqueMembers = [...new Set([...members, req.user.userId])];
    const validMembers = await User.find({ _id: { $in: uniqueMembers } }).select("_id");

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.userId,
      members: validMembers.map((u) => u._id),
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { $or: [{ members: req.user.userId }, { createdBy: req.user.userId }] };

    const projects = await Project.find(filter)
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.json({ project, tasks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (!project.members.map((id) => id.toString()).includes(memberId)) {
      project.members.push(memberId);
      await project.save();
    }

    return res.json({ message: "Member added", project });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.members = project.members.filter((id) => id.toString() !== memberId);
    await project.save();

    return res.json({ message: "Member removed", project });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Task.deleteMany({ project: req.params.id });
    return res.json({ message: "Project deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
};
