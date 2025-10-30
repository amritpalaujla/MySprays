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

function App() {
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

      // Only try to refresh if we got 401 AND we're not on an auth page
      const authPages = [
        "/verify-email",
        "/forgot-password",
        "/reset-password",
      ];
      if (!authPages.includes(window.location.pathname) && res.status === 401) {
        await refreshTokenIfNeeded();
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const refreshTokenIfNeeded = async () => {
    // Don't try to refresh on auth pages
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

  // Validate token on mount - SKIP for auth pages
  useEffect(() => {
    // Skip token validation for auth pages
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
  }, [isAuthPage]); // Re-run when switching between auth/non-auth pages

  // Handle refresh interval and events - SKIP for auth pages
  useEffect(() => {
    // Skip for auth pages
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
  }, [user, isAuthPage]); // Re-run when user or page type changes

  return (
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
        }
      />
    </Routes>
  );
}

export default App;
