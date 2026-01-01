const { Schema, model } = require("mongoose");

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    color: {
      type: String,
      required: true,
      enum: ["red", "yellow", "blue", "green", "purple", "orange", "teal"],
    },
  },
  {
    timestamps: true,
  }
);

tagSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.trim().toLowerCase();
  }
  next();
});

const Tag = model("Tag", tagSchema);

module.exports = Tag;
