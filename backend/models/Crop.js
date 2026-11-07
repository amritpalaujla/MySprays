const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Crop", cropSchema);
