import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import { useEffect } from "react";

function Tracking({ token, setToken, onLogout }) {
  const [newAcc, setNewAcc] = useState(false);

  if (token) {
    return <Dashboard token={token} onLogout={onLogout} />;
  }

  return (
    <div>
      {!newAcc && <Login setNewAcc={setNewAcc} setToken={setToken} />}
      {newAcc && <Register setNewAcc={setNewAcc} />}
    </div>
  );
}

export default Tracking;
