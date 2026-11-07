const mongoose = require("mongoose");

const spraySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    phi: { type: String, required: true },
    pcp: { type: String, required: true },
    stage: { type: String, required: true },
    // Legacy shared description, replaced by ca/us.description
    description: { type: String },
    ca: {
      rate: { type: String, required: true },
      unit: { type: String },
      description: { type: String },
    },
    us: {
      rate: { type: String, required: true },
      unit: { type: String },
      description: { type: String },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Spray", spraySchema, "spraycatalog");
