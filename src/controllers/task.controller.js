const mongoose = require("mongoose");
const Task = require("../models/Task");
const Tag = require("../models/Tag");
const SubTask = require("../models/Subtask");

const TAG_COLORS = [
  "red",
  "yellow",
  "blue",
  "green",
  "purple",
  "orange",
  "teal",
];

const normalizeTag = (name) => name.trim().toLowerCase();

const capitalize = (slug) => slug.charAt(0).toUpperCase() + slug.slice(1);

const getRandomColor = () =>
  TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

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

    const task = await Task.findById(id).populate("tagIds", "name color");

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

const updateTaskController = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags, ...payload } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid task ID",
      });
    }

    let tagIds;

    if (Array.isArray(tags)) {
      const slugs = [...new Set(tags.map(normalizeTag))];

      const existingTags = await Tag.find({
        slug: { $in: slugs },
      });

      const existingSlugMap = new Map(existingTags.map((t) => [t.slug, t]));

      const newTags = slugs
        .filter((slug) => !existingSlugMap.has(slug))
        .map((slug) => ({
          name: capitalize(slug),
          slug,
          color: getRandomColor(),
        }));

      let createdTags = [];
      if (newTags.length) {
        try {
          createdTags = await Tag.insertMany(newTags, {
            ordered: false,
          });
        } catch (err) {
          if (err.code !== 11000) throw err;
        }
      }

      const allTags = [...existingTags, ...createdTags];
      tagIds = allTags.map((t) => t._id);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        ...payload,
        ...(tagIds ? { tagIds } : {}),
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: updatedTask,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Error updating task:", error);

    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

const deleteTaskController = async (req, res) => {
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

    await SubTask.deleteMany({ taskId: id });

    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      status: "success",
      message: "Task and associated subtasks deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  newTaskController,
  getTaskController,
  getTaskDetailController,
  updateTaskController,
  deleteTaskController,
};
