import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axiosInstance.js";
import Navbar from "../components/Navbar.jsx";

function ViewAssets() {
  const para = useParams();
  const [assets, setAssets] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAssets = async () => {
    try {
      const res = await API.get(`/employees/${para.id}/assets`);
      setAssets(res.data);
    } catch (err) {
      setError("Assets does not load it.");
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const updateStatus = async (assetId, status) => {
    setMessage("");
    setError("");

    try {
      await API.patch(`/assets/${assetId}/status`, {
        status: status,
      });

      setMessage("Status updated successfully");
      fetchAssets();
    } catch (err) {
      setError("Status update failed");
    }
  };

  // const deleteAsset = async (assetId) => {
  //   const confirmDelete = window.confirm(
  //     "Would you like to delete this asset permanently ?"
  //   );

  //   if (!confirmDelete) return;

  //   try {
  //     await API.delete(`/assets/${assetId}/`);
  //     fetchAssets();
  //   } catch (err) {
  //     alert("Asset delete failed");
  //   }
  // };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2>View Assets</h2>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Name</th>
                <th>Type</th>
                <th>Tracking ID</th>
                <th>Status</th>
                <th>Submitted Date</th>
                {/* <th>Action</th> */}
              </tr>
            </thead>

            <tbody>
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>
                    <td>{asset.employeeUsername}</td>
                    <td>{asset.name}</td>
                    <td>{asset.type}</td>
                    <td>{asset.trackingId}</td>

                    <td>
                      <select
                        value={asset.status}
                        onChange={(e) =>
                          updateStatus(asset.id, e.target.value)
                        }
                        className="status-select"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Using">Using</option>
                        <option value="Repair">Repair</option>
                      </select>
                    </td>

                    <td>{asset.submittedDate || "-"}</td>

                    {/* <td>
                      <button
                        className="btn delete"
                        onClick={() => deleteAsset(asset.id)}
                      >
                        Delete
                      </button>
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
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

export default ViewAssets;