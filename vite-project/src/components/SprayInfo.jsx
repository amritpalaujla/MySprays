import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Empty form template matching H1 fields
const emptyForm = {
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

// Helper: calculate earliest harvest date from application date + PHI
function calcEarliestHarvest(dateStr, phiStr) {
  if (!dateStr || !phiStr) return "";
  const phiDays = parseInt(phiStr);
  if (isNaN(phiDays)) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + phiDays);
  return d.toISOString().split("T")[0];
}

// Helper: today's date as YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function SprayInfo({ user }) {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [sprays, setSprays] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("dateDesc");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingSprayId, setEditingSprayId] = useState(null);
  const [userLocations, setUserLocations] = useState([]);
  const [userDefaults, setUserDefaults] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  // Close dropdown menus on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (openMenuId !== null) {
        const menu = document.getElementById(`menu-${openMenuId}`);
        const menuButton = document.getElementById(`menu-button-${openMenuId}`);
        if (
          menu &&
          menuButton &&
          !menu.contains(event.target) &&
          !menuButton.contains(event.target)
        ) {
          setOpenMenuId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openMenuId]);

  // Fetch user defaults and saved locations
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/profile`,
          {
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setUserDefaults(data);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/locations`,
          {
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setUserLocations(data);
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    fetchDefaults();
    fetchLocations();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === "checkbox" ? checked : value;
    const updated = { ...formData, [name]: newVal };

    // Auto-calculate earliest harvest date when date or PHI changes
    if (name === "date" || name === "PHI") {
      const dateVal = name === "date" ? value : formData.date;
      const phiVal = name === "PHI" ? value : formData.PHI;
      updated.earliestHarvestDate = calcEarliestHarvest(dateVal, phiVal);
    }

    setFormData(updated);
  };

  const clearFilters = () => {
    setFilterLocation("");
    setStartDate("");
    setEndDate("");
    setSortOrder("dateDesc");
  };

  const fetchSprays = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterLocation) queryParams.append("location", filterLocation);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (sortOrder) queryParams.append("sort", sortOrder);

      const url = `${
        import.meta.env.VITE_API_URL
      }/sprays?${queryParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("authFailure"));
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSprays(data);
      }
    } catch (err) {
      console.error("Error Fetching sprays:", err);
    }
  };

  useEffect(() => {
    fetchSprays();
  }, [user, filterLocation, startDate, endDate, sortOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingSprayId;
    const url = isEditing
      ? `${import.meta.env.VITE_API_URL}/sprays/${editingSprayId}`
      : `${import.meta.env.VITE_API_URL}/sprays`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("authFailure"));
        return;
      }

      if (res.ok) {
        setFormData({ ...emptyForm });
        setIsModalOpen(false);
        setEditingSprayId(null);
        fetchSprays();
        // Refresh locations in case a new one was added
        try {
          const locRes = await fetch(
            `${import.meta.env.VITE_API_URL}/user/locations`,
            {
              credentials: "include",
            }
          );
          if (locRes.ok) setUserLocations(await locRes.json());
        } catch (_) {}
      }
    } catch (err) {
      console.error("Error saving spray:", err);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this spray log?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/sprays/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent("authFailure"));
          return;
        }
        if (res.ok) fetchSprays();
        else alert("Failed to delete spray log.");
      } catch (err) {
        console.error("Error deleting spray:", err);
        alert("Error deleting spray log");
      }
    }
  };

  const handleEditClick = (spray) => {
    setEditingSprayId(spray._id);
    setFormData({
      ...emptyForm,
      ...spray,
      date: spray.date ? spray.date.split("T")[0] : "",
      earliestHarvestDate: spray.earliestHarvestDate
        ? spray.earliestHarvestDate.split("T")[0]
        : "",
    });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingSprayId(null);
    setFormData({
      ...emptyForm,
      date: todayStr(),
      applicationMethod: userDefaults.defaultApplicationMethod || "",
      tankSize: userDefaults.defaultTankSize || "",
      applicatorInitials: userDefaults.defaultApplicatorInitials || "",
      equipmentInspected: false,
      equipmentCleaned: false,
      labelInstructionsFollowed: true,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="relative w-full h-full">
      {/* Top-right button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openNewModal}
          className="bg-blue-500 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 transition-colors duration-200 text-lg"
        >
          + Log Spray
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-start gap-6 p-6 bg-gray-100 rounded-xl shadow-lg mb-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex flex-col w-full sm:w-auto">
            <label
              htmlFor="location"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              placeholder="e.g. Field 1"
              className="p-3 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <label
              htmlFor="startDate"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <label
              htmlFor="endDate"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
        <div className="flex flex-col w-full sm:w-auto md:w-1/4">
          <label
            htmlFor="sortOrder"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Sort by
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dateDesc">Date (Newest First)</option>
            <option value="dateAsc">Date (Oldest First)</option>
          </select>
        </div>
        <div className="flex flex-col w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Spray Logs List */}
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">My Spray Logs</h3>
        {sprays.length > 0 ? (
          <ul className="space-y-2">
            {sprays.map((spray) => (
              <li
                key={spray._id}
                className="relative p-6 border border-gray-200 rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow duration-300"
              >
                {/* Options button */}
                <button
                  id={`menu-button-${spray._id}`}
                  onClick={() =>
                    setOpenMenuId(openMenuId === spray._id ? null : spray._id)
                  }
                  className="absolute top-2 right-2 text-xl font-bold p-1 rounded-full text-gray-500 hover:bg-gray-200"
                >
                  ...
                </button>

                {openMenuId === spray._id && (
                  <div
                    id={`menu-${spray._id}`}
                    className="absolute top-10 right-2 flex flex-col space-y-1 bg-white border rounded shadow-lg z-10"
                  >
                    <button
                      onClick={() => handleEditClick(spray)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(spray._id)}
                      className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}

                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  {spray.sprayName}
                </h4>

                {/* Always visible summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-800">Date:</span>{" "}
                    {spray.date?.split("T")[0]}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Crop:</span>{" "}
                    {spray.crop}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">
                      Location:
                    </span>{" "}
                    {spray.location}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Rate:</span>{" "}
                    {spray.rate} {spray.unit || ""} per acre
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Amount:</span>{" "}
                    {spray.amount} {spray.unit || ""}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">PCP#:</span>{" "}
                    {spray.PCP}
                  </p>
                </div>

                {/* Expand / Collapse for full H1 details */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === spray._id ? null : spray._id)
                  }
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  {expandedId === spray._id
                    ? "Hide Details"
                    : "View Full H1 Details"}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedId === spray._id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {expandedId === spray._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold text-gray-800">PHI:</span>{" "}
                      {spray.PHI}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Earliest Harvest:
                      </span>{" "}
                      {spray.earliestHarvestDate?.split("T")[0] || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Area Treated:
                      </span>{" "}
                      {spray.areaTreated || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Growth Stage:
                      </span>{" "}
                      {spray.growthStage || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Reason:
                      </span>{" "}
                      {spray.reasonForApplication || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Method:
                      </span>{" "}
                      {spray.applicationMethod || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Tank Size:
                      </span>{" "}
                      {spray.tankSize || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Temperature:
                      </span>{" "}
                      {spray.temperature || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">Wind:</span>{" "}
                      {spray.windDirection || "N/A"}{" "}
                      {spray.windCondition ? `(${spray.windCondition})` : ""}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Equipment Inspected:
                      </span>{" "}
                      {spray.equipmentInspected ? "Yes" : "No"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Equipment Cleaned:
                      </span>{" "}
                      {spray.equipmentCleaned ? "Yes" : "No"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Label Followed:
                      </span>{" "}
                      {spray.labelInstructionsFollowed ? "Yes" : "No"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">
                        Applicator:
                      </span>{" "}
                      {spray.applicatorInitials || "N/A"}
                    </p>
                    {spray.notes && (
                      <p className="sm:col-span-2">
                        <span className="font-semibold text-gray-800">
                          Notes:
                        </span>{" "}
                        {spray.notes}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            No spray logs found. Log a new spray to see it here!
          </p>
        )}
      </div>

      {/* ======== H1 FORM MODAL ======== */}
      {isModalOpen &&
        createPortal(
          <div className="modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative max-h-[85vh] overflow-y-auto mx-auto my-auto">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSprayId(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 z-10"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold mb-1 text-gray-800">
                {editingSprayId ? "Edit Spray Log" : "Log New Spray"}
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Canada GAP Form H1 — Agricultural Chemicals Application
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ── Section: Application Info ── */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    Application Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Application Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Crop *</label>
                      <input
                        name="crop"
                        value={formData.crop}
                        onChange={handleChange}
                        placeholder="e.g. Cherries"
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Location (Block/Variety) *
                      </label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Block A - Lapins"
                        className="form-input"
                        list="location-list"
                        required
                      />
                      <datalist id="location-list">
                        {userLocations.map((loc) => (
                          <option key={loc} value={loc} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="form-label">Growth Stage</label>
                      <input
                        name="growthStage"
                        value={formData.growthStage}
                        onChange={handleChange}
                        placeholder="e.g. Petal fall"
                        className="form-input"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="form-label">
                        Reason for Application
                      </label>
                      <input
                        name="reasonForApplication"
                        value={formData.reasonForApplication}
                        onChange={handleChange}
                        placeholder="e.g. Brown Rot prevention"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section: Product Info ── */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    Product Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Product Trade Name *</label>
                      <input
                        name="sprayName"
                        value={formData.sprayName}
                        onChange={handleChange}
                        placeholder="e.g. Pristine WG"
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">PCP # *</label>
                      <input
                        name="PCP"
                        value={formData.PCP}
                        onChange={handleChange}
                        placeholder="e.g. 27985"
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Rate per Acre *</label>
                      <input
                        name="rate"
                        value={formData.rate}
                        onChange={handleChange}
                        placeholder="e.g. 300"
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Unit</label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="">Select...</option>
                        <option value="mL">mL</option>
                        <option value="L">L</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="fl oz">fl oz</option>
                        <option value="gal">gal</option>
                        <option value="oz">oz</option>
                        <option value="lb">lb</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Area Treated (acres)</label>
                      <input
                        name="areaTreated"
                        value={formData.areaTreated}
                        onChange={handleChange}
                        placeholder="e.g. 25"
                        type="number"
                        step="any"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Actual Quantity in Tank *
                      </label>
                      <input
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Total product used"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section: PHI & Harvest ── */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    PHI & Harvest
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">PHI (Days) *</label>
                      <input
                        name="PHI"
                        value={formData.PHI}
                        onChange={handleChange}
                        placeholder="e.g. 14"
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Earliest Allowable Harvest Date
                      </label>
                      <input
                        type="date"
                        name="earliestHarvestDate"
                        value={formData.earliestHarvestDate}
                        className="form-input bg-gray-50"
                        readOnly
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Auto-calculated from date + PHI
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Section: Equipment & Method ── */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    Equipment & Method
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Application Method</label>
                      <select
                        name="applicationMethod"
                        value={formData.applicationMethod}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="">Select...</option>
                        <option value="Air Blast">Air Blast</option>
                        <option value="Weed Sprayer">Weed Sprayer</option>
                        <option value="Backpack">Backpack</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Tank Size</label>
                      <input
                        name="tankSize"
                        value={formData.tankSize}
                        onChange={handleChange}
                        placeholder="e.g. 400 L"
                        className="form-input"
                      />
                    </div>
                    <div className="flex items-center gap-6 sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="equipmentInspected"
                          checked={formData.equipmentInspected}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Equipment Inspected
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="equipmentCleaned"
                          checked={formData.equipmentCleaned}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Equipment Cleaned
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ── Section: Weather Conditions ── */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    Weather Conditions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Temperature</label>
                      <input
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        placeholder="e.g. 22°C"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Wind Direction</label>
                      <div className="flex gap-1 flex-wrap">
                        {["N", "S", "E", "W", "Calm"].map((dir) => (
                          <button
                            key={dir}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, windDirection: dir })
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              formData.windDirection === dir
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {dir}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Wind Condition</label>
                      <div className="flex gap-2">
                        {["Calm", "Gusty"].map((cond) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, windCondition: cond })
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex-1 ${
                              formData.windCondition === cond
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {cond}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section: Compliance ── */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    Compliance
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Applicator Initials</label>
                      <input
                        name="applicatorInitials"
                        value={formData.applicatorInitials}
                        onChange={handleChange}
                        placeholder="e.g. AA"
                        className="form-input"
                        maxLength={5}
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer mt-6">
                        <input
                          type="checkbox"
                          name="labelInstructionsFollowed"
                          checked={formData.labelInstructionsFollowed}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Label Instructions Followed
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ── Section: Notes ── */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    Notes
                  </h3>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional notes (optional)"
                    maxLength={500}
                    rows={3}
                    className="form-input resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {formData.notes?.length || 0}/500
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 mt-6"
                >
                  {editingSprayId ? "Update Spray Log" : "Save Spray Log"}
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default SprayInfo;
