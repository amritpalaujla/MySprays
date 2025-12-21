import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import SprayFinder from "./components/SprayFinder";
import Calculator from "./components/Calculator";
import LandingPage from "./components/LandingPage";
import Tracking from "./components/Tracking";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { RegionProvider } from "./context/RegionContext";
import RegionSelector from "./components/RegionSelector";

function App() {
  //our useState functions
  const [tab, setTab] = useState("LandingPage");
  const [chosenSpray, setChosenSpray] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Check if current page is an auth page (no token validation needed)
  const isAuthPage = [
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);

  const handleTabChange = (tabName) => {
    setTab(tabName);
    if (tabName !== "Spray Calculator") {
      setChosenSpray(null);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();

      const authPages = [
        "/verify-email",
        "/forgot-password",
        "/reset-password",
      ];
      if (!res.ok) {
        console.warn("Logout endpoint failed, but local state cleared");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const refreshTokenIfNeeded = async () => {
    const authPages = ["/verify-email", "/forgot-password", "/reset-password"];
    if (authPages.includes(window.location.pathname)) {
      console.log("Skipping token refresh on auth page");
      return false;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Token refreshed successfully");
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

  useEffect(() => {
    if (isAuthPage) {
      setIsValidating(false);
      return;
    }

    const validateInitialToken = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/verify-token`,
          {
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else if (res.status === 401) {
          const refreshed = await refreshTokenIfNeeded();
          if (refreshed) {
            const retryRes = await fetch(
              `${import.meta.env.VITE_API_URL}/verify-token`,
              {
                credentials: "include",
              }
            );
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
  }, [isAuthPage]);

  useEffect(() => {
    if (isAuthPage) {
      return;
    }

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
  }, [user, isAuthPage]);

  return (
    <RegionProvider user={user}>
      <Routes>
        {/* Auth routes MUST come BEFORE the catch-all route */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Main app route - catch-all, must be LAST */}
        <Route
          path="*"
          element={
            <>
              <div id="tabs">
                <button onClick={() => handleTabChange("Spray Finder")}>
                  Spray Finder
                </button>
                <button onClick={() => handleTabChange("Spray Calculator")}>
                  Spray Calculator
                </button>
                <button onClick={() => handleTabChange("Tracking")}>
                  Tracking
                </button>

                {/* Region Selector in Top Bar */}
                <RegionSelector />
              </div>

              <div className="content-container">
                {tab === "Spray Finder" && (
                  <SprayFinder
                    setTab={setTab}
                    setChosenSpray={setChosenSpray}
                  />
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
          }
        />
      </Routes>
    </RegionProvider>
  );
}

export default App;
