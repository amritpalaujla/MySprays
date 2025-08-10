import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

function Tracking() {
  const [newAcc, setNewAcc] = useState(false);

  return (
    <div>
      {!newAcc && <Login setNewAcc={setNewAcc} />}
      {newAcc && <Register setNewAcc={setNewAcc} />}
    </div>
  );
}

export default Tracking;
