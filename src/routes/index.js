const express = require("express");
const {
  newTaskController,
  getTaskController,
  getTaskDetailController,
  updateTaskController,
  deleteTaskController,
} = require("../controllers/task.controller");
const {
  newSubtaskController,
  getSubtasksController,
  updateSubtaskController,
} = require("../controllers/subtask.controller");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ ok: true, message: "API is working 🔥" });
});

router.post("/tasks", newTaskController);
router.get("/tasks", getTaskController);
router.get("/tasks/:id", getTaskDetailController);
router.put("/tasks/:id", updateTaskController);
router.delete("/tasks/:id", deleteTaskController);
router.post("/tasks/:taskId/subtasks", newSubtaskController);
router.get("/tasks/:taskId/subtasks", getSubtasksController);
router.patch("/tasks/:taskId/subtasks/:subtaskId", updateSubtaskController);

module.exports = router;
