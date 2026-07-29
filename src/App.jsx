import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddEmployee from "./pages/AddEmployee";
import ViewEmployee from "./pages/ViewEmployee";
import EditEmployee from "./pages/EditEmployee";
import AddAsset from "./pages/AddAsset";
import ViewAssets from "./pages/ViewAssets";
import LeaveRequests from "./pages/LeaveRequests";
import BulkUpload from "./pages/BulkUpload";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeProfileView from "./pages/EmployeeProfileView";
import PayrollForm from "./pages/PayrollForm";
import PayrollList from "./pages/PayrollList";
import MySalarySlips from "./pages/MySalarySlips";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* HR Only Routes */}
      <Route path="/dashboard" element={<ProtectedRoute hrOnly><Dashboard /></ProtectedRoute>} />
      <Route path="/add-employee" element={<ProtectedRoute hrOnly><AddEmployee /></ProtectedRoute>} />
      <Route path="/employee/edit/:id" element={<ProtectedRoute hrOnly><EditEmployee /></ProtectedRoute>} />
      <Route path="/employee/:id/add-asset" element={<ProtectedRoute hrOnly><AddAsset /></ProtectedRoute>} />
      <Route path="/employee/:id/asset" element={<ProtectedRoute hrOnly><ViewAssets /></ProtectedRoute>} />
      <Route path="/employee/:id" element={<ProtectedRoute hrOnly><ViewEmployee /></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute hrOnly><ViewAssets /></ProtectedRoute>} />
      <Route path="/leave-requests" element={<ProtectedRoute hrOnly><LeaveRequests /></ProtectedRoute>} />
      <Route path="/bulk-upload" element={<ProtectedRoute hrOnly><BulkUpload /></ProtectedRoute>} />
      <Route path="/hr/payroll/create" element={<ProtectedRoute hrOnly><PayrollForm /></ProtectedRoute>} />
      <Route path="/hr/payrolls" element={<ProtectedRoute hrOnly><PayrollList /></ProtectedRoute>} />

      {/* Employee Profile - accessible by both HR and Employee */}
      <Route path="/employee-profile/:id" element={<ProtectedRoute><EmployeeProfileView /></ProtectedRoute>} />

      {/* Employee Route */}
      <Route path="/employee-dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/salary-slips" element={<ProtectedRoute><MySalarySlips /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
