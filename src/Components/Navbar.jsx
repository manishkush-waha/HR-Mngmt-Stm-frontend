import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>Employee Asset System</h2>
      <div>
        <span style={{ color: "#a8c4f0", marginRight: 8 }}>{username} ({role})</span>
        {role === "HR" ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/add-employee">Add Employee</Link>
            <Link to="/assets">View Assets</Link>
            <Link to="/leave-requests">Leave Requests</Link>
            <Link to="/hr/payrolls">Salary Slips</Link>
          </>
        ) : (
          <>
            <Link to="/employee-dashboard">My Dashboard</Link>
            <Link to="/employee/salary-slips">My Salary Slips</Link>
          </>
        )}
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
