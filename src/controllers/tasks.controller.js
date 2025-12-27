const mongoose = require("mongoose");
const Task = require("../models/tasks.model");

const newTaskController = async (req, res) => {
  try {
    const payload = req.body;
    const newTask = await Task.create(payload);

    return res.status(201).json({
      status: "success",
      data: newTask,
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Error creating task:", error);

    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

const getTaskController = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: "success",
      data: tasks,
      message: tasks.length ? "Tasks fetched successfully" : "No tasks found",
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);

    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

const getTaskDetailController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: task,
      message: "Task details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching task details:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  newTaskController,
  getTaskController,
  getTaskDetailController,
};
