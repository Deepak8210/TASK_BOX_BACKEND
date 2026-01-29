const express = require("express");
const {
  newTaskController,
  getTaskController,
  getTaskDetailController,
  updateSingleTaskController,
  updateTaskController,
  deleteTasksController,
  createBulkTasksController,
} = require("../controllers/task.controller");
const {
  newSubtaskController,
  getSubtasksController,
  updateSubtaskController,
} = require("../controllers/subtask.controller");

const { uploadMultiple } = require("../middleware/upload");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ ok: true, message: "API is working 🔥" });
});

router.post("/tasks", newTaskController);
router.post("/tasks/bulk", createBulkTasksController);
router.get("/tasks", getTaskController);
router.get("/tasks/:id", getTaskDetailController);
router.put(
  "/tasks/:id",
  uploadMultiple("attachments", 10),
  updateSingleTaskController,
);
router.put("/tasks", updateTaskController);
router.delete("/tasks", deleteTasksController);
router.post("/tasks/:taskId/subtasks", newSubtaskController);
router.get("/tasks/:taskId/subtasks", getSubtasksController);
router.patch("/tasks/:taskId/subtasks/:subtaskId", updateSubtaskController);

module.exports = router;
