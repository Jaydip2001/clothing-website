import { Link, useLocation, useNavigate } from "react-router-dom"
import "./admin-css/admin.css"

const navItems = [
  { to: "/admin",            icon: "📊", label: "Dashboard" },
  { to: "/admin/users",      icon: "👥", label: "Users" },     // ← add this
  { to: "/admin/products",   icon: "👗", label: "Products" },
  { to: "/admin/categories", icon: "🗂️",  label: "Categories" },
  { to: "/admin/orders",     icon: "📦", label: "Orders" },
  { to: "/admin/reviews",    icon: "⭐", label: "Reviews" },
  { to: "/admin/inventory",  icon: "🏭", label: "Inventory" },
]

function AdminLayout({ children, title }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("admin")
    navigate("/admin/login")
  }

  return (
    <div className="admin-layout">

      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">

        <div className="sidebar-logo">
          <h2>⚡ StyleAdmin</h2>
          <span>Control Panel</span>
        </div>

        <p className="sidebar-section-label">Navigation</p>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${location.pathname === item.to ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="icon">🚪</span>
            Logout
          </button>
        </div>

      </aside>

      {/* ===== MAIN ===== */}
      <main className="admin-main">

        {/* TOP BAR */}
        <div className="admin-topbar">
          <span className="topbar-title">{title || "Admin Panel"}</span>
          <div className="topbar-right">
            <span className="topbar-badge">Admin</span>
            <div className="topbar-avatar">A</div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="admin-content">
          {children}
        </div>

      </main>

    </div>
  )
}

export default AdminLayout