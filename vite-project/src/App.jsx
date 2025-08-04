import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import SprayFinder from "./components/SprayFinder";
import Calculator from "./components/Calculator";
import LandingPage from "./components/LandingPage";
import Tracking from "./components/Tracking";

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
        <button onClick={() => handleTabChange("Tracking")}>Tracking</button>
      </div>

      {tab === "Spray Finder" && (
        <SprayFinder setTab={setTab} setChosenSpray={setChosenSpray} />
      )}
      {tab === "Spray Calculator" && <Calculator chosenSpray={chosenSpray} />}
      {tab === "Tracking" && <Tracking />}
      {tab === "LandingPage" && <LandingPage />}
    </>
  );
}

export default App;
