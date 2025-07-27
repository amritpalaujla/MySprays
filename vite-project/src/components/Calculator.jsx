import { useState, useEffect } from "react";
import sprayData from "../assets/sprayData.json";

function Calculator() {
  const [allSprays, setAllSprays] = useState([]);
  let collectedSprays = [];
  const [area, setArea] = useState(0);
  const [waterVolume, setWaterVolume] = useState(0);
  const [tankSize, setTankSize] = useState(0);
  const [selectedSprayKey, setSelectedSprayKey] = useState("");
  const selectedSpray = allSprays.find(
    (spray) => `${spray.crop}-${spray.issue}-${spray.name}` === selectedSprayKey
  );

  useEffect(() => {
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
          }); //pushing data to a flat array
      }
    }
    console.log("collectedSprays : ", collectedSprays);
    setAllSprays(collectedSprays);
  }, []);

  return (
    <div className="grid grid-rows-4 gap-4 p-4 max-w-md mx-auto">
      {/* Spray Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Spray
        </label>
        <select
          className="w-full border border-gray-300 rounded-md p-2"
          onChange={(e) => setSelectedSprayKey(e.target.value)}
        >
          <option value="">Choose...</option>
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
          placeholder="e.g. 200"
          onChange={(e) => setWaterVolume(parseFloat(e.target.value))}
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
          placeholder="e.g. 25"
          onChange={(e) => setArea(parseFloat(e.target.value))}
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
          placeholder="e.g. 400"
          onChange={(e) => setTankSize(parseFloat(e.target.value))}
        />
      </div>

      {selectedSpray && (
        <div className=" border rounded bg-gray-50 mt-18">
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
        </div>
      )}

      {selectedSpray && area > 0 && waterVolume > 0 && tankSize > 0 && (
        <div className="mt-4 p-4 border rounded bg-green-50 space-y-2">
          <p>
            <strong>Total Water Needed:</strong> {waterVolume * area} L
          </p>
          <p>
            <strong>Total Spray Needed:</strong>{" "}
            {(
              (parseFloat(selectedSpray.rate) * (waterVolume * area)) /
              100
            ).toFixed(2)}{" "}
            {selectedSpray.unit}
          </p>
          <p>
            <strong>Number of Tank Refills:</strong>{" "}
            {((waterVolume * area) / tankSize).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}

export default Calculator;
