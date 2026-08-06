import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axiosInstance.js";
import Navbar from "../Components/Navbar.jsx";

const DEFAULT_STYLE = {
  navbar_color: "#1f3b73",
  th_bg: "#a8bdda",
  th_color: "#2451aa",
  border_color: "#e5e7eb",
  row_hover: "#f9fafb",
  text_color: "#222222",
  font_size: "10",
  padding: "8",
  company_name: "Employee Asset Management",
  currency: "Rs.",
};

function PayrollList() {
  const [payrolls, setPayrolls] = useState([]);
  const [error, setError] = useState("");
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [style, setStyle] = useState(() => {
    const saved = localStorage.getItem("slip_style");
    return saved ? JSON.parse(saved) : DEFAULT_STYLE;
  });

  useEffect(() => {
    API.get("/payrolls").then((res) => setPayrolls(res.data)).catch(() => setError("Payrolls load nahi hue"));
  }, []);

  const handleStyleChange = (e) => setStyle({ ...style, [e.target.name]: e.target.value });

  const saveStyle = () => {
    localStorage.setItem("slip_style", JSON.stringify(style));
    setShowCustomizer(false);
  };

  const buildParams = () =>
    Object.entries(style).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");

  const handleDownload = async (id, name, month, year) => {
    try {
      const res = await API.get(`/payrolls/${id}/download/?${buildParams()}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a"); 
      link.href = url;
      link.setAttribute("download", `salary_slip_${name}_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Download failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>All Salary Slips</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn edit" onClick={() => setShowCustomizer(!showCustomizer)}>⚙ Customize PDF</button>
            <Link to="/hr/payroll/create" className="btn primary">+ Generate Salary Slip</Link>
          </div>
        </div>

        {/* Customization Panel */}
        {showCustomizer && (
          <div style={{ background: "#111c44", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid #1e2d5a" }}>
            <h3 style={{ marginBottom: 16, color: "#4facfe" }}>PDF Customization</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>

              <div>
                <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4 }}>Company Name</label>
                <input name="company_name" value={style.company_name} onChange={handleStyleChange} style={{ margin: 0 }} />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4 }}>Currency Symbol</label>
                <select name="currency" value={style.currency} onChange={handleStyleChange} style={{ margin: 0 }}>
                  <option value="Rs.">Rs. (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="¥">¥ (JPY)</option>
                </select>
              </div>

              {[
                ["navbar_color", "Header Color"],
                ["th_bg", "Table Header BG"],
                ["th_color", "Table Header Text"],
                ["border_color", "Border Color"],
                ["row_hover", "Row Hover Color"],
                ["text_color", "Text Color"],
              ].map(([name, label]) => (
                <div key={name}>
                <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4 }}>{label}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="color" name={name} value={style[name]} onChange={handleStyleChange}
                      style={{ width: 40, height: 36, padding: 2, margin: 0, cursor: "pointer" }} />
                    <input name={name} value={style[name]} onChange={handleStyleChange}
                      style={{ margin: 0, flex: 1, fontSize: 13 }} />
                  </div>
                </div>
              ))}

              <div>
                <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4 }}>Font Size ({style.font_size}px)</label>
                <input type="range" name="font_size" min="8" max="14" value={style.font_size} onChange={handleStyleChange}
                  style={{ width: "100%", margin: 0 }} />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4 }}>Padding ({style.padding}px)</label>
                <input type="range" name="padding" min="4" max="16" value={style.padding} onChange={handleStyleChange}
                  style={{ width: "100%", margin: 0 }} />
              </div>
            </div>

            {/* Live Preview */}
            <div style={{ marginTop: 16, border: `2px solid ${style.border_color}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ background: style.navbar_color, color: "white", padding: "10px 16px", fontWeight: 700, fontSize: 15 }}>
                {style.company_name} — Salary Slip Preview
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: parseInt(style.font_size) + 2 }}>
                <thead>
                  <tr>
                    {["Employee", "Month/Year", "Gross", "Deduction", "Net Salary"].map((h) => (
                      <th key={h} style={{ background: style.th_bg, color: style.th_color, padding: style.padding + "px", border: `1px solid ${style.border_color}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: style.row_hover }}>
                    {["John Doe", "May / 2025", `${style.currency} 30000`, `${style.currency} 5000`, `${style.currency} 25000`].map((v, i) => (
                      <td key={i} style={{ color: style.text_color, padding: style.padding + "px", border: `1px solid ${style.border_color}` }}>{v}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn primary" onClick={saveStyle}>Save & Apply</button>
              <button className="btn delete" onClick={() => { setStyle(DEFAULT_STYLE); localStorage.removeItem("slip_style"); }}>Reset to Default</button>
            </div>
          </div>
        )}

        {error && <p className="error">{error}</p>}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month / Year</th>
                <th>Gross Salary</th>
                <th>Deduction</th>
                <th>Net Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length > 0 ? payrolls.map((p) => (
                <tr key={p.id}>
                  <td>{p.employee}</td>
                  <td>{p.month} / {p.year}</td>
                  <td>{style.currency} {p.grossSalary}</td>
                  <td>{style.currency} {p.totalDeduction}</td>
                  <td><strong>{style.currency} {p.netSalary}</strong></td>
                  <td className="actions">
                    <button className="btn view" onClick={() => handleDownload(p.id, p.employee, p.month, p.year)}>⬇ Download PDF</button>
                  </td>
                </tr> 
              )) : (
                <tr><td colSpan="6" className="no-data">No payrolls found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default PayrollList;
