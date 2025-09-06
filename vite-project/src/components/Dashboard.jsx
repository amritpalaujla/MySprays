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
    { id: "sprays", label: "Sprays", icon: "🌿" },
    { id: "irrigation", label: "Irrigation Timers", icon: "💧" },
    { id: "askAi", label: "Ask Ai", icon: "🤖" },
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
      <div className="flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100 min-h-[400px]">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 min-h-[calc(100vh-120px)]">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Desktop Sidebar - Compact Height */}
        <div className="hidden lg:flex flex-col bg-white/80 backdrop-blur-sm rounded-r-2xl lg:w-80 shadow-xl border-r border-gray-200/50 h-[calc(100vh-140px)] overflow-y-auto sticky top-0">
          <div className="p-6 flex flex-col h-full">
            {/* User Welcome Section - More Compact */}
            <div className="mb-6 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
              <h2 className="text-lg font-bold mb-1">Welcome back!</h2>
              <p className="text-blue-100 text-xs opacity-90">
                Manage your agricultural operations
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 min-h-0">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Navigation
              </h3>
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left group ${
                        selectedTab === tab.id
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }`}
                      onClick={() => setSelectedTab(tab.id)}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium text-sm">{tab.label}</span>
                      {selectedTab === tab.id && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout Button - Always Visible at Bottom */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                onClick={onLogout}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Header & Navigation - More Compact */}
        <div className="lg:hidden bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
                <p className="text-xs text-gray-600">Agricultural Management</p>
              </div>
              <button
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setSideBarOpen(!sideBarOpen)}
              >
                <svg
                  className={`w-5 h-5 text-gray-600 transform transition-transform duration-200 ${
                    sideBarOpen ? "rotate-45" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {sideBarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>

            {sideBarOpen && (
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-top duration-200">
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Navigation
                  </h3>
                  <ul className="space-y-1">
                    {tabs.map((tab) => (
                      <li key={tab.id}>
                        <button
                          className={`w-full flex items-center space-x-3 p-2.5 rounded-lg transition-all duration-200 text-left ${
                            selectedTab === tab.id
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedTab(tab.id);
                            setSideBarOpen(false);
                          }}
                        >
                          <span className="text-base">{tab.icon}</span>
                          <span className="font-medium text-sm">
                            {tab.label}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={onLogout}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md flex items-center justify-center space-x-2 text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area - Compact and Focused */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 p-4 lg:p-6">
            {/* Content Header - More Compact */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">
                  {tabs.find((tab) => tab.id === selectedTab)?.icon}
                </span>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                  {tabs.find((tab) => tab.id === selectedTab)?.label}
                </h2>
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {selectedTab === "sprays" && <SprayInfo token={token} />}
              {selectedTab === "irrigation" && <IrrigationInfo />}
              {selectedTab === "askAi" && (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    AI Assistant Coming Soon
                  </h3>
                  <p className="text-gray-600 max-w-md text-sm">
                    We're working hard to bring you an intelligent assistant to
                    help with your agricultural needs. Stay tuned!
                  </p>
                  <div className="mt-4 flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
