import { useState, useEffect } from "react";
import sprayData from "../assets/sprayData.json";
import sprayTank from "../assets/tanker.png";
import partialSprayTank from "../assets/partialTanker.png";

function Calculator({ chosenSpray, user }) {
  const [allSprays, setAllSprays] = useState([]);
  const [area, setArea] = useState(0);
  const [waterVolume, setWaterVolume] = useState(0);
  const [tankSize, setTankSize] = useState(0);
  const [selectedSprayKey, setSelectedSprayKey] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sprayName: "",
    date: "",
    crop: "",
    rate: "",
    amount: "",
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

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sprays`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("authFailure"));
        return;
      }

      const data = await res.json();
      console.log("Saved", data);

      // Reset form + close modal on success
      if (res.ok) {
        setFormData({
          sprayName: "",
          date: "",
          crop: "",
          rate: "",
          amount: "",
          location: "",
          PHI: "",
          PCP: "",
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Error saving spray:", err);
    }
  };

  useEffect(() => {
    const collectedSprays = []; // ✅ Moved inside useEffect
    //looping through each crop
    for (const crop in sprayData) {
      //looping through each issue
      for (const issue in sprayData[crop]) {
        //looping through each spray
        for (const spray of sprayData[crop][issue])
          collectedSprays.push({
            crop: crop,
            issue: issue,
            name: spray.name,
            rate: spray.rate,
            unit: spray.unit,
            phi: spray.phi,
            pcp: spray.pcp,
          }); //pushing data to a flat array
      }
    }
    //console.log("collectedSprays : ", collectedSprays);
    setAllSprays(collectedSprays);

    // ✅ Set chosen spray as selected if it exists
    if (chosenSpray) {
      const sprayKey = `${chosenSpray.crop}-${chosenSpray.issue}-${chosenSpray.name}`;
      setSelectedSprayKey(sprayKey);
    }
  }, [chosenSpray]); // ✅ Added chosenSpray to dependency array

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Spray Calculator
        </h2>

        {/* Input Grid - responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Spray Dropdown */}
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

          {/* Water per Acre */}
          <div>
            <label className="form-label">Water Volume per Acre (L)</label>
            <input
              className="form-input"
              type="number"
              value={waterVolume || ""}
              placeholder="e.g. 200"
              onChange={(e) => setWaterVolume(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Total Area */}
          <div>
            <label className="form-label">Total Area (Acres)</label>
            <input
              className="form-input"
              type="number"
              value={area || ""}
              placeholder="e.g. 25"
              onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Tank Size */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="form-label">Tank Size (L)</label>
            <input
              className="form-input"
              type="number"
              value={tankSize || ""}
              placeholder="e.g. 400"
              onChange={(e) => setTankSize(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Log Spray Button */}
          {user && (
            <div className="md:col-span-2 lg:col-span-1 flex items-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary w-full h-12 text-sm font-semibold"
              >
                + Log Spray
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Log Spray Modal */}
      {user && isModalOpen && (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
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
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Rate</label>
                  <input
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    placeholder="Application rate"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Amount</label>
                  <input
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Total amount"
                    className="form-input"
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
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">PCP</label>
                  <input
                    name="PCP"
                    value={formData.PCP}
                    onChange={handleChange}
                    placeholder="PCP number"
                    className="form-input"
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

      {/* Selected Spray Info */}
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

      {/* Calculation Results */}
      {selectedSpray &&
        area > 0 &&
        waterVolume > 0 &&
        tankSize > 0 &&
        (() => {
          const totalWater = waterVolume * area;
          const totalProduct = parseFloat(selectedSpray.rate) * area;
          const productPerLitre = totalProduct / totalWater;

          const fullTankCount = Math.floor(totalWater / tankSize);
          const remainingLitres = totalWater % tankSize;

          const productPerFullTank = productPerLitre * tankSize;
          const productForPartialTank = productPerLitre * remainingLitres;

          return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Calculation Results
              </h3>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Total Water Needed
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalWater} L
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

              {/* Tank Visuals */}
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
                        Water: {tankSize}L each
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
                        Water: {remainingLitres.toFixed(2)}L
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
