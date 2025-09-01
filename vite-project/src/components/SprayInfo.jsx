import { useState } from "react";

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/sprays", {
        method: "POST",
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
      }
    } catch (err) {
      console.error("Error saving spray:", err);
    }
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
