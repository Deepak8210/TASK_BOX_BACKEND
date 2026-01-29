const { Schema, model } = require("mongoose");

const attachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const taskSchema = new Schema(
  {
    taskTitle: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["Work", "Personal", "Urgent", "Other"],
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["not started", "in progress", "completed"],
      default: "not started",
    },
    tagIds: {
      type: [Schema.Types.ObjectId],
      ref: "Tag",
      default: [],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1 });

taskSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Task = model("Task", taskSchema);

module.exports = Task;
