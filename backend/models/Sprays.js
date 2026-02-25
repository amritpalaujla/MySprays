const mongoose = require("mongoose");

const spraySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // === APPLICATION INFO ===
  date: { type: Date, required: true },
  crop: { type: String, required: true },
  location: { type: String, required: true }, // Block/Variety
  growthStage: { type: String },
  reasonForApplication: { type: String },

  // === PRODUCT INFO ===
  sprayName: { type: String, required: true }, // Product Trade Name
  PCP: { type: String, required: true }, // Product Registration Number
  rate: { type: String, required: true }, // Rate per Area/Unit Applied
  unit: { type: String }, // mL, fl oz, g, oz, etc.
  amount: { type: String, required: true }, // Actual Quantity in Tank
  areaTreated: { type: String }, // # acres/ha

  // === PHI & HARVEST ===
  PHI: { type: String, required: true }, // Pre-Harvest Interval (days)
  earliestHarvestDate: { type: Date }, // Auto-calculated from date + PHI

  // === APPLICATION METHOD & EQUIPMENT ===
  applicationMethod: {
    type: String,
    enum: ["Air Blast", "Weed Sprayer", "Backpack", "Other", ""],
    default: "",
  },
  tankSize: { type: String },
  equipmentInspected: { type: Boolean, default: false },
  equipmentCleaned: { type: Boolean, default: false },

  // === WEATHER CONDITIONS ===
  temperature: { type: String },
  windDirection: {
    type: String,
    enum: ["N", "S", "E", "W", "Calm", ""],
    default: "",
  },
  windCondition: {
    type: String,
    enum: ["Calm", "Gusty", ""],
    default: "",
  },

  // === COMPLIANCE ===
  labelInstructionsFollowed: { type: Boolean, default: true },
  applicatorInitials: { type: String },

  // === NOTES ===
  notes: { type: String, maxlength: 500 },
});

module.exports = mongoose.model("Sprays", spraySchema);
