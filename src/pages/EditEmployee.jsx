import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axiosInstance.js";
import Navbar from "../components/Navbar.jsx";

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", email: "", password: "", phone: "", location: "",
    gender: "Male", dob: "", aadhar: "", position: "", salary: "", experience: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/employees/${id}`).then((res) => {
      const d = res.data;
      setForm({
        username: d.username || "",
        email: d.email || "",
        password: "",
        phone: d.phone || "",
        location: d.location || "",
        gender: d.gender || "Male",
        dob: d.dob || "",
        aadhar: d.aadhar || "",
        position: d.position || "",
        salary: d.salary || "",
        experience: d.experience || "",
      });
    }).catch(() => setError("Employee data did not load."));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/employees/${id}`, form);
      navigate("/dashboard");
    } catch (err) {
      setError("Update failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="form-container">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Edit Employee</h2>
          {error && <p className="error">{error}</p>}

          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="New Password (leave blank to keep same)" value={form.password} onChange={handleChange} />
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

          <button type="submit">Update Employee</button>
        </form>
      </div>
    </>
  );
}

export default EditEmployee;
