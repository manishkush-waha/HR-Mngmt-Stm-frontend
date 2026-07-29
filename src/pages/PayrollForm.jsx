import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../Components/Navbar";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function PayrollForm() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee: 0, basicSalary: 0, hra: 0, pf: 0, pt: 0, est: 0, insurance: 0, month: "January", year: new Date().getFullYear() });
  const [preview, setPreview] = useState({ gross: 0, deduction: 0, net: 0 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    API.get("/employees").then((res) => setEmployees(res.data)).catch(() => setError("Employees load nahi hue"));
  }, []);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };

    updated.employee = parseInt(updated.employee) || 0;
    // console.log(e.target, typeof e.target.value, updated);
    setForm(updated);
    const gross = parseFloat(updated.basic_salary || 0) + parseFloat(updated.hra || 0);
    const deduction = parseFloat(updated.pf || 0) + parseFloat(updated.pt || 0) + parseFloat(updated.est || 0) + parseFloat(updated.insurance || 0);
    setPreview({ gross, deduction, net: gross - deduction });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      console.log("Submitting form:", form);
      await API.post("/payrolls/create", form);
      setSuccess("Payroll created successfully!");
      setTimeout(() => navigate("/hr/payrolls"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>Generate Salary Slip</h2>
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <div className="form-card" style={{ maxWidth: 550 }}>
          <form onSubmit={handleSubmit}>
            <label>Select Employee</label>
            <select name="employee" value={form.employee} onChange={handleChange} required>
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.username} ({emp.email})</option>)}
            </select>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              {[["basic_salary","Basic Salary"],["hra","HRA"],["pf","PF"],["pt","PT"],["est","EST"],["insurance","Insurance"]].map(([name, label]) => (
                <div key={name}>
                  <label>{label} (₹)</label>
                  <input type="number" name={name} min="0" value={form[name]} onChange={handleChange} required placeholder="0" />
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label>Month</label>
                <select name="month" value={form.month} onChange={handleChange} required>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label>Year</label>
                <input type="number" name="year" min="2000" max="2100" value={form.year} onChange={handleChange} required />
              </div>
            </div>

              <div style={{ background: "#0b1437", borderRadius: 8, padding: "12px 16px", marginTop: 16, border: "1px solid #1e2d5a" }}>
              <p style={{ margin: "4px 0", color: "#a0aec0" }}>Gross Salary: <strong style={{ color: "white" }}>₹ {preview.gross.toFixed(2)}</strong></p>
              <p style={{ margin: "4px 0", color: "#a0aec0" }}>Total Deduction: <strong style={{ color: "white" }}>₹ {preview.deduction.toFixed(2)}</strong></p>
              <p style={{ margin: "4px 0", color: "#4facfe", fontSize: 16 }}>Net Salary: <strong>₹ {preview.net.toFixed(2)}</strong></p>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="submit" className="btn primary" style={{ flex: 1 }}>Create Payroll</button>
              <button type="button" className="btn delete" style={{ flex: 1 }} onClick={() => navigate("/dashboard")}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default PayrollForm;
