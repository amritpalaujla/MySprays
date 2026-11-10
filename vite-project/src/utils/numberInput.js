// Helpers that keep number boxes from ever holding a negative value.

// Keys that would make a number negative or switch to scientific notation (1e5)
const BLOCKED_KEYS = ["-", "+", "e", "E"];

export function blockNegativeKeys(e) {
  if (BLOCKED_KEYS.includes(e.key)) e.preventDefault();
}

// Allows partial typing like "", "0." and "12.5", but never a sign
export const isNonNegativeDecimal = (value) => /^\d*\.?\d*$/.test(value);
export const isNonNegativeWhole = (value) => /^\d*$/.test(value);

// Spray log fields that only take numbers, and what each one allows
const LOG_NUMBER_FIELDS = {
  areaTreated: isNonNegativeDecimal,
  amount: isNonNegativeDecimal,
  PHI: isNonNegativeWhole,
};

// True when a typed/pasted value should be ignored for a spray log field
export function rejectsLogInput(name, value) {
  const allowed = LOG_NUMBER_FIELDS[name];
  return !!allowed && !allowed(value);
}
