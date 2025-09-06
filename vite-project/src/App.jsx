import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import SprayFinder from "./components/SprayFinder";
import Calculator from "./components/Calculator";
import LandingPage from "./components/LandingPage";
import Tracking from "./components/Tracking";

function App() {
  const [tab, setTab] = useState("LandingPage");
  const [chosenSpray, setChosenSpray] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isValidating, setIsValidating] = useState(true);

  const handleTabChange = (tabName) => {
    setTab(tabName);
    if (tabName !== "Spray Calculator") {
      setChosenSpray(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  // validating token on mount
  useEffect(() => {
    const validateInitialToken = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setIsValidating(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setToken(storedToken);
        } else {
          setToken(null);
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setToken(null);
        localStorage.removeItem("token");
      } finally {
        setIsValidating(false);
      }
    };

    validateInitialToken();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

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

      <div className="content-container">
        {tab === "Spray Finder" && (
          <SprayFinder setTab={setTab} setChosenSpray={setChosenSpray} />
        )}
        {tab === "Spray Calculator" && (
          <Calculator chosenSpray={chosenSpray} token={token} />
        )}
        {tab === "Tracking" &&
          (isValidating ? (
            <div className="flex justify-center items-center min-h-screen">
              <p>Validating session...</p>
            </div>
          ) : (
            <div className="tracking-full-width">
              <Tracking
                token={token}
                setToken={setToken}
                onLogout={handleLogout}
              />
            </div>
          ))}
        {tab === "LandingPage" && <LandingPage setTab={setTab} />}
      </div>
    </>
  );
}

export default App;
