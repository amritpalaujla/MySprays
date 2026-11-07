const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
    },
    images: { type: [String] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Issue", issueSchema);
