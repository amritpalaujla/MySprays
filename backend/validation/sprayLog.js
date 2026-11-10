const { z } = require("zod");

// Validation for spray logs (POST/PUT /sprays).
// Keep the rules in sync with vite-project/src/utils/sprayLog.js.

const APPLICATION_METHODS = ["Air Blast", "Weed Sprayer", "Backpack", "Other"];
const WIND_DIRECTIONS = ["N", "S", "E", "W", "Calm"];
const WIND_CONDITIONS = ["Calm", "Gusty"];

// Allows one extra day so a grower ahead of UTC isn't rejected
function latestAllowedDate() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split("T")[0];
}

function calcEarliestHarvest(dateStr, phiStr) {
  const phiDays = parseInt(phiStr, 10);
  if (isNaN(phiDays)) return null;
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + phiDays);
  return d;
}

const text = z.preprocess((v) => (v == null ? "" : String(v)), z.string().trim());

const requiredText = (label, max = 100) =>
  text
    .pipe(z.string().min(1, `${label} is required`))
    .pipe(z.string().max(max, `${label} must be ${max} characters or less`));

const optionalText = (label, max = 100) =>
  text.pipe(z.string().max(max, `${label} must be ${max} characters or less`));

const isPositiveNumber = (v) => /^\d*\.?\d+$/.test(v) && Number(v) > 0;

const sprayLogSchema = z.object({
  // Edits send the stored date back, which may include a time part
  date: text
    .transform((v) => v.split("T")[0])
    .pipe(z.string().min(1, "Application date is required"))
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date")
    .refine((v) => v >= "2000-01-01", "Enter a valid date")
    .refine(
      (v) => v <= latestAllowedDate(),
      "Application date can't be in the future"
    ),
  crop: requiredText("Crop"),
  location: requiredText("Location"),
  growthStage: optionalText("Growth stage"),
  reasonForApplication: optionalText("Reason for application", 200),

  sprayName: requiredText("Product name", 150),
  PCP: requiredText("PCP #", 20).refine(
    (v) => /^\d[\d-]*$/.test(v),
    "PCP # should only contain numbers (and dashes for US EPA numbers)"
  ),
  rate: requiredText("Rate", 50),
  unit: optionalText("Unit", 20),
  amount: text
    .pipe(z.string().min(1, "Quantity in tank is required"))
    .refine(isPositiveNumber, "Quantity must be a number greater than 0"),
  areaTreated: text.refine(
    (v) => v === "" || isPositiveNumber(v),
    "Area must be a number greater than 0"
  ),

  PHI: text
    .pipe(z.string().min(1, "PHI is required (enter 0 if there is none)"))
    .refine((v) => /^\d+$/.test(v), "PHI must be a whole number of days")
    .refine((v) => Number(v) <= 365, "PHI must be 365 days or less"),

  applicationMethod: z
    .enum([...APPLICATION_METHODS, ""], {
      error: "Choose an application method from the list",
    })
    .default(""),
  tankSize: optionalText("Tank size", 50).refine(
    (v) => !v.includes("-"),
    "Tank size can't be negative"
  ),
  equipmentInspected: z.boolean().default(false),
  equipmentCleaned: z.boolean().default(false),

  temperature: optionalText("Temperature", 20),
  windDirection: z.enum([...WIND_DIRECTIONS, ""], { error: "Choose a wind direction from the list" }).default(""),
  windCondition: z.enum([...WIND_CONDITIONS, ""], { error: "Choose a wind condition from the list" }).default(""),

  labelInstructionsFollowed: z.boolean().default(true),
  applicatorInitials: optionalText("Initials", 5).refine(
    (v) => /^[A-Za-z.]*$/.test(v),
    "Initials should be letters only"
  ),
  notes: optionalText("Notes", 500),
});

// Express-style helper: returns the cleaned spray fields, or sends a 400 with
// per-field messages and returns null. Unknown fields (userId, _id) are dropped.
function parseSprayLog(req, res) {
  const result = sprayLogSchema.safeParse(req.body ?? {});
  if (!result.success) {
    const fieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    res
      .status(400)
      .json({ error: "Please fix the highlighted fields.", fieldErrors });
    return null;
  }

  const data = result.data;
  // Always derive the harvest date here rather than trusting the client
  data.earliestHarvestDate = calcEarliestHarvest(data.date, data.PHI);
  return data;
}

module.exports = { sprayLogSchema, parseSprayLog };
