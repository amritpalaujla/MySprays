import { useState } from "react";
import sprayData from "../assets/sprayData.json";
function IssueDropDown({ crop }) {
  const issues = Object.keys(sprayData[crop]); // this extracts the issues and puts them in an array
  return (
    <div>
      <h3>select issue for {crop}</h3>
      {console.log("sprayData crop 1", sprayData[crop])}
      <select>
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
