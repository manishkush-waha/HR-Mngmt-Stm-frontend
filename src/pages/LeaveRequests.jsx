import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import Navbar from "../Components/Navbar";

function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchLeaves = () => {
    API.get("/leaves/all")
      .then((res) => setLeaves(res.data))
      .catch(() => setError("Leave requests did not load."));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const updateStatus = async (id, status) => {
    setMessage(""); setError("");
    try {
      await API.patch(`/leaves/${id}/status`, { status });
      setMessage(`Leave ${status} Successfully! The email has been sent to the employee.`);
      fetchLeaves();
    } catch {
      setError("Status update failed");
    }
  };

  const statusColor = (s) => s === "Approved" ? "#16a34a" : s === "Rejected" ? "#ef4444" : "#f59e0b";

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>Leave Requests</h2>
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.employee_username}</td>
                    <td>{leave.employee_email}</td>
                    <td>{leave.leave_type}</td>
                    <td>{leave.from_date}</td>
                    <td>{leave.to_date}</td>
                    <td>{leave.reason}</td>
                    <td><span style={{ fontWeight: 600, color: statusColor(leave.status) }}>{leave.status}</span></td>
                    <td>
                      {leave.status === "Pending" && (
                        <div className="actions">
                          <button className="btn asset" onClick={() => updateStatus(leave.id, "Approved")}>Approve</button>
                          <button className="btn delete" onClick={() => updateStatus(leave.id, "Rejected")}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="no-data">No leave requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default LeaveRequests;
