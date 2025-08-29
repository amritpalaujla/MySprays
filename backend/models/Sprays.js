const mongoose = require("mongoose");

const spraySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sprayName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  crop: { type: String },
  rate: { type: String },
  amount: { type: String },
  location: { type: String },
  notes: { type: String },
});

module.exports = mongoose.model("Sprays", spraySchema);
