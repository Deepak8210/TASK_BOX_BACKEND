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
const createBulkTasksController = async (req, res) => {
  try {
    const { tasks } = req.body; // ✅ FIX

    console.log("TASKS:", tasks);
    console.log("IS ARRAY:", Array.isArray(tasks));

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Tasks must be a non-empty array",
      });
    }

    const createdTasks = await Task.insertMany(tasks);

    return res.status(201).json({
      status: "success",
      data: createdTasks,
      message: "Bulk tasks created successfully",
    });
  } catch (error) {
    console.error("Error creating bulk tasks:", error);
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

const updateSingleTaskController = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid task ID",
      });
    }

    const { tags, ...payload } = updates || {};
    let tagIds;

    /* ---------- TAG HANDLING ---------- */
    if (Array.isArray(tags)) {
      const slugs = [...new Set(tags.map(normalizeTag))];

      const existingTags = await Tag.find({
        slug: { $in: slugs },
      });

      const existingSlugMap = new Map(
        existingTags.map((tag) => [tag.slug, tag]),
      );

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
          createdTags = await Tag.insertMany(newTags, { ordered: false });
        } catch (err) {
          if (err.code !== 11000) throw err;
        }
      }

      const allTags = [...existingTags, ...createdTags];
      tagIds = allTags.map((t) => t._id);
    }

    /* ---------- BUILD UPDATE QUERY ---------- */
    const updateQuery = {
      $set: {
        ...payload,
        ...(tagIds ? { tagIds } : {}),
      },
    };

    /* ---------- ATTACHMENTS ---------- */
    if (req.files?.length) {
      const attachments = req.files.map((file) => ({
        url: file.path,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      }));
      console.log(req.files);
      updateQuery.$push = {
        attachments: { $each: attachments },
      };
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateQuery, {
      new: true,
    });

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

const updateTaskController = async (req, res) => {
  try {
    const { ids, updates } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Task ids are required",
      });
    }

    const invalidId = ids.find((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidId) {
      return res.status(400).json({
        status: "error",
        message: "One or more task IDs are invalid",
      });
    }

    const { tags, ...payload } = updates || {};
    let tagIds;

    /* ---------- TAG HANDLING ---------- */
    if (Array.isArray(tags)) {
      const slugs = [...new Set(tags.map(normalizeTag))];

      const existingTags = await Tag.find({
        slug: { $in: slugs },
      });

      const existingSlugMap = new Map(
        existingTags.map((tag) => [tag.slug, tag]),
      );

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
          createdTags = await Tag.insertMany(newTags, { ordered: false });
        } catch (err) {
          if (err.code !== 11000) throw err;
        }
      }

      const allTags = [...existingTags, ...createdTags];
      tagIds = allTags.map((t) => t._id);
    }

    /* ---------- UPDATE ---------- */
    const updateDoc = {
      ...payload,
      ...(tagIds ? { tagIds } : {}),
    };

    const result = await Task.updateMany(
      { _id: { $in: ids } },
      { $set: updateDoc },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "No tasks found",
      });
    }

    const updatedTasks = await Task.find({
      _id: { $in: ids },
    });

    return res.status(200).json({
      status: "success",
      data: updatedTasks,
      message: "Task(s) updated successfully",
    });
  } catch (error) {
    console.error("Error updating task(s):", error);

    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

const deleteTasksController = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Task IDs array is required",
      });
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No valid task IDs provided",
      });
    }

    await SubTask.deleteMany({
      taskId: { $in: validIds },
    });

    const result = await Task.deleteMany({
      _id: { $in: validIds },
    });

    return res.status(200).json({
      status: "success",
      message: "Tasks and associated subtasks deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  newTaskController,
  createBulkTasksController,
  getTaskController,
  getTaskDetailController,
  updateSingleTaskController,
  updateTaskController,
  deleteTasksController,
};
