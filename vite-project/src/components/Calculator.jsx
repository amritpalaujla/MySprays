import { useState, useEffect } from "react";
import sprayData from "../assets/sprayData.json";
import sprayTank from "../assets/tanker.png";
import partialSprayTank from "../assets/partialTanker.png";

function Calculator({ chosenSpray, token }) {
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
      const res = await fetch("http://localhost:3000/sprays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

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
        fetchSprays();
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
    console.log("collectedSprays : ", collectedSprays);
    setAllSprays(collectedSprays);

    // ✅ Set chosen spray as selected if it exists
    if (chosenSpray) {
      const sprayKey = `${chosenSpray.crop}-${chosenSpray.issue}-${chosenSpray.name}`;
      setSelectedSprayKey(sprayKey);
    }
  }, [chosenSpray]); // ✅ Added chosenSpray to dependency array

  return (
    <div className="grid grid-rows-4 gap-4 p-4 max-w-md mx-auto">
      {/* Spray Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Spray
        </label>
        <select
          className="w-full border border-gray-300 rounded-md p-2"
          value={selectedSprayKey} // ✅ Added value prop
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Water Volume per Acre (L)
        </label>
        <input
          className="w-full border border-gray-300 rounded-md p-2"
          type="number"
          value={waterVolume || ""} // ✅ Added value prop
          placeholder="e.g. 200"
          onChange={(e) => setWaterVolume(parseFloat(e.target.value) || 0)} // ✅ Handle NaN
        />
      </div>

      {/* Total Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total Area (Acres)
        </label>
        <input
          className="w-full border border-gray-300 rounded-md p-2"
          type="number"
          value={area || ""} // ✅ Added value prop
          placeholder="e.g. 25"
          onChange={(e) => setArea(parseFloat(e.target.value) || 0)} // ✅ Handle NaN
        />
      </div>

      {/* Tank Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tank Size (L)
        </label>
        <input
          className="w-full border border-gray-300 rounded-md p-2"
          type="number"
          value={tankSize || ""} // ✅ Added value prop
          placeholder="e.g. 400"
          onChange={(e) => setTankSize(parseFloat(e.target.value) || 0)} // ✅ Handle NaN
        />
      </div>

      {/*log spray button if theres a token*/}
      {token && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Log Spray
          </button>
        </div>
      )}

      {/* Log Spray Modal (Conditionally rendered) */}
      {token && isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm bg-opacity-40 z-50">
          <div className="m-3 bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Log New Spray</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="sprayName"
                value={formData.sprayName}
                onChange={handleChange}
                placeholder="Spray Name"
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                placeholder="Crop"
                className="w-full border p-2 rounded"
              />
              <input
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                placeholder="Rate"
                className="w-full border p-2 rounded"
              />
              <input
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount"
                className="w-full border p-2 rounded"
              />
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full border p-2 rounded"
              />
              <input
                name="PHI"
                value={formData.PHI}
                onChange={handleChange}
                placeholder="PHI"
                className="w-full border p-2 rounded"
              />
              <input
                name="PCP"
                value={formData.PCP}
                onChange={handleChange}
                placeholder="PCP"
                className="w-full border p-2 rounded"
              />

              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
              >
                Save Spray
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedSpray && (
        <div className=" border rounded bg-gray-50 mt-5">
          <p>
            <strong>Spray Selected:</strong> {selectedSpray.name}
          </p>
          <p>
            <strong>Crop:</strong> {selectedSpray.crop}
          </p>
          <p>
            <strong>Issue:</strong> {selectedSpray.issue}
          </p>
          <p>
            <strong>Rate:</strong>{" "}
            {`${selectedSpray.rate} ${selectedSpray.unit} per acre`}
          </p>
          <p>
            <strong>PHI:</strong> {selectedSpray.phi}
          </p>
          <p>
            <strong>PCP #:</strong> {selectedSpray.pcp}
          </p>
        </div>
      )}

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
            <div className="mt-4 p-4 border rounded bg-green-50 space-y-2">
              <p>
                <strong>Total Water Needed:</strong> {totalWater} L
              </p>
              <p>
                <strong>Total Product Needed:</strong> {totalProduct.toFixed(2)}{" "}
                {selectedSpray.unit}
              </p>
              <p>
                <strong>Tank Refills:</strong>{" "}
                {fullTankCount + (remainingLitres > 0 ? 1 : 0)}
              </p>

              {/* Tank visuals */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="border rounded p-2 w-32 text-center bg-white shadow m-auto">
                  <div className="text-3xl">
                    <img src={sprayTank} alt="sprayer"></img>{" "}
                    <b>x {fullTankCount}</b>
                  </div>
                  <div className="text-sm">Water: {tankSize}L</div>
                  <div className="text-sm">
                    Product: {productPerFullTank.toFixed(2)}{" "}
                    {selectedSpray.unit}
                  </div>
                </div>

                {remainingLitres > 0 && (
                  <div className="border rounded p-2 w-32 text-center bg-white shadow m-auto">
                    <div className="text-3xl">
                      <img src={partialSprayTank} alt="sprayer"></img>
                      <b>partial</b>
                    </div>
                    <div className="text-sm">Water: {remainingLitres}L</div>
                    <div className="text-sm">
                      Product: {productForPartialTank.toFixed(2)}{" "}
                      {selectedSpray.unit}
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
