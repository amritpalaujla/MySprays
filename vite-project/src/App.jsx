import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import SprayFinder from "./components/SprayFinder";
import Calculator from "./components/Calculator";
import LandingPage from "./components/LandingPage";

function App() {
  const [tab, setTab] = useState("LandingPage"); // ✅ Set default tab
  const [chosenSpray, setChosenSpray] = useState(null); // ✅ Use null instead of ""

  // ✅ Clear chosenSpray when switching away from calculator
  const handleTabChange = (tabName) => {
    setTab(tabName);
    if (tabName !== "Spray Calculator") {
      setChosenSpray(null);
    }
  };

  return (
    <>
      <div id="tabs">
        <button onClick={() => handleTabChange("Spray Finder")}>
          Spray Finder
        </button>
        <button onClick={() => handleTabChange("Spray Calculator")}>
          Spray Calculator
        </button>
        <button onClick={() => handleTabChange("Spray Log")}>Spray Log</button>
      </div>

      {tab === "Spray Finder" && (
        <SprayFinder setTab={setTab} setChosenSpray={setChosenSpray} />
      )}
      {tab === "Spray Calculator" && <Calculator chosenSpray={chosenSpray} />}
      {tab === "Spray Log" && <div>Spray Log content here</div>}
      {tab === "LandingPage" && <LandingPage />}
    </>
  );
}

export default App;
