import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

function Tracking({ user, onLogin, onLogout }) {
  const location = useLocation();
  const authMode = location.state?.authMode;
  const [newAcc, setNewAcc] = useState(authMode === "signup");

  // The nav menu's Log In / Sign Up links pick which form to show
  useEffect(() => {
    if (authMode) setNewAcc(authMode === "signup");
  }, [authMode, location.key]);

  if (user) {
    return <Dashboard user={user} onLogout={onLogout} />;
  }

  return (
    <div>
      {!newAcc && <Login setNewAcc={setNewAcc} onLogin={onLogin} />}
      {newAcc && <Register setNewAcc={setNewAcc} />}
    </div>
  );
}

export default Tracking;
