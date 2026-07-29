import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";

function AddEmployee() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", email: "", password: "", phone: "", location: "",
    gender: "Male", dob: "", aadhar: "", position: "", salary: "", experience: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/employees", form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.email?.[0] || "Employee add failed. Email must be unique.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="form-container">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Add Employee</h2>
          {error && <p className="error">{error}</p>}

          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password (for employee login)" value={form.password} onChange={handleChange} required />
          <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />

          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label style={{ fontSize: 13, color: "#718096", marginTop: 6 }}>Date of Birth</label>
          <input name="dob" type="date" value={form.dob} onChange={handleChange} />
          <input name="aadhar" placeholder="Aadhar Number (12 digits)" value={form.aadhar} onChange={handleChange} maxLength={12} />
          <input name="position" placeholder="Position / Designation" value={form.position} onChange={handleChange} />
          <input name="salary" type="number" placeholder="Salary" value={form.salary} onChange={handleChange} />
          <input name="experience" placeholder="Experience (e.g. 2 years)" value={form.experience} onChange={handleChange} />

          <button type="submit">Save Employee</button>
        </form>
      </div>
    </>
  );
}

export default AddEmployee;
