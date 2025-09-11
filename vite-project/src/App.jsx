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
  //const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isValidating, setIsValidating] = useState(true);
  const [user, setUser] = useState(null);

  const handleTabChange = (tabName) => {
    setTab(tabName);
    if (tabName !== "Spray Calculator") {
      setChosenSpray(null);
    }
  };

  const handleLogout = async () => {
    /*setToken(null);
    localStorage.removeItem("token");
    */

    try {
      await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const refreshTokenIfNeeded = async () => {
    try {
      const res = await fetch("http://localhost:3000/refresh-token", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Token refreshed successfully");
        // Dispatch event to notify that token was refreshed
        window.dispatchEvent(
          new CustomEvent("tokenRefreshed", {
            detail: { user: data.user },
          })
        );
        return true;
      } else {
        console.log("Token refresh failed");
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  // validating token on mount
  useEffect(() => {
    const validateInitialToken = async () => {
      try {
        const res = await fetch("http://localhost:3000/verify-token", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else if (res.status === 401) {
          const refreshed = await refreshTokenIfNeeded();
          if (refreshed) {
            const retryRes = await fetch("http://localhost:3000/verify-token", {
              credentials: "include",
            });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              setUser(retryData.user);
            }
          }
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setUser(null);
      } finally {
        setIsValidating(false);
      }
    };

    validateInitialToken();
  }, []); // Empty dependency - runs once only

  // Second useEffect: Handle refresh interval and events
  useEffect(() => {
    let refreshInterval;

    if (user) {
      refreshInterval = setInterval(refreshTokenIfNeeded, 10 * 60 * 1000);
    }

    const handleTokenRefresh = (event) => {
      setUser(event.detail.user);
    };

    const handleAuthFailure = () => {
      setUser(null);
    };

    window.addEventListener("tokenRefreshed", handleTokenRefresh);
    window.addEventListener("authFailure", handleAuthFailure);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
      window.removeEventListener("tokenRefreshed", handleTokenRefresh);
      window.removeEventListener("authFailure", handleAuthFailure);
    };
  }, [user]);

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
          <Calculator chosenSpray={chosenSpray} user={user} />
        )}
        {tab === "Tracking" &&
          (isValidating ? (
            <div className="flex justify-center items-center min-h-screen">
              <p>Validating session...</p>
            </div>
          ) : (
            <div className="tracking-full-width">
              <Tracking
                user={user}
                onLogin={handleLogin}
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
