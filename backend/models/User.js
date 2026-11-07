const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  // Region preference
  region: {
    type: String,
    enum: ["CA", "US"],
    default: "CA",
  },

  // === GROWER PROFILE (for H1 form header) ===
  growerName: { type: String, default: "" },
  growerLotNumbers: { type: String, default: "" },

  // === DEFAULTS (remembered from last entry) ===
  defaultApplicationMethod: {
    type: String,
    enum: ["Air Blast", "Weed Sprayer", "Backpack", "Other", ""],
    default: "",
  },
  defaultTankSize: { type: String, default: "" },
  defaultApplicatorInitials: { type: String, default: "" },

  // === SAVED LOCATIONS (blocks/varieties for the spray log dropdown) ===
  locations: { type: [String], default: [] },
  // Set once locations from older spray logs have been copied over
  locationsMigrated: { type: Boolean, default: false },

  // Email verification fields
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpires: {
    type: Date,
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
