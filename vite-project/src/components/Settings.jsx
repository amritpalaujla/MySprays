import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function Settings({ user, onLogout }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showClearSpraysModal, setShowClearSpraysModal] = useState(false);

  // Download all sprays as PDF
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sprays`, {
        credentials: "include",
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("authFailure"));
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch sprays");
      }

      const sprays = await res.json();

      if (sprays.length === 0) {
        alert("No spray logs to download");
        setIsDownloading(false);
        return;
      }

      // Sort sprays by date (newest first), then by location
      const sortedSprays = sprays.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return a.location.localeCompare(b.location);
      });

      // Create PDF
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text("Spray Application Records", 14, 20);

      // User info
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`User: ${user.email}`, 14, 33);

      // Group sprays by location
      const spraysByLocation = {};
      sortedSprays.forEach((spray) => {
        if (!spraysByLocation[spray.location]) {
          spraysByLocation[spray.location] = [];
        }
        spraysByLocation[spray.location].push(spray);
      });

      let yPosition = 45;

      // Generate table for each location
      Object.keys(spraysByLocation).forEach((location) => {
        const locationSprays = spraysByLocation[location];

        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Location header
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text(`Location: ${location}`, 14, yPosition);
        yPosition += 8;

        // Create table data
        const tableData = locationSprays.map((spray) => [
          new Date(spray.date).toLocaleDateString(),
          spray.sprayName,
          spray.crop,
          spray.rate,
          `${spray.amount} ${spray.unit || ""}`,
          spray.PHI,
          spray.PCP,
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Date", "Spray", "Crop", "Rate", "Amount", "PHI", "PCP"]],
          body: tableData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8 },
        });

        yPosition = doc.lastAutoTable.finalY + 10;
      });

      // Save PDF
      doc.save(`spray-logs-${new Date().toISOString().split("T")[0]}.pdf`);
      setIsDownloading(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
      setIsDownloading(false);
    }
  };

  // Clear all sprays
  const handleClearAllSprays = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/sprays/clear-all`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("authFailure"));
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to clear sprays");
      }

      const data = await res.json();
      alert(data.message || "All spray logs deleted successfully");
      setShowClearSpraysModal(false);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error clearing sprays:", error);
      alert("Failed to delete spray logs. Please try again.");
      setIsDeleting(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/delete-account`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("authFailure"));
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      alert("Your account has been deleted successfully");
      setShowDeleteAccountModal(false);
      onLogout();
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Download PDF Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Download Spray Records
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Download all your spray application records as a PDF file,
              organized by date and location.
            </p>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDownloading ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Clear All Sprays Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-orange-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Clear All Spray Logs
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Permanently delete all your spray application records. This action
              cannot be undone.
            </p>
            <button
              onClick={() => setShowClearSpraysModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Clear All Sprays
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-red-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Account
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Clear Sprays Confirmation Modal */}
      {showClearSpraysModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <svg
                className="w-8 h-8 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-xl font-bold text-gray-800">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all spray logs? This action cannot
              be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearSpraysModal(false)}
                disabled={isDeleting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllSprays}
                disabled={isDeleting}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
              >
                {isDeleting ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-xl font-bold text-gray-800">
                Delete Account?
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete your account? All your
              data, including spray logs, will be permanently deleted. This
              action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                disabled={isDeleting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
