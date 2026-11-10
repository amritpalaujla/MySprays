import { useState } from "react";

const NEW_OPTION = "__new__";

// Dropdown of the user's saved locations, with a "+ New location" option
// that switches to a text box. onChange gets an input-like event so it plugs
// straight into the log forms' handleChange.
function LocationPicker({
  value,
  onChange,
  locations,
  name = "location",
  invalid = false,
}) {
  const [addingNew, setAddingNew] = useState(false);
  const inputClass = `form-input${invalid ? " input-error" : ""}`;

  const current = (value || "").trim().toLowerCase();
  const savedMatch = locations.find((l) => l.toLowerCase() === current);
  const showInput =
    addingNew || locations.length === 0 || (current && !savedMatch);

  const emit = (newValue) =>
    onChange({ target: { name, value: newValue, type: "text" } });

  if (showInput) {
    return (
      <div>
        <input
          name={name}
          value={value}
          onChange={(e) => {
            // Stay in text mode while typing, even if the box is cleared
            setAddingNew(true);
            onChange(e);
          }}
          placeholder="e.g. Block A - Lapins"
          className={inputClass}
          autoFocus={addingNew}
          required
        />
        {locations.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setAddingNew(false);
              emit("");
            }}
            style={{ padding: 0, border: "none", background: "none" }}
            className="mt-1 text-xs font-medium text-blue-600 hover:underline"
          >
            Choose a saved location
          </button>
        )}
      </div>
    );
  }

  return (
    <select
      name={name}
      value={savedMatch || ""}
      onChange={(e) => {
        if (e.target.value === NEW_OPTION) {
          setAddingNew(true);
          emit("");
        } else {
          emit(e.target.value);
        }
      }}
      className={inputClass}
      required
    >
      <option value="">Select a location...</option>
      {locations.map((loc) => (
        <option key={loc} value={loc}>
          {loc}
        </option>
      ))}
      <option value={NEW_OPTION}>+ New location…</option>
    </select>
  );
}

export default LocationPicker;
