import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axiosInstance.js";
import Navbar from "../components/Navbar.jsx";

function AddAsset() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    type: "",
    trackingId: "",
    dateJoining: "",
    status: "Using",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      await API.post(`/employees/${id}/assets/add`, form);
      navigate("/assets");
    } catch (err) {
      setError("Asset add nahi ho pa raha. Tracking ID unique hona chahiye.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="form-container">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Add Asset</h2>

          {error && <p className="error">{error}</p>}

          <input value={id} disabled placeholder="Employee ID" />

          <input
            name="name"
            placeholder="Asset Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="type"
            placeholder="Asset Type"
            value={form.type}
            onChange={handleChange}
            required
          />

          <input
            name="trackingId"
            placeholder="Tracking ID"
            value={form.trackingId}
            onChange={handleChange}
            required
          />

          <input
            name="dateJoining"
            type="date"
            value={form.dateJoining}
            onChange={handleChange}
            required
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Submitted">Submitted</option>
            <option value="Using">Using</option>
            <option value="Repair">Repair</option>
          </select>

          <button type="submit">Save Asset</button>
        </form>
      </div>
    </>
  );
}

export default AddAsset;