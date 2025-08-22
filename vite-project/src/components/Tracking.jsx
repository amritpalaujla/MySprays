import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import { useEffect } from "react";

function Tracking() {
  const [newAcc, setNewAcc] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isValidating, setIsValidating] = useState(true);

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

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };
  // showing loading while validating
  if (isValidating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Validating session...</p>
      </div>
    );
  }

  if (token) {
    return <Dashboard token={token} onLogout={handleLogout} />;
  }

  return (
    <div>
      {!newAcc && <Login setNewAcc={setNewAcc} setToken={setToken} />}
      {newAcc && <Register setNewAcc={setNewAcc} />}
    </div>
  );
}

export default Tracking;
