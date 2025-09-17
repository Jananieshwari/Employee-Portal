import React, { useEffect, useState } from 'react';
import api from "../api"; 
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await api.get("/api/admin/users");   // ✅ relative path
      setUsers(res.data || []);
    } catch (err) {
      console.error("Fetch users error:", err.response?.data || err.message);
      setMsg("❌ Failed to load users...");
    }
  }

  async function approve(userId) {
    try {
      await api.post(`/api/admin/approve/${userId}`, { action: 'approve' }); // ✅ relative path
      setMsg('✅ User approved');
      fetchUsers();
    } catch (err) {
      console.error("Approve error:", err.response?.data || err.message);
      setMsg('❌ Approve failed');
    }
  }

  async function downloadDocument(userId, filename) {
    try {
      const res = await api.get(
        `/api/admin/download/${userId}/${encodeURIComponent(filename)}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Download error:", err.response?.data || err.message);
      setMsg('❌ Document download failed');
    }
  }

  function downloadPersonal(user) {
    if (!user.personal) return;
    const headers = Object.keys(user.personal).join(",");
    const values = Object.values(user.personal).join(",");
    const csv = `${headers}\n${values}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user.name}_personal_details.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function deleteUser(userId) {
    if (!window.confirm('Delete user and all files?')) return;
    try {
      await api.delete(`/api/admin/delete-user/${userId}`);  // ✅ relative path
      setMsg('✅ User deleted');
      fetchUsers();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      setMsg(err.response?.data?.msg || err.response?.data || err.message || '❌ Delete failed');

    }
  }

  return (
    <div className="auth-card wide">
      <h2>Admin Dashboard</h2>
      {msg && <div className="notice">{msg}</div>}

      <div className="accordion">
        {users.map(u => (
          <div key={u.id} className="user-row card-3d">
            <div className="user-head">
              <strong>{u.name} ({u.email})</strong>
              <div className="muted">Status: {u.status}</div>
            </div>

            <div className="user-body">
              <h4>Personal Details</h4>
              {u.personal ? (
                <table className="personal-table">
                  <tbody>
                    {Object.entries(u.personal).map(([key, value], i) => (
                      <tr key={i}>
                        <td className="label">{key}</td>
                        <td className="value">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="muted">No personal details provided.</p>
              )}
              <button className="btn ghost small" onClick={() => downloadPersonal(u)}>⬇ Download Personal</button>

              <h4>Documents</h4>
              <ul>
                {u.documents && u.documents.map((d, i) => (
                  <li key={i}>
                    {d.original}
                    <button className="btn ghost small" onClick={() => downloadDocument(u.id, d.filename)}>⬇ Download</button>
                  </li>
                ))}
              </ul>

              <div className="row gap">
                {u.status === 'pending' && (
                  <button className="btn" onClick={() => approve(u.id)}>✅ Approve</button>
                )}
                <button className="btn danger" onClick={() => deleteUser(u.id)}>🗑️ Delete User</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
