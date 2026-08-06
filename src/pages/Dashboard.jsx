import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance.js";

import * as XLSX from "xlsx";
import {
  LogOut,
  LayoutDashboard,
  Users,
  UserPlus,
  FileSpreadsheet,
  ClipboardList,
  IndianRupee,
  Wallet,
  Eye,
  Pencil,
  Trash2,
  PackagePlus,
  PackageSearch,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const PER_PAGE = 8;

const areaData = [
  { month: "Jan", employees: 8 },
  { month: "Feb", employees: 14 },
  { month: "Mar", employees: 11 },
  { month: "Apr", employees: 20 },
  { month: "May", employees: 17 },
  { month: "Jun", employees: 25 },
  { month: "Jul", employees: 22 },
  { month: "Aug", employees: 30 },
  { month: "Sep", employees: 28 },
  { month: "Oct", employees: 35 },
  { month: "Nov", employees: 32 },
  { month: "Dec", employees: 40 },
];

const barData = [
  { day: "M", value: 300 },
  { day: "T", value: 450 },
  { day: "W", value: 200 },
  { day: "T", value: 500 },
  { day: "F", value: 350 },
  { day: "S", value: 420 },
  { day: "S", value: 280 },
  { day: "M", value: 480 },
  { day: "T", value: 390 },
  { day: "W", value: 460 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1a2744", border: "1px solid #2d3f6b", borderRadius: 8, padding: "8px 14px" }}>
        <p style={{ color: "#a0aec0", fontSize: 12 }}>{label}</p>
        <p style={{ color: "#4facfe", fontWeight: 700 }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);
  const [payrollCount, setPayrollCount] = useState(0);
  const [page, setPage] = useState(1);
  const [showEmployees, setShowEmployees] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [exportForm, setExportForm] = useState({
    start: "", end: "",
    employees: false, leaves: false, payrolls: false, assets: false,
  });
  const [exporting, setExporting] = useState(false);

  // ── 4 CHART STATES ──
  const [chartDates, setChartDates] = useState({ emp: { start: "", end: "" }, asset: { start: "", end: "" }, leave: { start: "", end: "" }, payroll: { start: "", end: "" } });
  const [chartData, setChartData] = useState({ employees: [], assets: [], leaves: [], payrolls: [] });

  const fetchCharts = async (overrides = {}) => {
    const d = { ...chartDates, ...overrides };
    const buildParams = (obj) => { const p = new URLSearchParams(); if (obj.start) p.append("start", obj.start); if (obj.end) p.append("end", obj.end); return p.toString(); };
    try {
      const [empRes, assetRes, leaveRes, payrollRes] = await Promise.all([
        API.get(`/chart-stats/?${buildParams(d.emp)}`),
        API.get(`/chart-stats/?${buildParams(d.asset)}`),
        API.get(`/chart-stats/?${buildParams(d.leave)}`),
        API.get(`/chart-stats/?${buildParams(d.payroll)}`),
      ]);
      setChartData({ employees: empRes.data.employees, assets: assetRes.data.assets, leaves: leaveRes.data.leaves, payrolls: payrollRes.data.payrolls });
    } catch {}
  };

  const exportChart = async (type, dates) => {
    try {
      const params = new URLSearchParams();
      if (dates.start) params.append("start", dates.start);
      if (dates.end) params.append("end", dates.end);
      params.append("sections", type);
      const res = await API.get(`/export-report/?${params.toString()}`);
      const rows = res.data[type];
      if (!rows?.length) { alert("No data found for selected date range"); return; }
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryWs = XLSX.utils.json_to_sheet([
        { Category: type.charAt(0).toUpperCase() + type.slice(1), Count: rows.length },
      ]);
      summaryWs["!cols"] = [{ wch: 28 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      const ws = XLSX.utils.json_to_sheet(rows.map((r) => ({ ...r, created_at: r.created_at ? new Date(r.created_at).toLocaleDateString() : undefined })));
      XLSX.utils.book_append_sheet(wb, ws, type.charAt(0).toUpperCase() + type.slice(1));
      const label = dates.start && dates.end ? `_${dates.start}_to_${dates.end}` : "";
      XLSX.writeFile(wb, `${type}${label}.xlsx`);
    } catch { alert("Export failed"); }
  };

  const handleExport = async () => {
    const selected = ["employees", "leaves", "payrolls", "assets"].filter((s) => exportForm[s]);
    if (!selected.length) { alert("Select at list one section!!"); return; }
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (exportForm.start) params.append("start", exportForm.start);
      if (exportForm.end) params.append("end", exportForm.end);
      params.append("sections", selected.join(","));
      const res = await API.get(`/export-report/?${params.toString()}`);
      const wb = XLSX.utils.book_new();

      // ── SUMMARY SHEET ──
      const summaryRows = [
        { Category: "Registered Employees", Count: res.data.employees?.length ?? 0 },
        { Category: "Leave Requests", Count: res.data.leaves?.length ?? 0 },
        { Category: "Payrolls Generated", Count: res.data.payrolls?.length ?? 0 },
        { Category: "Assets", Count: res.data.assets?.length ?? 0 },
      ];
      const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
      summaryWs["!cols"] = [{ wch: 28 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      if (res.data.employees?.length) {
        const ws = XLSX.utils.json_to_sheet(res.data.employees);
        XLSX.utils.book_append_sheet(wb, ws, "Employees");
      }
      if (res.data.leaves?.length) {
        const ws = XLSX.utils.json_to_sheet(res.data.leaves.map((l) => ({
          ...l, created_at: l.created_at ? new Date(l.created_at).toLocaleDateString() : "",
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Leave Requests");
      }
      if (res.data.payrolls?.length) {
        const ws = XLSX.utils.json_to_sheet(res.data.payrolls.map((p) => ({
          ...p, created_at: p.created_at ? new Date(p.created_at).toLocaleDateString() : "",
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Payrolls");
      }
      if (res.data.assets?.length) {
        const ws = XLSX.utils.json_to_sheet(res.data.assets);
        XLSX.utils.book_append_sheet(wb, ws, "Assets");
      }

      if (wb.SheetNames.length === 0) { alert("No data found in the selected date range"); return; }

      const dateLabel = exportForm.start && exportForm.end
        ? `_${exportForm.start}_to_${exportForm.end}` : "";
      XLSX.writeFile(wb, `HR_Report${dateLabel}.xlsx`);
      setShowExport(false);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const theme = {
    bg: darkMode ? "#0b1437" : "#f0f4ff",
    sidebar: darkMode ? "#111c44" : "#ffffff",
    card: darkMode ? "#111c44" : "#ffffff",
    border: darkMode ? "#1e2d5a" : "#dde3f0",
    text: darkMode ? "white" : "#1a202c",
    subtext: darkMode ? "#718096" : "#64748b",
    muted: darkMode ? "#4a5568" : "#94a3b8",
    inputBg: darkMode ? "#111c44" : "#ffffff",
    rowHover: darkMode ? "#ffffff05" : "#f8faff",
    pageBg: darkMode ? "#1e2d5a" : "#e2e8f0",
  };

  const username = localStorage.getItem("username") || "HR Admin";

  useEffect(() => {
    API.get("/employees").then((res) => setEmployees(res.data)).catch((err) => {});
    API.get("/leaves/all").then((res) => setLeaveCount(res.data.length)).catch(() => {});
    API.get("/payrolls").then((res) => setPayrollCount(res.data.length)).catch(() => {});
    fetchCharts();
  }, []);

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await API.delete(`/employees/${id}/`);
      API.get("/employees/").then((res) => { setEmployees(res.data); setPage(1); });
    } catch {
      alert("Delete failed");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filtered = employees.filter(
    (e) =>
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const statCards = [
    { label: "Total Employees", value: employees.length, change: "+5%", up: true, color: "#4facfe" },
    { label: "Leave Requests", value: leaveCount, change: "-2%", up: false, color: "#a78bfa" },
    { label: "Payrolls", value: payrollCount, change: "+12%", up: true, color: "#34d399" },
    { label: "Departments", value: [...new Set(employees.map((e) => e.position || "Unknown"))].length, change: "+3%", up: true, color: "#f97316" },
  ];

  const navItems = [
    { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { id: "employees", icon: <Users size={18} />, label: "Employees" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Inter', Arial, sans-serif", transition: "all 0.3s" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 240, background: theme.sidebar, display: "flex", flexDirection: "column", padding: "24px 16px", borderRight: `1px solid ${theme.border}`, flexShrink: 0, transition: "all 0.3s" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, paddingLeft: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4facfe,#00f2fe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LayoutDashboard size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.5 }}>HR Portal</span>
        </div>

        {/* Nav */}
        <p style={{ fontSize: 11, color: theme.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 10, paddingLeft: 8 }}>MAIN PAGES</p>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveNav(item.id); if (item.id === "employees") setShowEmployees(true); else setShowEmployees(false); }}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 4, background: activeNav === item.id ? "linear-gradient(135deg,#4facfe22,#00f2fe11)" : "transparent", color: activeNav === item.id ? "#4facfe" : theme.subtext, fontWeight: activeNav === item.id ? 600 : 400, fontSize: 14, transition: "all 0.2s", borderLeft: activeNav === item.id ? "3px solid #4facfe" : "3px solid transparent" }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <p style={{ fontSize: 11, color: theme.muted, fontWeight: 600, letterSpacing: 1, margin: "20px 0 10px", paddingLeft: 8 }}>ACTIONS</p>

        {[
          { to: "/add-employee", icon: <UserPlus size={18} />, label: "Add Employee" },
          { to: "/bulk-upload", icon: <FileSpreadsheet size={18} />, label: "Bulk Upload" },
          { to: "/leave-requests", icon: <ClipboardList size={18} />, label: "Leave Requests" },
          { to: "/hr/payroll/create", icon: <IndianRupee size={18} />, label: "Generate Slip" },
          { to: "/hr/payrolls", icon: <Wallet size={18} />, label: "View Payrolls" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, marginBottom: 4, color: theme.subtext, fontSize: 14, textDecoration: "none", transition: "all 0.2s", borderLeft: "3px solid transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#4facfe"; e.currentTarget.style.background = "#4facfe11"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.subtext; e.currentTarget.style.background = "transparent"; }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        <button
          onClick={() => setShowExport(true)}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, marginBottom: 4, color: "#4facfe", fontSize: 14, background: "#4facfe11", border: "none", cursor: "pointer", transition: "all 0.2s", borderLeft: "3px solid #4facfe", fontWeight: 600 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#4facfe22"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#4facfe11"; }}
        >
          <Download size={18} />
          Export Report
        </button>

        <div style={{ flex: 1 }} />

        {/* Help card */}
        {/* <div style={{ background: "linear-gradient(135deg,#4facfe,#00f2fe)", borderRadius: 14, padding: "16px", marginBottom: 16, textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Need help?</p>
          <p style={{ fontSize: 11, opacity: 0.85, marginBottom: 10 }}>Please check our docs</p>
          <button style={{ background: "white", color: "#4facfe", border: "none", borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>DOCUMENTATION</button>
        </div> */}

        <button
          onClick={logout}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "#ef444422", color: "#ef4444", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>

        {/* ── EXPORT MODAL ── */}
        {showExport && (
          <div style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 32, width: 460, boxShadow: "0 20px 60px #00000066" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Export Report to Excel</h3>
              <p style={{ fontSize: 13, color: theme.subtext, marginBottom: 20 }}>Select your date and checkboxes!!</p>

              {/* Date Range */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, color: theme.subtext, display: "block", marginBottom: 6 }}>Start Date</label>
                  <input type="date" value={exportForm.start}
                    onChange={(e) => setExportForm({ ...exportForm, start: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 13, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: theme.subtext, display: "block", marginBottom: 6 }}>End Date</label>
                  <input type="date" value={exportForm.end}
                    onChange={(e) => setExportForm({ ...exportForm, end: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 13, outline: "none" }}
                  />
                </div>
              </div>

              {/* Section Checkboxes */}
              <p style={{ fontSize: 12, color: theme.subtext, marginBottom: 10, fontWeight: 600, letterSpacing: 0.5 }}>SECTIONS TO INCLUDE</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {[
                  { key: "employees", label: "Employees", desc: "Added in date range", color: "#4facfe" },
                  { key: "leaves", label: "Leave Requests", desc: "Created in date range", color: "#a78bfa" },
                  { key: "payrolls", label: "Payrolls", desc: "Generated in date range", color: "#34d399" },
                  { key: "assets", label: "Assets", desc: "Date joining in range", color: "#f97316" },
                ].map(({ key, label, desc, color }) => (
                  <div key={key}
                    onClick={() => setExportForm({ ...exportForm, [key]: !exportForm[key] })}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: `1px solid ${exportForm[key] ? color + "88" : theme.border}`, background: exportForm[key] ? color + "11" : "transparent", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${exportForm[key] ? color : theme.muted}`, background: exportForm[key] ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                      {exportForm[key] && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: exportForm[key] ? color : theme.text, margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 11, color: theme.muted, margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleExport} disabled={exporting}
                  style={{ flex: 1, background: "linear-gradient(135deg,#4facfe,#00f2fe)", color: "white", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700, cursor: exporting ? "not-allowed" : "pointer", opacity: exporting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Download size={16} />{exporting ? "Exporting..." : "Export Excel"}
                </button>
                <button onClick={() => setShowExport(false)}
                  style={{ padding: "11px 20px", background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            
            <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>HR ANALYTICS DASHBOARD</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: 20, padding: "8px 16px" }}>
              <Search size={14} color={theme.subtext} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search employees..."
                style={{ background: "transparent", border: "none", outline: "none", color: theme.text, fontSize: 13, width: 160 }}
              />
            </div> */}
            {/* <button
              onClick={() => setShowExport(true)}
              style={{ background: "linear-gradient(135deg,#4facfe,#00f2fe)", border: "none", borderRadius: 12, padding: "8px 16px", cursor: "pointer", color: "white", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 }}
            >
              <Download size={16} /> Export Report
            </button> */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "8px 12px", cursor: "pointer", color: theme.subtext, display: "flex", alignItems: "center", transition: "all 0.3s" }}
            >
              {darkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "6px 12px" }}>
              <img src="https://i.pravatar.cc/32?img=12" alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{username}</span>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
          {statCards.map((card, i) => (
            <div key={i} style={{ background: theme.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${theme.border}`, position: "relative", overflow: "hidden", transition: "all 0.3s" }}>
              <div style={{ position: "absolute", top: 16, right: 16, width: 44, height: 44, borderRadius: 12, background: card.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: card.color }} />
              </div>
              <p style={{ color: theme.subtext, fontSize: 12, marginBottom: 8 }}>{card.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: theme.text, marginBottom: 6 }}>{card.value.toLocaleString()}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {card.up ? <TrendingUp size={14} color="#34d399" /> : <TrendingDown size={14} color="#ef4444" />}
                <span style={{ fontSize: 12, color: card.up ? "#34d399" : "#ef4444", fontWeight: 600 }}>{card.change}</span>
                <span style={{ fontSize: 12, color: theme.muted }}>since last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── REAL DATA CHARTS ── */}
        {(() => {
          const PIE_COLORS = ["#4facfe", "#34d399", "#f97316", "#a78bfa", "#f43f5e"];
          const inputStyle = { padding: "6px 10px", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.text, fontSize: 12, outline: "none" };
          const chartCardStyle = { background: theme.card, borderRadius: 20, padding: "20px 22px", border: `1px solid ${theme.border}`, transition: "all 0.3s" };

          const ChartHeader = ({ title, sub, color, type, dates, onDateChange }) => (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div>
                <p style={{ color: theme.subtext, fontSize: 12, marginBottom: 2 }}>{sub}</p>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{title}</h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <input type="date" value={dates.start} style={inputStyle}
                  onChange={(e) => { const nd = { ...chartDates, [type]: { ...dates, start: e.target.value } }; setChartDates(nd); fetchCharts({ [type]: { ...dates, start: e.target.value } }); }} />
                <span style={{ color: theme.muted, fontSize: 12 }}>to</span>
                <input type="date" value={dates.end} style={inputStyle}
                  onChange={(e) => { const nd = { ...chartDates, [type]: { ...dates, end: e.target.value } }; setChartDates(nd); fetchCharts({ [type]: { ...dates, end: e.target.value } }); }} />
                <button onClick={() => exportChart(type === "emp" ? "employees" : type === "asset" ? "assets" : type === "leave" ? "leaves" : "payrolls", dates)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Download size={13} /> Excel
                </button>
              </div>
            </div>
          );

          return (
            <>
              {/* Row 1: Employee Wave + Asset Pie */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

                {/* Employee Wave Chart */}
                <div style={chartCardStyle}>
                  <ChartHeader title="Employee Registrations" sub="Wave Chart" color="#4facfe" type="emp" dates={chartDates.emp} />
                  <div style={{ height: 220 }}>
                    {chartData.employees.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.employees}>
                          <defs>
                            <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4facfe" stopOpacity={0.5} />
                              <stop offset="95%" stopColor="#4facfe" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                          <XAxis dataKey="date" tick={{ fill: theme.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: theme.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "#1a2744", border: "1px solid #2d3f6b", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#a0aec0" }} itemStyle={{ color: "#4facfe" }} />
                          <Area type="monotone" dataKey="employees" stroke="#4facfe" strokeWidth={2.5} fill="url(#empGrad)" dot={{ fill: "#4facfe", r: 3 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: theme.muted, fontSize: 13 }}>No data for selected range</div>}
                  </div>
                </div>

                {/* Asset Pie Chart */}
                <div style={chartCardStyle}>
                  <ChartHeader title="Assets by Status" sub="Pie Chart" color="#f97316" type="asset" dates={chartDates.asset} />
                  <div style={{ height: 220, display: "flex", alignItems: "center" }}>
                    {chartData.assets.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData.assets} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {chartData.assets.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#1a2744", border: "1px solid #2d3f6b", borderRadius: 8, fontSize: 12 }} itemStyle={{ color: "#fff" }} />
                          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, color: theme.subtext }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div style={{ width: "100%", textAlign: "center", color: theme.muted, fontSize: 13 }}>No data for selected range</div>}
                  </div>
                </div>
              </div>

              {/* Row 2: Leave Histogram + Payroll Time Series */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

                {/* Leave Wave Chart */}
                <div style={chartCardStyle}>
                  <ChartHeader title="Leave Requests by Type" sub="Wave Chart" color="#a78bfa" type="leave" dates={chartDates.leave} />
                  <div style={{ height: 220 }}>
                    {chartData.leaves.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.leaves}>
                          <defs>
                            <linearGradient id="leaveGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.5} />
                              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                          <XAxis dataKey="type" tick={{ fill: theme.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: theme.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "#1a2744", border: "1px solid #2d3f6b", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#a0aec0" }} itemStyle={{ color: "#a78bfa" }} />
                          <Area type="monotone" dataKey="count" stroke="#a78bfa" strokeWidth={2.5} fill="url(#leaveGrad)" dot={{ fill: "#a78bfa", r: 4 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: theme.muted, fontSize: 13 }}>No data for selected range</div>}
                  </div>
                </div>

                {/* Payroll Time Series */}
                <div style={chartCardStyle}>
                  <ChartHeader title="Payrolls Generated" sub="Time Series" color="#34d399" type="payroll" dates={chartDates.payroll} />
                  <div style={{ height: 220 }}>
                    {chartData.payrolls.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.payrolls}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                          <XAxis dataKey="period" tick={{ fill: theme.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: theme.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "#1a2744", border: "1px solid #2d3f6b", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#a0aec0" }} itemStyle={{ color: "#34d399" }} />
                          <Line type="monotone" dataKey="payrolls" stroke="#34d399" strokeWidth={2.5} dot={{ fill: "#34d399", r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: theme.muted, fontSize: 13 }}>No data for selected range</div>}
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        {/* ── EMPLOYEE TABLE ── */}
        <div style={{ background: theme.card, borderRadius: 20, padding: "22px 24px", border: `1px solid ${theme.border}`, transition: "all 0.3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text }}>Employees</h3>
              <p style={{ color: "#34d399", fontSize: 12, marginTop: 3 }}>▲ {employees.length} total registered</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowEmployees(!showEmployees)}
                style={{ background: showEmployees ? "#4facfe22" : "#4facfe", color: showEmployees ? "#4facfe" : "white", border: "1px solid #4facfe", borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                {showEmployees ? "Hide Table" : "View All"}
              </button>
              <Link to="/add-employee" style={{ background: "linear-gradient(135deg,#4facfe,#00f2fe)", color: "white", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                <UserPlus size={14} /> Add New
              </Link>
            </div>
          </div>

          {showEmployees && (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                  <thead>
                    <tr style={{ borderBottom: `3px solid ${theme.border}` }}>
                      {["ID", "Name", "Email", "Position", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: theme.muted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length > 0 ? paginated.map((emp) => (
                      <tr key={emp.id} style={{ borderBottom: `1px solid ${theme.border}` }}
                        onMouseEnter={(e) => e.currentTarget.style.background = theme.rowHover}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "14px", color: theme.subtext, fontSize: 13 }}>#{emp.id}</td>
                        <td style={{ padding: "14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4facfe22,#00f4fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                              {emp.username[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{emp.username}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px", color: theme.subtext, fontSize: 13 }}>{emp.email}</td>
                        <td style={{ padding: "14px" }}>
                          <span style={{ background: "#4facfe22", color: "#4facfe", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                            {emp.position || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "14px" }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {[
                              { to: `/employee-profile/${emp.id}`, icon: <Eye size={13} />, label: "View", color: "#0ea5e9" },
                              { to: `/employee/edit/${emp.id}`, icon: <Pencil size={13} />, label: "Edit", color: "#f59e0b" },
                              { to: `/employee/${emp.id}/add-asset`, icon: <PackagePlus size={13} />, label: "Asset", color: "#34d399" },
                              { to: `/employee/${emp.id}/asset`, icon: <PackageSearch size={13} />, label: "Assets", color: "#a78bfa" },
                            ].map((btn) => (
                              <Link key={btn.to} to={btn.to} style={{ display: "flex", alignItems: "center", gap: 4, background: btn.color + "22", color: btn.color, border: `1px solid ${btn.color}44`, borderRadius: 7, padding: "5px 10px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                                {btn.icon}{btn.label}
                              </Link>
                            ))}
                            <button
                              onClick={() => deleteEmployee(emp.id)}
                              style={{ display: "flex", alignItems: "center", gap: 4, background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444", borderRadius: 7, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ padding: 30, textAlign: "center", color: theme.muted }}>No employees found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 16 }}>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ background: theme.pageBg, border: "none", borderRadius: 8, padding: "6px 10px", color: page === 1 ? theme.muted : theme.text, cursor: page === 1 ? "default" : "pointer" }}>
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ background: page === p ? "linear-gradient(135deg,#4facfe,#00f2fe)" : theme.pageBg, border: "none", borderRadius: 8, padding: "6px 12px", color: page === p ? "white" : theme.text, cursor: "pointer", fontWeight: page === p ? 700 : 400, fontSize: 13 }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ background: theme.pageBg, border: "none", borderRadius: 8, padding: "6px 10px", color: page === totalPages ? theme.muted : theme.text, cursor: page === totalPages ? "default" : "pointer" }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
