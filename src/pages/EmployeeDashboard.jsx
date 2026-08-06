import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../Components/Navbar";

const LEAVE_TYPES = [
  "Sick Leave",
  "Casual Leave",
  "Half Leave",
  "Maternity Leave",
  "Paternity Leave",
];

function EmployeeDashboard() {
  const navigate = useNavigate();
  const employeeId = localStorage.getItem("employee_id");
  const [emp, setEmp] = useState(null);
  const [assets, setAssets] = useState([]);
  const [showAssets, setShowAssets] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [showLeaves, setShowLeaves] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: "Sick Leave", fromDate: "", toDate: "", reason: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!employeeId) { setError("Employee record not found. Please contact HR."); return; }
    API.get(`/employees/${employeeId}`).then((res) => setEmp(res.data)).catch(() => setError("Profile load nahi hua"));
  }, [employeeId]);

  const handleViewAssets = () => {
    API.get(`/employees/${employeeId}/assets`)
      .then((res) => { setAssets(res.data); setShowAssets(true); })
      .catch(() => setError("Assets did not load."));
  };

  const handleViewLeaves = () => {
    API.get(`/leaves/?employeeId=${employeeId}`)
      .then((res) => { setLeaves(res.data); setShowLeaves(true); })
      .catch(() => setError("Leaves did not load."));
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await API.post("/leaves", { ...form, employee: employeeId });
      setSuccess("Leave request submitted! The email has been sent to HR.");
      setShowForm(false);
      setForm({ leaveType: "Sick Leave", fromDate: "", toDate: "", reason: "" });
      handleViewLeaves();
    } catch {
      setError("The leave request was not submitted. Please try again.");
    }
  };

  const statusColor = (s) => s === "Approved" ? "#16a34a" : s === "Rejected" ? "#ef4444" : "#f59e0b";

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>My Dashboard</h2>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {emp && (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{emp.id}</td>
                    <td>{emp.username}</td>
                    <td>{emp.email}</td>
                    <td>
                      <div className="actions">
                        <button className="btn view" onClick={() => navigate(`/employee-profile/${emp.id}`)}>View</button>
                        <button className="btn asset" onClick={handleViewAssets}>View Assets</button>
                        <button className="btn primary" onClick={() => { setShowForm(true); setSuccess(""); setError(""); }}>Leave Request</button>
                        <button className="btn edit" onClick={handleViewLeaves}>My Leaves</button>
                        <Link className="btn view" to="/employee/salary-slips">My Salary Slips</Link>
                        {/* <button className="btn asset" onClick={() => navigate("/employee/salary-slips")}>My Salary Slip</button> */}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Leave Request Form */}
            {showForm && (
              <div style={{ marginTop: 30 }}>
                <div className="form-card" style={{ maxWidth: 500 }}>
                  <h2>Leave Request</h2>
                  <form onSubmit={handleLeaveSubmit}>
                    <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                      {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <label style={{ fontSize: 13, color: "#718096", marginTop: 8, display: "block" }}>From Date</label>
                    <input type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required />

                    <label style={{ fontSize: 13, color: "#718096", marginTop: 8, display: "block" }}>To Date</label>
                    <input type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required />

                    <textarea
                      placeholder="Reason for leave"
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      required
                      rows={3}
                      style={{ width: "100%", padding: 10, marginTop: 10, borderRadius: 8, border: "1px solid #d0d7e2", fontSize: 15, resize: "vertical" }}
                    />

                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      <button type="submit" className="btn primary" style={{ flex: 1 }}>Submit</button>
                      <button type="button" className="btn delete" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* My Leaves Table */}
            {showLeaves && (
              <div style={{ marginTop: 30 }}>
                <h3 style={{ marginBottom: 12 }}>My Leave Requests</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.length > 0 ? (
                        leaves.map((leave) => (
                          <tr key={leave.id}>
                            <td>{leave.leaveType}</td>
                            <td>{leave.fromDate}</td>
                            <td>{leave.toDate}</td>
                            <td>{leave.reason}</td>
                            <td><span style={{ fontWeight: 600, color: statusColor(leave.status) }}>{leave.status}</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" className="no-data">No leave requests found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Assets Table */}
            {showAssets && (
              <div style={{ marginTop: 30 }}>
                <h3 style={{ marginBottom: 12 }}>My Assets</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Asset Name</th>
                        <th>Type</th>
                        <th>Tracking ID</th>
                        <th>Date Joining</th>
                        <th>Status</th>
                        <th>Submitted Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.length > 0 ? (
                        assets.map((asset) => (
                          <tr key={asset.id}>
                            <td>{asset.id}</td>
                            <td>{asset.name}</td>
                            <td>{asset.type}</td>
                            <td>{asset.trackingId}</td>
                            <td>{asset.dateJoining}</td>
                            <td>{asset.status}</td>
                            <td>{asset.submittedDate || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="7" className="no-data">No assets assigned</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default EmployeeDashboard;
