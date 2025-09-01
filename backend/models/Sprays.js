const mongoose = require("mongoose");

const spraySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sprayName: { type: String, required: true },
  date: { type: Date, required: true },
  crop: { type: String, required: true },
  rate: { type: String, required: true },
  amount: { type: String, required: true },
  location: { type: String, required: true },
  PHI: { type: String, required: true },
  PCP: { type: String, required: true },
});

module.exports = mongoose.model("Sprays", spraySchema);
