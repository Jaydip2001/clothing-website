import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./user-css/profile.css"

function Profile() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))

  const [activeTab, setActiveTab] = useState("profile")
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", password: "", confirmPassword: "" })
  const [msg, setMsg] = useState({ type: "", text: "" })
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    fetchOrders()
    fetchAddresses()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/user/${user.id}`)
      setOrders(res.data)
    } catch { setOrders([]) }
  }

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/addresses/${user.id}`)
      setAddresses(res.data)
    } catch { setAddresses([]) }
  }

  /* ── UPDATE PROFILE ── */
  const handleUpdate = async (e) => {
    e.preventDefault()
    if (form.password && form.password !== form.confirmPassword) {
      setMsg({ type: "error", text: "Passwords do not match" }); return
    }
    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password
      await axios.put(`http://localhost:5000/api/auth/users/${user.id}`, payload)
      const updated = { ...user, name: form.name, email: form.email }
      localStorage.setItem("user", JSON.stringify(updated))
      setMsg({ type: "success", text: "Profile updated successfully!" })
      setForm(f => ({ ...f, password: "", confirmPassword: "" }))
    } catch { setMsg({ type: "error", text: "Failed to update profile" }) }
  }

  /* ── DELETE ACCOUNT ── */
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${user.id}`)
      localStorage.removeItem("user")
      navigate("/")
    } catch { setMsg({ type: "error", text: "Failed to delete account" }) }
  }

  /* ── LOGOUT ── */
  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/")
    window.location.reload()
  }

  const statusColor = (s) => {
    if (s === "paid" || s === "delivered") return "#22c55e"
    if (s === "cancelled") return "#ef4444"
    return "#c8a96e"
  }

  const tabs = [
    { id: "profile",  label: "My Profile",     icon: "👤" },
    { id: "orders",   label: "Order History",   icon: "📦" },
    { id: "address",  label: "My Addresses",    icon: "📍" },
    { id: "payment",  label: "Payment",         icon: "💳" },
  ]

  if (!user) return null

  return (
    <div className="profile-page">

      {/* ── HEADER ── */}
      <div className="profile-header">
        <button className="profile-back" onClick={() => navigate("/")}>← Back to Home</button>
        <div className="profile-header-info">
          <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="profile-header-name">{user.name}</h1>
            <p className="profile-header-email">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="profile-body">

        {/* ── SIDEBAR ── */}
        <aside className="profile-sidebar">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`profile-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="profile-tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}

          <div className="profile-sidebar-divider" />

          <button className="profile-tab logout" onClick={handleLogout}>
            <span className="profile-tab-icon">↩</span>
            Logout
          </button>
          <button className="profile-tab danger" onClick={() => setDeleteConfirm(true)}>
            <span className="profile-tab-icon">🗑</span>
            Delete Account
          </button>
        </aside>

        {/* ── CONTENT ── */}
        <main className="profile-content">

          {/* ════ PROFILE TAB ════ */}
          {activeTab === "profile" && (
            <div className="profile-card">
              <h2 className="profile-card-title">Personal Information</h2>
              {msg.text && (
                <div className={`profile-msg ${msg.type}`}>{msg.text}</div>
              )}
              <form onSubmit={handleUpdate} className="profile-form">
                <div className="profile-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="profile-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="profile-form-divider">
                  <span>Change Password</span>
                </div>
                <div className="profile-form-group">
                  <label>New Password <span>(leave blank to keep current)</span></label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div className="profile-form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
                <button type="submit" className="profile-save-btn">Save Changes</button>
              </form>
            </div>
          )}

          {/* ════ ORDERS TAB ════ */}
          {activeTab === "orders" && (
            <div className="profile-card">
              <h2 className="profile-card-title">Order History</h2>
              {orders.length === 0 ? (
                <div className="profile-empty">
                  <div className="profile-empty-icon">📦</div>
                  <p>No orders yet</p>
                  <button className="profile-empty-btn" onClick={() => navigate("/")}>Start Shopping</button>
                </div>
              ) : (
                <div className="profile-orders">
                  {orders.map(order => (
                    <div key={order.id} className="profile-order-card">
                      <div className="profile-order-top">
                        <div>
                          <span className="profile-order-id">Order #{order.id}</span>
                          <span className="profile-order-date">
                            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <span className="profile-order-status" style={{ color: statusColor(order.status) }}>
                          {order.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="profile-order-bottom">
                        <span className="profile-order-total">₹{order.total_amount}</span>
                        <button className="profile-order-view" onClick={() => navigate("/my-orders")}>
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ ADDRESSES TAB ════ */}
          {activeTab === "address" && (
            <div className="profile-card">
              <h2 className="profile-card-title">Saved Addresses</h2>
              {addresses.length === 0 ? (
                <div className="profile-empty">
                  <div className="profile-empty-icon">📍</div>
                  <p>No saved addresses yet.</p>
                  <p style={{ fontSize: "13px", color: "#9e9e9e", marginTop: "6px" }}>Addresses are saved automatically when you place an order.</p>
                </div>
              ) : (
                <div className="profile-addresses">
                  {addresses.map((a, i) => (
                    <div key={a.id || i} className="profile-address-card">
                      <div className="profile-address-icon">🏠</div>
                      <div>
                        <p className="profile-address-line">{a.street || a.address_line}</p>
                        <p className="profile-address-line">{a.city}, {a.state} — {a.pincode || a.zip}</p>
                        {a.phone && <p className="profile-address-line">📞 {a.phone}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ PAYMENT TAB ════ */}
          {activeTab === "payment" && (
            <div className="profile-card">
              <h2 className="profile-card-title">Payment Options</h2>
              <div className="profile-payment-info">
                <div className="profile-payment-icon">💳</div>
                <h3>Secure Payments</h3>
                <p>We currently support Cash on Delivery and secure online payments at checkout. Your payment details are never stored.</p>
                <div className="profile-payment-methods">
                  <div className="profile-payment-method">
                    <span>🏦</span> Net Banking
                  </div>
                  <div className="profile-payment-method">
                    <span>💳</span> Credit / Debit Card
                  </div>
                  <div className="profile-payment-method">
                    <span>📱</span> UPI
                  </div>
                  <div className="profile-payment-method">
                    <span>📦</span> Cash on Delivery
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteConfirm && (
        <div className="profile-modal-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="profile-modal" onClick={e => e.stopPropagation()}>
            <div className="profile-modal-icon">⚠️</div>
            <h3>Delete Account?</h3>
            <p>This will permanently delete your account, orders, and all data. This action cannot be undone.</p>
            <div className="profile-modal-actions">
              <button className="profile-modal-cancel" onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button className="profile-modal-delete" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Profile