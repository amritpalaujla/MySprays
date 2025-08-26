import { useState } from "react";
import sprayData from "../assets/sprayData.json";
import blankImage from "../assets/blank.jpg";

function IssueDropDown({ crop, setTab, setChosenSpray }) {
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
    <div>
      <h3>select issue for {crop}</h3>
      {console.log("sprayData crop 1", sprayData[crop])}
      <select
        placeholder="select an issue"
        value={selectedIssue}
        onChange={(e) => setSelectedIssue(e.target.value)}
        className="w-full md:w-md lg:w-lg"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-self-center">
        {selectedIssue &&
          sprays.map((spray) => (
            <div key={spray.name} className="m-4 outline rounded-xl">
              <img
                className="w-sm border-b rounded-t-xl"
                src={blankImage}
                alt={`${spray.name} spray`}
              ></img>
              <div className="m-4">
                <h4>{spray.name}</h4>
                <p>
                  {spray.rate} {spray.unit} per acre
                </p>
                <p>PHI: {spray.phi}</p>
                <p>{spray.pcp}</p>
              </div>
              <div className="justify-self-end m-2">
                <button onClick={() => handleCalculateClick(spray)}>
                  Calculate
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
export default IssueDropDown;
