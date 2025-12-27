const express = require("express");
const {
  newTaskController,
  getTaskController,
  getTaskDetailController,
} = require("../controllers/tasks.controller");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ ok: true, message: "API is working 🔥" });
});

router.post("/tasks", newTaskController);
router.get("/tasks", getTaskController);
router.get("/tasks/:id", getTaskDetailController);

module.exports = router;
