import { useState } from "react";
import sprayData from "../assets/sprayData.json";
import blankImage from "../assets/blank.jpg";

function IssueDropDown({ crop, setTab, setChosenSpray, onBackToCrops }) {
  // ✅ Added setTab and setChosenSpray props
  const issues = Object.keys(sprayData[crop]); // this extracts the issues and puts them in an array
  const [selectedIssue, setSelectedIssue] = useState("");

  const sprays = sprayData[crop][selectedIssue];

  const handleCalculateClick = (spray) => {
    console.log("The spray you clicked", { spray });

    // ✅ Set the spray object
    setChosenSpray({
      crop: crop,
      issue: selectedIssue,
      name: spray.name,
      rate: spray.rate,
      unit: spray.unit,
      phi: spray.phi,
      pcp: spray.pcp,
    });

    // ✅ Switch to calculator tab
    setTab("Spray Calculator");
  };

  return (
    <div className="issue-container">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBackToCrops}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Crops
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Select Issue for {crop}
        </h3>
        <p className="text-gray-600">
          Choose the specific problem you need to address
        </p>
      </div>

      {/* Issue Selection */}
      <div className="mb-8">
        <label className="form-label text-center block mb-4">
          What issue are you dealing with?
        </label>
        <select
          value={selectedIssue}
          onChange={(e) => setSelectedIssue(e.target.value)}
          className="form-input max-w-md mx-auto block text-center"
        >
          <option value="" disabled>
            -- Select an issue --
          </option>
          {issues.map((issue) => (
            <option key={issue} value={issue}>
              {issue}
            </option>
          ))}
        </select>
      </div>

      {/* Spray Options Grid */}
      {selectedIssue && (
        <div className="sprays-grid">
          {sprays.map((spray, index) => (
            <div key={`${spray.name}-${index}`} className="spray-card">
              <img
                src={blankImage}
                alt={`${spray.name} spray`}
                className="w-full h-48 object-cover"
              />

              <div className="spray-card-content">
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  {spray.name}
                </h4>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Rate:</span>
                    <span className="text-gray-600 font-medium">
                      {spray.rate} {spray.unit} per acre
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">PHI:</span>
                    <span className="text-gray-600">{spray.phi}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">PCP:</span>
                    <span className="text-gray-600">{spray.pcp}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCalculateClick(spray)}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Calculate Application
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Selection State */}
      {!selectedIssue && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Select an Issue Above
            </h4>
            <p className="text-gray-500">
              Choose the specific problem you're facing with your {crop} to see
              available spray solutions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default IssueDropDown;
