import { useEffect, useState } from "react"
import axios from "axios"
import AdminLayout from "./Adminlayout"
import "./admin-css/admin.css"

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [editUser, setEditUser] = useState(null)  // user being edited
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [search, setSearch] = useState("")

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/auth/users")
    setUsers(res.data)
  }

  useEffect(() => { fetchUsers() }, [])

  /* ── OPEN EDIT MODAL ── */
  const openEdit = (user) => {
    setEditUser(user)
    setForm({ name: user.name, email: user.email, password: "" })
  }

  /* ── SAVE EDIT ── */
  const saveEdit = async () => {
    if (!form.name || !form.email) { alert("Name and email are required"); return }
    await axios.put(`http://localhost:5000/api/auth/users/${editUser.id}`, form)
    setEditUser(null)
    fetchUsers()
  }

  /* ── DELETE USER ── */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? This will also remove their orders and data.")) return
    await axios.delete(`http://localhost:5000/api/auth/users/${id}`)
    fetchUsers()
  }

  /* ── FILTERED ── */
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Users">

      <div className="page-header flex-between">
        <div>
          <h1>Manage Users</h1>
          <p>View, edit and remove registered users</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            className="form-control"
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "260px" }}
          />
        </div>
      </div>

      {/* ── USERS TABLE ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Users ({filtered.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td className="text-muted">{u.id}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* AVATAR */}
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "var(--accent-soft)", border: "2px solid var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", fontWeight: 700, color: "var(--accent)",
                      flexShrink: 0
                    }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <b>{u.name}</b>
                  </div>
                </td>
                <td className="text-secondary">{u.email}</td>
                <td>
                  <span className="badge badge-shipped">{u.total_orders} orders</span>
                </td>
                <td><span className="text-accent">₹{Number(u.total_spent).toLocaleString()}</span></td>
            
               
                <td style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── EDIT MODAL ── */}
      {editUser && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999
        }}>
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "32px",
            width: "100%",
            maxWidth: "440px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: "18px", color: "var(--text-primary)" }}>
                ✏️ Edit User
              </h3>
              <button
                onClick={() => setEditUser(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* AVATAR */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
              <div style={{
                width: 50, height: 50, borderRadius: "50%",
                background: "var(--accent-soft)", border: "2px solid var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 700, color: "var(--accent)"
              }}>
                {editUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{editUser.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>User ID #{editUser.id}</div>
              </div>
            </div>

            <div className="admin-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="form-control"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-group">
                <label>New Password <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(leave blank to keep current)</span></label>
                <input
                  className="form-control"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>
                  ✓ Save Changes
                </button>
                <button className="btn btn-ghost" onClick={() => setEditUser(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  )
}

export default AdminUsers