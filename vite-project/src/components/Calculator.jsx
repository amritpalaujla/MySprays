import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { getSprayData } from "../assets/sprayData";
import { useRegion } from "../context/RegionContext";
import sprayTank from "../assets/tanker.png";
import partialSprayTank from "../assets/partialTanker.png";

function calcEarliestHarvest(dateStr, phiStr) {
  if (!dateStr || !phiStr) return "";
  const phiDays = parseInt(phiStr);
  if (isNaN(phiDays)) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + phiDays);
  return d.toISOString().split("T")[0];
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

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

function Calculator({ user }) {
  const location = useLocation();
  const chosenSpray = location.state?.chosenSpray ?? null;
  const { region, getUnitLabels } = useRegion();
  const units = getUnitLabels();
  const sprayData = getSprayData(region);

  const [allSprays, setAllSprays] = useState([]);
  const [area, setArea] = useState("");
  const [waterVolume, setWaterVolume] = useState("");
  const [tankSize, setTankSize] = useState("");
  const [sprayRate, setSprayRate] = useState("");
  const [selectedSprayKey, setSelectedSprayKey] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [userDefaults, setUserDefaults] = useState({});
  const [userLocations, setUserLocations] = useState([]);

  const selectedSpray = allSprays.find(
    (spray) => `${spray.crop}-${spray.issue}-${spray.name}` === selectedSprayKey
  );

  useEffect(() => {
    if (!user) return;
    const fetchDefaults = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/profile`,
          { credentials: "include" }
        );
        if (res.ok) setUserDefaults(await res.json());
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/locations`,
          { credentials: "include" }
        );
        if (res.ok) setUserLocations(await res.json());
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
    if (name === "date" || name === "PHI") {
      updated.earliestHarvestDate = calcEarliestHarvest(
        name === "date" ? value : formData.date,
        name === "PHI" ? value : formData.PHI
      );
    }
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sprays`, {
        method: "POST",
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
      } else {
        const data = await res.json();
        alert(`Failed to save spray: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving spray:", err);
      alert(`Network error: ${err.message}`);
    }
  };

  const openModal = () => {
    if (selectedSpray) {
      const totalProduct = parseFloat(sprayRate) * parseFloat(area);
      const today = todayStr();
      const phi = selectedSpray.phi || "";
      setFormData({
        ...emptyForm,
        sprayName: selectedSpray.name,
        crop: selectedSpray.crop,
        rate: selectedSpray.rate,
        amount: isNaN(totalProduct) ? "" : totalProduct.toFixed(2),
        unit: selectedSpray.unit,
        PHI: phi,
        PCP: selectedSpray.pcp,
        date: today,
        earliestHarvestDate: calcEarliestHarvest(today, phi),
        areaTreated: area || "",
        tankSize: tankSize || userDefaults.defaultTankSize || "",
        growthStage: selectedSpray.stage || "",
        reasonForApplication: selectedSpray.issue || "",
        applicationMethod: userDefaults.defaultApplicationMethod || "",
        applicatorInitials: userDefaults.defaultApplicatorInitials || "",
        labelInstructionsFollowed: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ ...emptyForm });
  };

  useEffect(() => {
    const collectedSprays = [];
    for (const crop in sprayData) {
      for (const issue in sprayData[crop]) {
        for (const spray of sprayData[crop][issue])
          collectedSprays.push({
            crop,
            issue,
            name: spray.name,
            rate: spray.rate,
            unit: spray.unit,
            phi: spray.phi,
            pcp: spray.pcp,
            stage: spray.stage || "",
            description: spray.description || "",
          });
      }
    }
    setAllSprays(collectedSprays);
    if (chosenSpray)
      setSelectedSprayKey(
        `${chosenSpray.crop}-${chosenSpray.issue}-${chosenSpray.name}`
      );
  }, [chosenSpray, sprayData]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Spray Calculator
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({region === "US" ? "Imperial Units" : "Metric Units"})
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <label className="form-label">Select Spray</label>
            <select
              className="form-input text-sm"
              value={selectedSprayKey}
              onChange={(e) => setSelectedSprayKey(e.target.value)}
            >
              {!chosenSpray && <option value="">Choose...</option>}
              {allSprays.map((spray, index) => (
                <option
                  key={`${spray.crop}-${spray.issue}-${spray.name}-${index}`}
                  value={`${spray.crop}-${spray.issue}-${spray.name}`}
                >
                  {`${spray.name} (${spray.crop} - ${spray.issue})`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">
              Water Volume per Acre ({units.volume})
            </label>
            <input
              className="form-input"
              type="number"
              step="any"
              value={waterVolume}
              placeholder={region === "US" ? "e.g. 50" : "e.g. 200"}
              onChange={(e) => setWaterVolume(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Total Area (Acres)</label>
            <input
              className="form-input"
              type="number"
              step="any"
              value={area}
              placeholder="e.g. 25"
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="form-label">Tank Size ({units.volume})</label>
            <input
              className="form-input"
              type="number"
              step="any"
              value={tankSize}
              placeholder={region === "US" ? "e.g. 100" : "e.g. 400"}
              onChange={(e) => setTankSize(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="form-label">Spray Rate (units as given)</label>
            <input
              className="form-input"
              type="number"
              step="any"
              value={sprayRate}
              placeholder="e.g. 10"
              onChange={(e) => setSprayRate(e.target.value)}
            />
          </div>
          {user && (
            <div className="md:col-span-2 lg:col-span-1 flex items-end">
              <button
                onClick={openModal}
                className="btn-primary w-full h-12 text-sm font-semibold"
              >
                + Log Spray
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======== H1 FORM MODAL ======== */}
      {user &&
        isModalOpen &&
        createPortal(
          <div className="modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative max-h-[85vh] overflow-y-auto mx-auto my-auto">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 z-10"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-1 text-gray-800">
                Log New Spray
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Canada GAP Form H1 — Agricultural Chemicals Application
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ── Application Info ── */}
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
                      <label className="form-label">Crop</label>
                      <input
                        name="crop"
                        value={formData.crop}
                        className="form-input bg-gray-50"
                        readOnly
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
                        list="calc-location-list"
                        required
                      />
                      <datalist id="calc-location-list">
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
                        className="form-input bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* ── Product Info ── */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    Product Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Product Trade Name</label>
                      <input
                        value={formData.sprayName}
                        className="form-input bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="form-label">PCP #</label>
                      <input
                        value={formData.PCP}
                        className="form-input bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="form-label">Rate per Acre</label>
                      <input
                        value={`${formData.rate} ${
                          formData.unit || ""
                        } per acre`}
                        className="form-input bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="form-label">Area Treated (acres)</label>
                      <input
                        name="areaTreated"
                        value={formData.areaTreated}
                        onChange={handleChange}
                        type="number"
                        step="any"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Actual Quantity in Tank
                      </label>
                      <input
                        value={
                          formData.amount && formData.unit
                            ? `${formData.amount} ${formData.unit}`
                            : formData.amount || ""
                        }
                        className="form-input bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* ── PHI & Harvest ── */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    PHI & Harvest
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">PHI (Days)</label>
                      <input
                        value={formData.PHI}
                        className="form-input bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Earliest Allowable Harvest Date
                      </label>
                      <input
                        type="date"
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

                {/* ── Equipment & Method ── */}
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

                {/* ── Weather Conditions ── */}
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

                {/* ── Compliance ── */}
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

                {/* ── Notes ── */}
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
                  Save Spray Log
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

      {selectedSpray && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Spray Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Spray:</span>
              <p className="text-gray-600">{selectedSpray.name}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Crop:</span>
              <p className="text-gray-600">{selectedSpray.crop}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Issue:</span>
              <p className="text-gray-600">{selectedSpray.issue}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Rate:</span>
              <p className="text-gray-600">{`${selectedSpray.rate} ${selectedSpray.unit} per acre`}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">PHI:</span>
              <p className="text-gray-600">{selectedSpray.phi}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">PCP #:</span>
              <p className="text-gray-600">{selectedSpray.pcp}</p>
            </div>
          </div>
        </div>
      )}

      {selectedSpray &&
        area &&
        waterVolume &&
        tankSize &&
        sprayRate &&
        (() => {
          const areaNum = parseFloat(area);
          const waterVolumeNum = parseFloat(waterVolume);
          const tankSizeNum = parseFloat(tankSize);
          const sprayRateNum = parseFloat(sprayRate);
          const totalWater = waterVolumeNum * areaNum;
          const totalProduct = sprayRateNum * areaNum;
          const productPerLitre = totalProduct / totalWater;
          const fullTankCount = Math.floor(totalWater / tankSizeNum);
          const remainingLitres = totalWater % tankSizeNum;
          const productPerFullTank = productPerLitre * tankSizeNum;
          const productForPartialTank = productPerLitre * remainingLitres;

          return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Calculation Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Total Water Needed
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalWater} {units.volume}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Total Product Needed
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalProduct.toFixed(2)} {selectedSpray.unit}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Tank Refills
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {fullTankCount + (remainingLitres > 0 ? 1 : 0)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {fullTankCount > 0 && (
                  <div className="bg-white border-2 border-blue-200 rounded-xl p-6 text-center shadow-md min-w-[200px]">
                    <div className="text-4xl mb-3">
                      <img
                        src={sprayTank}
                        alt="Full sprayer tank"
                        className="w-16 h-16 mx-auto mb-2"
                      />
                      <span className="font-bold text-blue-600">
                        x {fullTankCount}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="font-semibold text-gray-700">
                        Full Tanks
                      </div>
                      <div className="text-gray-600">
                        Water: {tankSizeNum} {units.volume} each
                      </div>
                      <div className="text-gray-600">
                        Product: {productPerFullTank.toFixed(2)}{" "}
                        {selectedSpray.unit} each
                      </div>
                    </div>
                  </div>
                )}
                {remainingLitres > 0 && (
                  <div className="bg-white border-2 border-orange-200 rounded-xl p-6 text-center shadow-md min-w-[200px]">
                    <div className="text-4xl mb-3">
                      <img
                        src={partialSprayTank}
                        alt="Partial sprayer tank"
                        className="w-16 h-16 mx-auto mb-2"
                      />
                      <span className="font-bold text-orange-600">Partial</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="font-semibold text-gray-700">
                        Partial Tank
                      </div>
                      <div className="text-gray-600">
                        Water: {remainingLitres.toFixed(2)} {units.volume}
                      </div>
                      <div className="text-gray-600">
                        Product: {productForPartialTank.toFixed(2)}{" "}
                        {selectedSpray.unit}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}

export default Calculator;
