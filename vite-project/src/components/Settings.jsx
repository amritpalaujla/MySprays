import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function Settings({ user, onLogout }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showClearSpraysModal, setShowClearSpraysModal] = useState(false);

  // Grower profile state
  const [profileData, setProfileData] = useState({
    growerName: "",
    growerLotNumbers: "",
    defaultApplicationMethod: "",
    defaultTankSize: "",
    defaultApplicatorInitials: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Fetch grower profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/profile`,
          {
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setProfileData({
            growerName: data.growerName || "",
            growerLotNumbers: data.growerLotNumbers || "",
            defaultApplicationMethod: data.defaultApplicationMethod || "",
            defaultTankSize: data.defaultTankSize || "",
            defaultApplicatorInitials: data.defaultApplicatorInitials || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    setIsSavingProfile(true);
    setProfileMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        setProfileMessage("Profile saved successfully!");
        setTimeout(() => setProfileMessage(""), 3000);
      } else {
        setProfileMessage("Failed to save profile.");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setProfileMessage("Error saving profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Download all sprays as PDF (H1 format, organized by location)
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Fetch sprays and profile in parallel
      const [spraysRes, profileRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/sprays`, {
          credentials: "include",
        }),
        fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
          credentials: "include",
        }),
      ]);

      if (spraysRes.status === 401) {
        window.dispatchEvent(new CustomEvent("authFailure"));
        return;
      }

      if (!spraysRes.ok) throw new Error("Failed to fetch sprays");

      const sprays = await spraysRes.json();
      const profile = profileRes.ok ? await profileRes.json() : {};

      if (sprays.length === 0) {
        alert("No spray logs to download");
        setIsDownloading(false);
        return;
      }

      // Group sprays by location, sorted by date within each group
      const spraysByLocation = {};
      sprays.forEach((spray) => {
        const loc = spray.location || "Unknown";
        if (!spraysByLocation[loc]) spraysByLocation[loc] = [];
        spraysByLocation[loc].push(spray);
      });

      // Sort each location group by date (oldest first for chronological record)
      Object.keys(spraysByLocation).forEach((loc) => {
        spraysByLocation[loc].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
      });

      const sortedLocations = Object.keys(spraysByLocation).sort();

      // Create landscape PDF
      const doc = new jsPDF({ orientation: "landscape" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const currentYear = new Date().getFullYear();

      // Helper to format date
      const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

      // Generate one page (or more) per location
      sortedLocations.forEach((location, locIndex) => {
        if (locIndex > 0) doc.addPage();

        const locationSprays = spraysByLocation[location];
        let y = 12;

        // ── H1 Form Header ──
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text(
          "FORM H1 — AGRICULTURAL CHEMICALS APPLICATION",
          pageWidth / 2,
          y,
          { align: "center" }
        );
        y += 7;

        doc.setFontSize(8);
        doc.setFont(undefined, "normal");
        doc.setTextColor(100);
        doc.text(
          "Record all applications of PESTICIDES (INSECTICIDES, HERBICIDES, FUNGICIDES), NUTRIENTS and GROWTH REGULATORS.",
          pageWidth / 2,
          y,
          { align: "center" }
        );
        doc.setTextColor(0);
        y += 8;

        // ── Grower Info Row ──
        doc.setFontSize(9);
        doc.setFont(undefined, "bold");
        const growerName = profile.growerName || user?.email || "";
        const lotNumbers = profile.growerLotNumbers || "";
        doc.text(`Grower: ${growerName}`, 14, y);
        doc.text(`Lot Number(s): ${lotNumbers}`, 120, y);
        doc.text(`Location: ${location}`, 200, y);
        doc.text(`Year: ${currentYear}`, pageWidth - 14, y, { align: "right" });
        y += 4;

        // Thin line under header
        doc.setDrawColor(180);
        doc.setLineWidth(0.3);
        doc.line(14, y, pageWidth - 14, y);
        y += 4;

        // ── Table with all H1 fields ──
        const tableHead = [
          [
            "Date",
            "Product\nTrade Name",
            "PCP #",
            "Crop",
            "Growth\nStage",
            "Reason for\nApplication",
            "Rate/\nAcre",
            "Area\n(acres)",
            "Qty in\nTank",
            "PHI\n(days)",
            "Earliest\nHarvest",
            "Method",
            "Tank\nSize",
            "Temp",
            "Wind\nDir",
            "Wind\nCond",
            "Equip.\nInsp.",
            "Equip.\nClean",
            "Label\nFollowed",
            "Appl.\nInitials",
            "Notes",
          ],
        ];

        const tableBody = locationSprays.map((s) => [
          fmtDate(s.date),
          s.sprayName || "—",
          s.PCP || "—",
          s.crop || "—",
          s.growthStage || "—",
          s.reasonForApplication || "—",
          s.rate ? `${s.rate} ${s.unit || ""}` : "—",
          s.areaTreated || "—",
          s.amount ? `${s.amount} ${s.unit || ""}` : "—",
          s.PHI || "—",
          fmtDate(s.earliestHarvestDate),
          s.applicationMethod || "—",
          s.tankSize || "—",
          s.temperature || "—",
          s.windDirection || "—",
          s.windCondition || "—",
          s.equipmentInspected ? "Yes" : "No",
          s.equipmentCleaned ? "Yes" : "No",
          s.labelInstructionsFollowed === false ? "No" : "Yes",
          s.applicatorInitials || "—",
          s.notes || "",
        ]);

        autoTable(doc, {
          startY: y,
          head: tableHead,
          body: tableBody,
          theme: "grid",
          headStyles: {
            fillColor: [34, 85, 51],
            textColor: 255,
            fontSize: 6,
            fontStyle: "bold",
            halign: "center",
            valign: "middle",
            cellPadding: 1.5,
          },
          bodyStyles: {
            fontSize: 6,
            cellPadding: 1.5,
            halign: "center",
            valign: "middle",
          },
          alternateRowStyles: { fillColor: [245, 248, 245] },
          margin: { left: 6, right: 6 },
          tableWidth: "auto",
          styles: {
            overflow: "linebreak",
            lineWidth: 0.2,
            lineColor: [180, 180, 180],
          },
          columnStyles: {
            0: { cellWidth: 16 }, // Date
            1: { cellWidth: 22, halign: "left" }, // Product Name
            2: { cellWidth: 12 }, // PCP
            3: { cellWidth: 14 }, // Crop
            4: { cellWidth: 14 }, // Growth Stage
            5: { cellWidth: 20, halign: "left" }, // Reason
            6: { cellWidth: 16 }, // Rate
            7: { cellWidth: 10 }, // Area
            8: { cellWidth: 16 }, // Qty
            9: { cellWidth: 9 }, // PHI
            10: { cellWidth: 16 }, // Earliest Harvest
            11: { cellWidth: 14 }, // Method
            12: { cellWidth: 12 }, // Tank Size
            13: { cellWidth: 10 }, // Temp
            14: { cellWidth: 9 }, // Wind Dir
            15: { cellWidth: 10 }, // Wind Cond
            16: { cellWidth: 9 }, // Equip Insp
            17: { cellWidth: 9 }, // Equip Clean
            18: { cellWidth: 9 }, // Label Followed
            19: { cellWidth: 10 }, // Applicator
            20: { cellWidth: 18, halign: "left" }, // Notes
          },
          didDrawPage: (data) => {
            // Footer on every page
            const pageH = doc.internal.pageSize.getHeight();
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text(
              `Generated: ${new Date().toLocaleDateString()} | ${growerName} | Location: ${location}`,
              14,
              pageH - 6
            );
            doc.text(
              `Page ${doc.internal.getNumberOfPages()}`,
              pageWidth - 14,
              pageH - 6,
              { align: "right" }
            );
            doc.setTextColor(0);
          },
        });
      });

      // Save PDF
      const fileName = profile.growerName
        ? `H1-Spray-Records-${profile.growerName.replace(/\s+/g, "-")}-${
            new Date().toISOString().split("T")[0]
          }.pdf`
        : `H1-Spray-Records-${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
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
      {/* Grower Profile Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Grower Profile & Defaults
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Set your grower info for H1 forms and default values that
              auto-fill when logging sprays.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grower Name
                </label>
                <input
                  name="growerName"
                  value={profileData.growerName}
                  onChange={handleProfileChange}
                  placeholder="Your farm / grower name"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grower Lot Number(s)
                </label>
                <input
                  name="growerLotNumbers"
                  value={profileData.growerLotNumbers}
                  onChange={handleProfileChange}
                  placeholder="e.g. Lot 12, Lot 15"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Application Method
                </label>
                <select
                  name="defaultApplicationMethod"
                  value={profileData.defaultApplicationMethod}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select...</option>
                  <option value="Air Blast">Air Blast</option>
                  <option value="Weed Sprayer">Weed Sprayer</option>
                  <option value="Backpack">Backpack</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Tank Size
                </label>
                <input
                  name="defaultTankSize"
                  value={profileData.defaultTankSize}
                  onChange={handleProfileChange}
                  placeholder="e.g. 400 L"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Applicator Initials
                </label>
                <input
                  name="defaultApplicatorInitials"
                  value={profileData.defaultApplicatorInitials}
                  onChange={handleProfileChange}
                  placeholder="e.g. AA"
                  maxLength={5}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleProfileSave}
                disabled={isSavingProfile}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </button>
              {profileMessage && (
                <span
                  className={`text-sm font-medium ${
                    profileMessage.includes("success")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {profileMessage}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

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
