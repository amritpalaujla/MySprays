import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import { useEffect } from "react";

function Tracking({ user, onLogin, onLogout }) {
  const [newAcc, setNewAcc] = useState(false);

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
