import { useState, useEffect } from "react";

function Dashboard({ token, onLogout }) {
  const [message, setMessage] = useState("Loading...");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [sideBarOpen, setSideBarOpen] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("http://localhost:3000/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setMessage(data.message);
          setUser(data.user);
          setError("");
        } else {
          if (res.status === 401) {
            setError("Session expired log in again");
            setTimeout(() => {
              onLogout();
            }, 3000);
          } else {
            setError(data.error || "Failed to load dashboard");
          }
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setError("Network error. Please check your connection.");
      }
    }

    if (token) {
      fetchDashboard();
    }
  }, [token, onLogout]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
        <p className="text-red-700">{error}</p>
        <button
          onClick={onLogout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-3/4 max-w-screen-xl mx-auto">
      <div className="hidden md:flex bg-gray-200 rounded md:w-1/4 p-4 w-100%">
        <ul>
          <li>Sprays</li>
          <li>Irrigation Timers</li>
          <li>Ask Ai</li>
        </ul>
      </div>

      <div className="md:hidden w-full bg-gray-200 p-2 relative">
        <button
          className=" p-2 border rounded"
          onClick={() => setSideBarOpen(!sideBarOpen)}
        >
          {sideBarOpen ? "X" : "☰"}
        </button>
        {sideBarOpen && (
          <div className="absolute top-full left-0 w-full bg-gray-200 shadow-md rounded mt-2 z-50">
            <ul>
              <li className="p-2 border-b">Sprays</li>
              <li className="p-2 border-b">Irrigation Timers</li>
              <li className="p-2">Ask Ai</li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white p-6">
        <h1>Main Content</h1>
        <button
          onClick={onLogout}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
export default Dashboard;
