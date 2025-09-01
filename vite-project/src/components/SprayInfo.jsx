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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    console.log("Token being sent:", token);
    e.preventDefault();
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
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          name="sprayName"
          value={formData.sprayName}
          onChange={handleChange}
          placeholder="Spray Name"
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
        <input
          name="crop"
          value={formData.crop}
          onChange={handleChange}
          placeholder="Crop"
        />
        <input
          name="rate"
          value={formData.rate}
          onChange={handleChange}
          placeholder="Rate"
        />
        <input
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
        />
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
        />
        <input
          name="PHI"
          value={formData.PHI}
          onChange={handleChange}
          placeholder="PHI"
        />
        <input
          name="PCP"
          value={formData.PCP}
          onChange={handleChange}
          placeholder="PCP"
        />

        <button type="submit">Save Spray</button>
      </form>
    </div>
  );
}

export default SprayInfo;
