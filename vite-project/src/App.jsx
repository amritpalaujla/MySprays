import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import SprayFinder from "./components/SprayFinder";
import Calculator from "./components/Calculator";

function App() {
  const [tab, setTab] = useState("");

  return (
    <>
      <div id="tabs">
        <button onClick={() => setTab("Spray Finder")}>Spray Finder</button>
        <button onClick={() => setTab("Spray Calculator")}>
          Spray Calculator
        </button>
        <button onClick={() => setTab("Spray Log")}>Spray Log</button>
      </div>

      {tab === "Spray Finder" && <SprayFinder />}
      {tab === "Spray Calculator" && <Calculator />}
      {tab === "Spray Log" && <div>Spray Log conent here</div>}
    </>
  );
}

export default App;
