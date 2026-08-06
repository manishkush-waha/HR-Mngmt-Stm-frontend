import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../Components/Navbar";

function EmployeeProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emp, setEmp] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/employees/${id}`)
      .then((res) => setEmp(res.data))
      .catch(() => setError("Employee data did not load."));
  }, [id]);

  const role = localStorage.getItem("role");

  const fields = emp ? [
    { label: "Name", value: emp.username },
    { label: "Email", value: emp.email },
    { label: "Phone", value: emp.phone || "-" },
    { label: "Location", value: emp.location || "-" },
    { label: "Gender", value: emp.gender || "-" },
    { label: "Date of Birth", value: emp.dob || "-" },
    { label: "Age", value: emp.age != null ? `${emp.age} years` : "-" },
    { label: "Aadhar", value: emp.aadhar || "-" },
    { label: "Position", value: emp.position || "-" },
    { label: "Salary", value: emp.salary ? `₹${emp.salary}` : "-" },
    { label: "Experience", value: emp.experience || "-" },
  ] : [];

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>Employee Profile</h2>
          <button className="btn edit" onClick={() => navigate(-1)}>← Back</button>
        </div>

        {error && <p className="error">{error}</p>}

        {emp && (
          <div className="detail-card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 30px" }}>
              {fields.map(({ label, value }) => (
                <div key={value} style={{ borderBottom: "1px solid #1e2d5a", paddingBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#718096", display: "block" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "#4facfe" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* {role === "HR" && (
              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <button className="btn edit" onClick={() => navigate(`/employee/edit/${emp.id}`)}>Edit</button>
                <button className="btn asset" onClick={() => navigate(`/employee/${emp.id}/add-asset`)}>Add Asset</button>
                <button className="btn view" onClick={() => navigate(`/employee/${emp.id}/asset`)}>View Assets</button>
              </div>
            )} */}
          </div>
        )}
      </div>
    </>
  );
}

export default EmployeeProfileView;
