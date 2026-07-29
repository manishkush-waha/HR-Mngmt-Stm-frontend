import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";

function ViewEmployee() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const empRes = await API.get(`/employees/${id}/`);
      const assetRes = await API.get(`/employees/${id}/assets/`);

      setEmployee(empRes.data);
      setAssets(assetRes.data);
    };

    fetchData();
  }, [id]);

  return (
    <>
      <Navbar />

      <div className="container">
        <h2>Employee Details</h2>

        {employee && (
          <div className="detail-card">
            <p>
              <b>ID:</b> {employee.id}
            </p>
            <p>
              <b>Username:</b> {employee.username}
            </p>
            <p>
              <b>Email:</b> {employee.email}
            </p>

            <Link
              className="btn asset"
              to={`/employee/${employee.id}/add-asset`}
            >
              Add Assets
            </Link>
          </div>
        )}

        <h3>Employee Assets</h3>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Tracking ID</th>
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
                    <td>{asset.tracking_id}</td>
                    <td>{asset.status}</td>
                    <td>{asset.submitted_date || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No assets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ViewEmployee;