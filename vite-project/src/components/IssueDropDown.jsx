import { useState } from "react";
import sprayData from "../assets/sprayData.json";
function IssueDropDown({ crop }) {
  const issues = Object.keys(sprayData[crop]); // this extracts the issues and puts them in an array
  const [selectedIssue, setSelectedIssue] = useState("");
  return (
    <div>
      <h3>select issue for {crop}</h3>
      {console.log("sprayData crop 1", sprayData[crop])}
      <select
        placeholder="select an issue"
        value={selectedIssue}
        onChange={(e) => setSelectedIssue(e.target.value)}
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
  );
}
export default IssueDropDown;
