import { useEffect, useState } from "react";

function SprayInfo({ user }) {
  const [formData, setFormData] = useState({
    sprayName: "",
    date: "",
    crop: "",
    rate: "",
    amount: "",
    location: "",
    PHI: "",
    PCP: "",
  });

  const [sprays, setSprays] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("dateDesc");

  const [openMenuId, setOpenMenuId] = useState(null);

  const [editingSprayId, setEditingSprayId] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (openMenuId !== null) {
        const menu = document.getElementById(`menu-${openMenuId}`);
        const menuButton = document.getElementById(`menu-button-${openMenuId}`);

        if (
          menu &&
          menuButton &&
          !menu.contains(event.target) &&
          !menuButton.contains(event.target)
        ) {
          setOpenMenuId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openMenuId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilterLocation("");
    setStartDate("");
    setEndDate("");
    setSortOrder("dateDesc");
  };

  const fetchSprays = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterLocation) {
        queryParams.append("location", filterLocation);
      }
      if (startDate) {
        queryParams.append("startDate", startDate);
      }
      if (endDate) {
        queryParams.append("endDate", endDate);
      }
      if (sortOrder) {
        queryParams.append("sort", sortOrder);
      }

      const url = `${
        import.meta.env.VITE_API_URL
      }/sprays?${queryParams.toString()}`;
      const res = await fetch(url, {
        credentials: "include",
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("authFailure"));
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setSprays(data);
      } else {
        console.error("Failed to fetch sprays");
      }
    } catch (err) {
      console.error("Error Fetching sprays:", err);
    }
  };

  useEffect(() => {
    fetchSprays();
  }, [user, filterLocation, startDate, endDate, sortOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingSprayId; // assigns boolean to this variable
    const url = isEditing
      ? `${import.meta.env.VITE_API_URL}/sprays/${editingSprayId}`
      : `${import.meta.env.VITE_API_URL}/sprays`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("authFailure"));
        return;
      }

      const data = await res.json();
      console.log("Saved", data);

      // Reset form + close modal on success
      if (res.ok) {
        setFormData({
          sprayName: "",
          date: "",
          crop: "",
          rate: "",
          amount: "",
          location: "",
          PHI: "",
          PCP: "",
        });
        setIsModalOpen(false);
        setEditingSprayId(null);
        fetchSprays();
      }
    } catch (err) {
      console.error("Error saving spray:", err);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this spray log?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/sprays/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent("authFailure"));
          return;
        }

        if (res.ok) {
          fetchSprays();
        } else {
          alert("Failed to delete spray log.");
        }
      } catch (err) {
        console.error("Error deleting spray:", err);
        alert("Error deleting spray log");
      }
    }
  };

  const handleEditClick = (spray) => {
    setEditingSprayId(spray._id);
    setFormData(spray);
    setIsModalOpen(true);
  };

  return (
    <div className="relative w-full h-full">
      {/* Top-right button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setIsModalOpen(true);
            setFormData({
              sprayName: "",
              date: "",
              crop: "",
              rate: "",
              amount: "",
              location: "",
              PHI: "",
              PCP: "",
            });
          }}
          className="bg-blue-500 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 transition-colors duration-200 text-lg"
        >
          + Log Spray
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-start gap-6 p-6 bg-gray-100 rounded-xl shadow-lg mb-8 border border-gray-200">
        {/* Filters Container */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Filter by Location */}
          <div className="flex flex-col w-full sm:w-auto">
            <label
              htmlFor="location"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              placeholder="e.g. Field 1"
              className="p-3 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Filter by Date Range */}
          <div className="flex flex-col w-full sm:w-auto">
            <label
              htmlFor="startDate"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex flex-col w-full sm:w-auto">
            <label
              htmlFor="endDate"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Sort Order */}
        <div className="flex flex-col w-full sm:w-auto md:w-1/4">
          <label
            htmlFor="sortOrder"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Sort by
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dateDesc">Date (Newest First)</option>
            <option value="dateAsc">Date (Oldest First)</option>
          </select>
        </div>

        <div className="flex flex-col w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">My Spray Logs</h3>
        {sprays.length > 0 ? (
          <ul className="space-y-2">
            {sprays.map((spray) => (
              <li
                key={spray._id}
                className="relative p-6 border border-gray-200 rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow duration-300"
              >
                {/* The More-Options button remains the same */}
                <button
                  id={`menu-button-${spray._id}`}
                  onClick={() =>
                    setOpenMenuId(openMenuId === spray._id ? null : spray._id)
                  }
                  className="absolute top-2 right-2 text-xl font-bold p-1 rounded-full text-gray-500 hover:bg-gray-200"
                >
                  ...
                </button>

                {/* Dropdown menu */}
                {openMenuId === spray._id && (
                  <div
                    id={`menu-${spray._id}`}
                    className="absolute top-10 right-2 flex flex-col space-y-1 bg-white border rounded shadow-lg z-10"
                  >
                    <button
                      onClick={() => handleEditClick(spray)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(spray._id)}
                      className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}

                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  {spray.sprayName}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-800">Date:</span>{" "}
                    {new Date(spray.date).toLocaleDateString("en-CA")}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Crop:</span>{" "}
                    {spray.crop}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">
                      Location:
                    </span>{" "}
                    {spray.location}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Rate:</span>{" "}
                    {spray.rate}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Amount:</span>{" "}
                    {spray.amount}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">PHI:</span>{" "}
                    {spray.PHI}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">PCP:</span>{" "}
                    {spray.PCP}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            No spray logs found. Log a new spray to see it here!
          </p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-start justify-center bg-black/30 backdrop-blur-sm bg-opacity-40 z-50 pt-20">
          <div className="m-3 bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsModalOpen(false);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Log New Spray</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="sprayName"
                value={formData.sprayName}
                onChange={handleChange}
                placeholder="Spray Name"
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                placeholder="Crop"
                className="w-full border p-2 rounded"
              />
              <input
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                placeholder="Rate"
                className="w-full border p-2 rounded"
              />
              <input
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount"
                className="w-full border p-2 rounded"
              />
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full border p-2 rounded"
              />
              <input
                name="PHI"
                value={formData.PHI}
                onChange={handleChange}
                placeholder="PHI"
                className="w-full border p-2 rounded"
              />
              <input
                name="PCP"
                value={formData.PCP}
                onChange={handleChange}
                placeholder="PCP"
                className="w-full border p-2 rounded"
              />

              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
              >
                Save Spray
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SprayInfo;
