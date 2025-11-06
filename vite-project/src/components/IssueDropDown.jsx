import { useState } from "react";
import sprayData from "../assets/sprayData.json";
import blankImage from "../assets/blank.jpg";
import { getIssueImage } from "../assets/issuesList";
import { getSprayImage } from "../assets/spraysList";

function IssueDropDown({ crop, setTab, setChosenSpray, onBackToCrops }) {
  const issues = Object.keys(sprayData[crop]);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sprays = selectedIssue ? sprayData[crop][selectedIssue] : [];

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handleBackToIssues = () => {
    setSelectedIssue("");
    setIsTransitioning(false);
  };

  const handleCalculateClick = (spray) => {
    console.log("The spray you clicked", { spray });
    console.log("Spray name for image lookup:", spray.name); // Debug log

    setChosenSpray({
      crop: crop,
      issue: selectedIssue,
      name: spray.name,
      rate: spray.rate,
      unit: spray.unit,
      phi: spray.phi,
      pcp: spray.pcp,
    });

    setTab("Spray Calculator");
  };

  // Show issue selection panel
  if (!selectedIssue || isTransitioning) {
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

        {/* Issue Grid - Now uses crop-specific images */}
        <div className="crop-grid">
          {issues.map((issue) => (
            <div
              key={issue}
              onClick={() => handleIssueClick(issue)}
              className={`crop-card ${selectedIssue === issue ? "spin" : ""}`}
            >
              <img
                src={getIssueImage(crop, issue)}
                alt={`${issue} on ${crop}`}
              />
              <p>{issue}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show spray options for selected issue
  return (
    <div className="issue-container">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={handleBackToIssues}
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
          Back to Issues
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {selectedIssue} Solutions for {crop}
        </h3>
        <p className="text-gray-600">
          Select a spray option to calculate application rates
        </p>
      </div>

      {/* Spray Options Grid */}
      <div className="sprays-grid">
        {sprays.map((spray, index) => {
          const sprayImage = getSprayImage(spray.name);
          console.log(`Looking up image for: "${spray.name}" -> ${sprayImage}`); // Debug log

          return (
            <div key={`${spray.name}-${index}`} className="spray-card">
              <div
                style={{
                  width: "100%",
                  height: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  padding: "1rem",
                }}
              >
                <img
                  src={sprayImage}
                  alt={`${spray.name} spray`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    width: "auto",
                    height: "auto",
                  }}
                />
              </div>

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

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Stage:</span>
                    <span className="text-gray-600">{spray.stage}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                      Description:
                    </span>
                    <span className="text-gray-600">{spray.description}</span>
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
          );
        })}
      </div>
    </div>
  );
}

export default IssueDropDown;
