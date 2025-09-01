import { useState, useEffect } from "react";
import SprayInfo from "./SprayInfo";
import IrrigationInfo from "./IrrigationInfo";

function Dashboard({ token, onLogout }) {
  const [message, setMessage] = useState("Loading...");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("sprays");

  const tabs = [
    { id: "sprays", label: "Sprays" },
    { id: "irrigation", label: "Irrigation Timers" },
    { id: "askAi", label: "Ask Ai" },
  ];

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
            setError("Session expired, log in again");
            setTimeout(() => onLogout(), 3000);
          } else {
            setError(data.error || "Failed to load dashboard");
          }
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setError("Network error. Please check your connection.");
      }
    }

    if (token) fetchDashboard();
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
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col bg-gray-200 rounded md:w-1/4 p-4 h-full">
        <ul className="flex flex-col space-y-2">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`p-2 cursor-pointer rounded transition-all ${
                selectedTab === tab.id
                  ? "font-bold bg-gray-300"
                  : "font-normal hover:font-bold hover:bg-gray-100"
              }`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
        <button
          onClick={onLogout}
          className="mt-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden w-full bg-gray-200 p-2">
        <button
          className="p-2 border rounded w-full text-left"
          onClick={() => setSideBarOpen(!sideBarOpen)}
        >
          {sideBarOpen ? "Close Menu" : "Open Menu"}
        </button>

        {sideBarOpen && (
          <div className="mt-2 bg-gray-200 rounded shadow-md">
            <ul className="flex flex-col space-y-2 p-2">
              {tabs.map((tab) => (
                <li
                  key={tab.id}
                  className={`p-2 cursor-pointer rounded transition-all ${
                    selectedTab === tab.id
                      ? "font-bold bg-gray-300"
                      : "font-normal hover:font-bold hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedTab(tab.id)}
                >
                  {tab.label}
                </li>
              ))}
            </ul>
            <button
              onClick={onLogout}
              className="w-1/2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors m-2"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 bg-white p-6">
        {selectedTab === "sprays" && <SprayInfo token={token} />}
        {selectedTab === "irrigation" && <IrrigationInfo />}
        {selectedTab === "askAi" && (
          <div className="text-gray-500">Ask Ai content coming soon...</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
