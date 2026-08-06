import { useEffect, useState } from "react";
import API from "../api/axiosInstance.js";
import Navbar from "../Components/Navbar.jsx";

function MySalarySlips() {
  const [payrolls, setPayrolls] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/my-payrolls/").then((res) => setPayrolls(res.data)).catch(() => setError("Salary slips load nahi hue"));
  }, []);

  const getStyle = () => {
    const saved = localStorage.getItem("slip_style");
    return saved ? JSON.parse(saved) : { navbar_color: "#1f3b73", th_bg: "#a8bdda", th_color: "#2451aa", border_color: "#e5e7eb", row_hover: "#f9fafb", text_color: "#222222", font_size: "10", padding: "8", company_name: "Employee Asset Management", currency: "Rs." };
  };

  const handleDownload = async (id, month, year) => {
    const s = getStyle();
    const params = Object.entries(s).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    try {
      const res = await API.get(`/payrolls/${id}/download/?${params}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `salary_slip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Download failed");
    }
  };

  const currency = getStyle().currency;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>My Salary Slips</h2>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Month / Year</th>
                <th>Basic Salary</th>
                <th>HRA</th>
                <th>Gross Salary</th>
                <th>Total Deduction</th>
                <th>Net Salary</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length > 0 ? payrolls.map((p) => (
                <tr key={p.id}>
                  <td>{p.month} / {p.year}</td>
                  <td>{currency} {p.basic_salary}</td>
                  <td>{currency} {p.hra}</td>
                  <td>{currency} {p.gross_salary}</td>
                  <td>{currency} {p.total_deduction}</td>
                  <td><strong style={{ color: "#4facfe" }}>{currency} {p.net_salary}</strong></td>
                  <td>
                    <button className="btn view" onClick={() => handleDownload(p.id, p.month, p.year)}>⬇ Download PDF</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="no-data">No salary slips found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default MySalarySlips;
