import { z } from "zod";

// Shared spray log (Canada GAP Form H1) form helpers and validation.
// Keep the rules in sync with backend/validation/sprayLog.js.

export const UNIT_OPTIONS = [
  "mL",
  "L",
  "g",
  "kg",
  "fl oz",
  "gal",
  "oz",
  "lb",
  "% solution",
];
export const APPLICATION_METHODS = ["Air Blast", "Weed Sprayer", "Backpack", "Other"];
export const WIND_DIRECTIONS = ["N", "S", "E", "W", "Calm"];
export const WIND_CONDITIONS = ["Calm", "Gusty"];

export const emptyForm = {
  sprayName: "",
  date: "",
  crop: "",
  rate: "",
  amount: "",
  unit: "",
  location: "",
  PHI: "",
  PCP: "",
  growthStage: "",
  reasonForApplication: "",
  areaTreated: "",
  earliestHarvestDate: "",
  applicationMethod: "",
  tankSize: "",
  equipmentInspected: false,
  equipmentCleaned: false,
  temperature: "",
  windDirection: "",
  windCondition: "",
  labelInstructionsFollowed: true,
  applicatorInitials: "",
  notes: "",
};

// Today's date as YYYY-MM-DD in the user's own timezone
// (toISOString would roll over to tomorrow on a BC evening)
export function todayStr() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Earliest harvest date = application date + PHI days
export function calcEarliestHarvest(dateStr, phiStr) {
  if (!dateStr || !phiStr) return "";
  const phiDays = parseInt(phiStr, 10);
  if (isNaN(phiDays)) return "";
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (isNaN(d)) return "";
  d.setUTCDate(d.getUTCDate() + phiDays);
  return d.toISOString().split("T")[0];
}

// Catalog units come in a few spellings ("ml", "gr"); map them onto the dropdown
const UNIT_ALIASES = { ml: "mL", l: "L", gr: "g" };
export function normalizeUnit(unit) {
  const raw = (unit || "").trim();
  const lower = raw.toLowerCase();
  return (
    UNIT_ALIASES[lower] ||
    UNIT_OPTIONS.find((u) => u.toLowerCase() === lower) ||
    raw
  );
}

// Catalog PHIs are text like "14 days" or "14-40 days"; keep just the days,
// taking the longest of a range to be safe. "bloom only" / "—" give "".
export function normalizePhi(phi) {
  const days = String(phi ?? "").match(/\d+/g);
  return days ? String(Math.max(...days.map(Number))) : "";
}

// ── Schema ──

const text = z.preprocess((v) => (v == null ? "" : String(v)), z.string().trim());

const requiredText = (label, max = 100) =>
  text
    .pipe(z.string().min(1, `${label} is required`))
    .pipe(z.string().max(max, `${label} must be ${max} characters or less`));

const optionalText = (label, max = 100) =>
  text.pipe(z.string().max(max, `${label} must be ${max} characters or less`));

const isPositiveNumber = (v) => /^\d*\.?\d+$/.test(v) && Number(v) > 0;

export const sprayLogSchema = z.object({
  date: text
    .pipe(z.string().min(1, "Application date is required"))
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date")
    .refine((v) => v >= "2000-01-01", "Enter a valid date")
    .refine((v) => v <= todayStr(), "Application date can't be in the future"),
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
  unit: text.refine(
    (v) => v === "" || UNIT_OPTIONS.includes(v),
    "Choose a unit from the list"
  ),
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
  earliestHarvestDate: text,

  applicationMethod: z.enum([...APPLICATION_METHODS, ""], {
    error: "Choose an application method from the list",
  }),
  tankSize: optionalText("Tank size", 50).refine(
    (v) => !v.includes("-"),
    "Tank size can't be negative"
  ),
  equipmentInspected: z.boolean(),
  equipmentCleaned: z.boolean(),

  temperature: optionalText("Temperature", 20),
  windDirection: z.enum([...WIND_DIRECTIONS, ""], { error: "Choose a wind direction from the list" }),
  windCondition: z.enum([...WIND_CONDITIONS, ""], { error: "Choose a wind condition from the list" }),

  labelInstructionsFollowed: z.boolean(),
  applicatorInitials: optionalText("Initials", 5).refine(
    (v) => /^[A-Za-z.]*$/.test(v),
    "Initials should be letters only"
  ),
  notes: optionalText("Notes", 500),
});

// Returns { data } when valid, or { errors: { field: message } } when not
export function validateSprayLog(form) {
  const result = sprayLogSchema.safeParse(form);
  if (result.success) return { data: result.data, errors: {} };

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { data: null, errors };
}
