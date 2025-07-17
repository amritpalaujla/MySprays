import { useState, useEffect } from "react";
import sprayData from "../assets/sprayData.json";

function Calculator() {
  const [allSprays, setAllSprays] = useState([]);
  let collectedSprays = [];

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
          }); //pushing data to a flat array
      }
    }
    //console.log("collectedSprays : ", collectedSprays);
    setAllSprays(collectedSprays);
  }, []);

  return (
    <div className="grid grid-rows-4 gap-4 p-4 max-w-md mx-auto">
      {/* Spray Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Spray
        </label>
        <select className="w-full border border-gray-300 rounded-md p-2">
          <option value="">Choose...</option>
          {allSprays.map((spray) => (
            <option
              key={`${spray.crop}-${spray.issue}-${spray.name}`}
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
        />
      </div>
    </div>
  );
}

export default Calculator;
