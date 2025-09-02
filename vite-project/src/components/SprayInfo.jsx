import { useEffect, useState } from "react";

function SprayInfo({ token }) {
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
  const [openMenuId, setOpenMenuId] = useState(null);

  const [editingSprayId, setEditingSprayId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchSprays = async () => {
    try {
      const res = await fetch("http://localhost:3000/sprays", {
        headers: { Authorization: `Bearer ${token}` },
      });

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
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingSprayId; // assigns boolean to this variable
    const url = isEditing
      ? `http://localhost:3000/sprays/${editingSprayId}`
      : `http://localhost:3000/sprays`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

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
        const res = await fetch(`http://localhost:3000/sprays/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Log Spray
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">My Spray Logs</h3>
        {sprays.length > 0 ? (
          <ul className="space-y-2">
            {sprays.map((spray) => (
              <li
                key={spray._id}
                className="relative p-3 border rounded shadow-sm bg-gray-50"
              >
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === spray._id ? null : spray._id)
                  }
                  className="absolute top-1 right-1 font-bold p-1 rounded text-xl hover:bg-gray-200"
                >
                  ...
                </button>

                {openMenuId === spray._id && (
                  <div className="absolute top-12 right-1 flex flex-col space-y-1 bg-white border rounded shadow-md z-10">
                    <button
                      onClick={() => handleEditClick(spray)}
                      className="px-4 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(spray._id)}
                      className="px-4 py-1 text-sm text-red-500 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
                <div className="flex-1 ml-10 mr-10">
                  <p>
                    <strong>Spray Name: </strong>
                    {spray.sprayName}
                  </p>
                  <p>
                    <strong>Date: </strong>
                    {new Date(spray.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Crop: </strong>
                    {spray.crop}
                  </p>
                  <p>
                    <strong>Location: </strong>
                    {spray.location}
                  </p>
                  <p>
                    <strong>Rate: </strong>
                    {spray.rate}
                  </p>
                  <p>
                    <strong>Amount: </strong>
                    {spray.amount}
                  </p>
                  <p>
                    <strong>PHI: </strong>
                    {spray.PHI}
                  </p>
                  <p>
                    <strong>PCP: </strong>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm bg-opacity-40 z-50">
          <div className="m-3 bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
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
