const { Schema, model } = require("mongoose");

const subTaskSchema = new Schema(
  {
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  },
  { timestamps: true }
);

const SubTask = model("SubTask", subTaskSchema);

module.exports = SubTask;
