import { useId, useMemo, useState } from "react";

const MAX_RESULTS = 8;

// Product name box that suggests sprays from the catalog as you type.
// Picking one calls onSelect with the catalog entry; anything typed that
// isn't in the catalog is kept as a free-text product name.
function ProductSearch({
  value,
  onChange,
  onSelect,
  sprays,
  preferredCrop = "",
  name = "sprayName",
  invalid = false,
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const listId = useId();

  const matches = useMemo(() => {
    const query = (value || "").trim().toLowerCase();
    if (!query) return [];
    const crop = preferredCrop.trim().toLowerCase();

    // Name starts with the query first, then the crop being logged, then A–Z
    const score = (s) =>
      (s.name.toLowerCase().startsWith(query) ? 0 : 2) +
      (crop && s.crop.toLowerCase() === crop ? 0 : 1);

    return sprays
      .filter((s) => s.name.toLowerCase().includes(query))
      .sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name))
      .slice(0, MAX_RESULTS);
  }, [value, sprays, preferredCrop]);

  const showList = open && matches.length > 0;

  const choose = (spray) => {
    onSelect(spray);
    setOpen(false);
    setHighlight(-1);
  };

  const handleKeyDown = (e) => {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? matches.length - 1 : h - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      choose(matches[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        name={name}
        value={value}
        onChange={(e) => {
          onChange(e);
          setOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        placeholder="Search the catalog or type a product"
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        className={`form-input${invalid ? " input-error" : ""}`}
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg text-left"
        >
          {matches.map((spray, i) => (
            <li
              key={`${spray.crop}-${spray.issue}-${spray.name}`}
              role="option"
              aria-selected={i === highlight}
              // mousedown (not click) so it fires before the input's blur
              onMouseDown={(e) => {
                e.preventDefault();
                choose(spray);
              }}
              onMouseEnter={() => setHighlight(i)}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                i === highlight ? "bg-blue-50" : "bg-white"
              }`}
            >
              <div className="text-sm font-medium text-gray-800">
                {spray.name}
              </div>
              <div className="text-xs text-gray-500">
                {spray.crop} · {spray.issue}
                {spray.pcp ? ` · PCP ${spray.pcp}` : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-400 mt-1">
        Pick from the list to fill in PCP #, rate and PHI, or type any product.
      </p>
    </div>
  );
}

export default ProductSearch;
