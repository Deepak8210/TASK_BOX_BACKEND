const mongoose = require("mongoose");
const Subtask = require("../models/Subtask");
const Task = require("../models/Task");

const newSubtaskController = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, ...payload } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid task ID",
      });
    }

    const taskExists = await Task.exists({ _id: taskId });
    if (!taskExists) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Subtask title is required",
      });
    }

    const newSubtask = await Subtask.create({
      title: title.trim(),
      taskId,
      ...payload,
    });

    return res.status(201).json({
      status: "success",
      data: newSubtask,
    });
  } catch (error) {
    console.error("Error creating subtask:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getSubtasksController = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid task ID",
      });
    }
    const subtasks = await Subtask.find({ taskId });
    return res.status(200).json({
      status: "success",
      data: subtasks,
    });
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateSubtaskController = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const payload = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(subtaskId)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid task or subtask ID",
      });
    }

    const updatedSubtask = await Subtask.findOneAndUpdate(
      { _id: subtaskId, taskId },
      { $set: payload },
      { new: true }
    );

    if (!updatedSubtask) {
      return res.status(404).json({
        status: "error",
        message: "Subtask not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: updatedSubtask,
      message: "Subtask updated successfully",
    });
  } catch (error) {
    console.error("Error updating subtask:", error);

    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  newSubtaskController,
  getSubtasksController,
  updateSubtaskController,
};
