import { useRegion } from "../context/RegionContext";

function RegionSelector() {
  const { region, setRegion } = useRegion();

  return (
    <div
      className="region-selector"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginLeft: "auto",
        padding: "8px 12px",
        backgroundColor: "white",
        borderRadius: "8px",
        border: "2px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <label
        htmlFor="region-select"
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
        }}
      >
        Region:
      </label>
      <select
        id="region-select"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        style={{
          padding: "6px 10px",
          fontSize: "14px",
          fontWeight: "500",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          backgroundColor: "white",
          cursor: "pointer",
          color: "#1f2937",
          outline: "none",
        }}
      >
        <option value="CA">🍁 Canada (Metric)</option>
        <option value="US">🇺🇸 USA (Imperial)</option>
      </select>
    </div>
  );
}

export default RegionSelector;
