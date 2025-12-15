import { useState, useEffect } from "react";
import { getSprayData } from "../assets/sprayData";
import { useRegion } from "../context/RegionContext";
import sprayTank from "../assets/tanker.png";
import partialSprayTank from "../assets/partialTanker.png";

function Calculator({ chosenSpray, user }) {
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
  const [formData, setFormData] = useState({
    sprayName: "",
    date: "",
    crop: "",
    rate: "",
    amount: "",
    unit: "", // Add unit field
    location: "",
    PHI: "",
    PCP: "",
  });

  const selectedSpray = allSprays.find(
    (spray) => `${spray.crop}-${spray.issue}-${spray.name}` === selectedSprayKey
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🚀 Submitting spray data:", formData);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sprays`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      console.log("📡 Response status:", res.status);

      if (res.status === 401) {
        console.log("❌ Authentication failed");
        window.dispatchEvent(new CustomEvent("authFailure"));
        return;
      }

      const data = await res.json();
      console.log("✅ Response data:", data);

      if (res.ok) {
        console.log("✅ Spray saved successfully!");
        setFormData({
          sprayName: "",
          date: "",
          crop: "",
          rate: "",
          amount: "",
          unit: "",
          location: "",
          PHI: "",
          PCP: "",
        });
        setIsModalOpen(false);
      } else {
        console.error("❌ Server error:", data);
        alert(`Failed to save spray: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("❌ Error saving spray:", err);
      alert(`Network error: ${err.message}`);
    }
  };

  const openModal = () => {
    if (selectedSpray) {
      const totalProduct = parseFloat(sprayRate) * parseFloat(area);
      const newFormData = {
        sprayName: selectedSpray.name,
        crop: selectedSpray.crop,
        rate: selectedSpray.rate,
        amount: totalProduct.toFixed(2),
        unit: selectedSpray.unit, // Save the unit
        PHI: selectedSpray.phi,
        PCP: selectedSpray.pcp,
        date: "",
        location: "",
      };
      console.log("📋 Opening modal with data:", newFormData);
      setFormData(newFormData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      sprayName: "",
      date: "",
      crop: "",
      rate: "",
      amount: "",
      unit: "",
      location: "",
      PHI: "",
      PCP: "",
    });
  };

  useEffect(() => {
    const collectedSprays = [];
    for (const crop in sprayData) {
      for (const issue in sprayData[crop]) {
        for (const spray of sprayData[crop][issue])
          collectedSprays.push({
            crop: crop,
            issue: issue,
            name: spray.name,
            rate: spray.rate,
            unit: spray.unit,
            phi: spray.phi,
            pcp: spray.pcp,
          });
      }
    }
    setAllSprays(collectedSprays);

    if (chosenSpray) {
      const sprayKey = `${chosenSpray.crop}-${chosenSpray.issue}-${chosenSpray.name}`;
      setSelectedSprayKey(sprayKey);
    }
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

      {user && isModalOpen && (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-6 text-gray-800">
              Log New Spray
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Spray Name</label>
                <input
                  name="sprayName"
                  value={formData.sprayName}
                  onChange={handleChange}
                  placeholder="Enter spray name"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Crop</label>
                  <input
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    placeholder="Crop type"
                    className="form-input bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="form-label">Rate</label>
                  <input
                    name="rate"
                    value={`${formData.rate} ${
                      selectedSpray?.unit || ""
                    } per acre`}
                    onChange={handleChange}
                    placeholder="Application rate"
                    className="form-input bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Amount</label>

                  <input
                    name="amount"
                    value={
                      formData.amount && formData.unit
                        ? `${formData.amount} ${formData.unit}`
                        : formData.amount || ""
                    }
                    onChange={handleChange}
                    placeholder="Total amount"
                    className="form-input bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Field location"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">PHI</label>
                  <input
                    name="PHI"
                    value={formData.PHI}
                    onChange={handleChange}
                    placeholder="Pre-harvest interval"
                    className="form-input bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="form-label">PCP</label>
                  <input
                    name="PCP"
                    value={formData.PCP}
                    onChange={handleChange}
                    placeholder="PCP number"
                    className="form-input bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 mt-6"
              >
                Save Spray Log
              </button>
            </form>
          </div>
        </div>
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
                        Water: {tankSizeNum}
                        {units.volume} each
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
                        Water: {remainingLitres.toFixed(2)}
                        {units.volume}
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
