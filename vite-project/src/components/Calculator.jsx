import { useState } from "react";

function Calculator() {
  return (
    <div className="grid grid-rows-4 gap-4 p-4 max-w-md mx-auto">
      {/* Spray Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Spray
        </label>
        <select className="w-full border border-gray-300 rounded-md p-2">
          <option value="">Choose...</option>
          <option value="1">Spray 1</option>
          <option value="2">Spray 2</option>
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
