import { useState } from "react";
import sprayData from "../assets/sprayData.json";
import blankImage from "../assets/blank.jpg";

function IssueDropDown({ setTab, crop }) {
  const issues = Object.keys(sprayData[crop]); // this extracts the issues and puts them in an array
  const [selectedIssue, setSelectedIssue] = useState("");

  const sprays = sprayData[crop][selectedIssue];

  const handleCalcClick = (spray) => {
    console.log("The spray you clicked is ", spray);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedIssue &&
          sprays.map((spray) => (
            <div key={spray.name} className="m-4 outline rounded-xl">
              <img
                className="w-sm border-b rounded-t-xl"
                src={blankImage}
              ></img>
              <div className="m-4">
                <h4>{spray.name}</h4>
                <p>
                  {spray.rate} {spray.unit} per acre
                </p>
                <p>PHI: {spray.phi}</p>
                <p>{spray.pcp}</p>
              </div>
              <button className="mb-2" onClick={() => handleCalcClick(spray)}>
                Calculate
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
export default IssueDropDown;
