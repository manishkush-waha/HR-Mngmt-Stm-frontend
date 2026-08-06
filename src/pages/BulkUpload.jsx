import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../Components/Navbar";

function BulkUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select a CSV file"); return; }
    setError(""); setMessage(""); setResult(null); setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/employees/bulk-upload", formData);
      setMessage(res.data.message);
      setResult(res.data);
    } catch (err) {
      setError("Upload failed. Please check your CSV format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="form-container">
        <div className="form-card" style={{ maxWidth: 500 }}>
          <h2>Bulk Upload Employees</h2>

          <div style={{ background: "#0b1437", borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: "#a0aec0", border: "1px solid #1e2d5a" }}>
            <b>CSV Format:</b>
            <br />
            <code>username, email, phone, location, gender, dob, aadhar, position, salary, experience</code>
            <br /><br />
            <b>Example:</b>
            <br />
            <code>John, john@gmail.com, 9876543210, Delhi, Male, 1995-01-15, 123456789012, Developer, 50000, 2 years</code>
            <br /><br />
            <b>Note:</b> Password for all employees will be <b>123456</b>
          </div>

          {message && (
            <div className="success">
              <p>{message}</p>
              {result && result.skipped.length > 0 && (
                <p style={{ marginTop: 6 }}>Skipped (duplicate/invalid): {result.skipped.map(s => typeof s === 'object' ? JSON.stringify(s) : s).join(", ")}</p>
              )}
            </div>
          )}
          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            {file && <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>Selected: {file.name}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload & Save"}
            </button>
          </form>

          {result && (
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button className="btn primary" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BulkUpload;
