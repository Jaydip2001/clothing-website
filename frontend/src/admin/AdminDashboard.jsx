import { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import AdminLayout from "./Adminlayout"
import "./admin-css/admin.css"
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"

const statCards = [
  { key: "users",      label: "Total Users",   icon: "👤", color: "blue",   prefix: "",  badge: "Active" },
  { key: "products",   label: "Products",      icon: "👗", color: "purple", prefix: "",  badge: "Listed" },
  { key: "categories", label: "Categories",    icon: "🗂️",  color: "gold",   prefix: "",  badge: "Active" },
  { key: "orders",     label: "Total Orders",  icon: "📦", color: "green",  prefix: "",  badge: "All time" },
  { key: "reviews",    label: "Reviews",       icon: "⭐", color: "gold",   prefix: "",  badge: "Received" },
  { key: "revenue",    label: "Revenue",       icon: "💰", color: "green",  prefix: "₹", badge: "Earned" },
]

const quickLinks = [
  { to: "/admin/categories", icon: "🗂️",  label: "Categories" },
  { to: "/admin/products",   icon: "👗", label: "Products" },
  { to: "/admin/orders",     icon: "📦", label: "Orders" },
  { to: "/admin/reviews",    icon: "⭐", label: "Reviews" },
  { to: "/admin/inventory",  icon: "🏭", label: "Inventory" },
]

const DONUT_COLORS = ["#F5A623", "#3b82f6", "#22c55e", "#a855f7"]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1a1e2a", border: "1px solid #252a3a",
        borderRadius: "10px", padding: "10px 16px",
        fontSize: "13px", color: "#f0f2f8"
      }}>
        <p style={{ marginBottom: 4, color: "#8b90a7" }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: "2px 0" }}>
            {p.name}: <b>{p.name === "sales" ? "Rs." + Number(p.value).toLocaleString() : p.value}</b>
          </p>
        ))}
      </div>
    )
  }
  return null
}

function AdminDashboard() {
  const [stats, setStats] = useState({})
  const [monthlySales, setMonthlySales] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      const [statsRes, monthlyRes] = await Promise.all([
        axios.get("http://localhost:5000/api/dashboard"),
        axios.get("http://localhost:5000/api/dashboard/monthly")
      ])
      setStats(statsRes.data)
      setMonthlySales(monthlyRes.data)
    }
    fetchAll()
  }, [])

  const donutData = [
    { name: "Orders",   value: stats.orders    || 0 },
    { name: "Products", value: stats.products  || 0 },
    { name: "Users",    value: stats.users     || 0 },
    { name: "Reviews",  value: stats.reviews   || 0 },
  ]

  const revenue = stats.revenue || 0
  const target  = Math.max(revenue * 1.5, 10000)
  const progressData = [
    { label: "Total Revenue",    value: revenue,             max: target,                                color: "#22c55e" },
    { label: "Orders Completed", value: stats.orders  || 0,  max: Math.max((stats.orders  ||0)*1.4, 20), color: "#3b82f6" },
    { label: "Products Listed",  value: stats.products|| 0,  max: Math.max((stats.products||0)*1.5, 10), color: "#F5A623" },
  ]

  return (
    <AdminLayout title="Dashboard">

      <div className="page-header">
        <h1>Welcome back, Admin 👋</h1>
        <p>Here's what's happening with your store today.</p>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        {statCards.map(card => (
          <div key={card.key} className={"stat-card " + card.color}>
            <span className="stat-icon">{card.icon}</span>
            <div className="stat-value">{card.prefix}{stats[card.key] ?? "—"}</div>
            <div className="stat-label">{card.label}</div>
            <span className="stat-badge up">↑ {card.badge}</span>
          </div>
        ))}
      </div>

      {/* ROW 1: Bar chart + Donut */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px", marginBottom: "20px" }}>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>📈 Yearly Sales Overview</h3>
            <span className="stat-badge up">Last 12 months — real data</span>
          </div>
          <div className="admin-card-body">
            {monthlySales.every(m => m.sales === 0) ? (
              <p className="text-muted" style={{ textAlign: "center", padding: "60px 0" }}>
                No paid orders yet — chart will fill as orders come in.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlySales} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252a3a" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#8b90a7", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8b90a7", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sales" name="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Line type="monotone" dataKey="orders" name="orders" stroke="#F5A623" strokeWidth={2.5} dot={{ fill: "#F5A623", r: 3 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div style={{ display: "flex", gap: "20px", marginTop: "10px", paddingLeft: "8px" }}>
              <span style={{ fontSize: "12px", color: "#8b90a7", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#3b82f6", display: "inline-block" }} /> Revenue
              </span>
              <span style={{ fontSize: "12px", color: "#8b90a7", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: 10, height: 3, background: "#F5A623", display: "inline-block", borderRadius: 2 }} /> Orders
              </span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header"><h3>🍩 Store Overview</h3></div>
          <div className="admin-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1e2a", border: "1px solid #252a3a", borderRadius: 8, color: "#f0f2f8", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%", marginTop: "8px" }}>
              {donutData.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#8b90a7" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: DONUT_COLORS[i], display: "inline-block", flexShrink: 0 }} />
                  {d.name}: <b style={{ color: "#f0f2f8" }}>{d.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: Progress + Quick Links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

        <div className="admin-card">
          <div className="admin-card-header"><h3>📊 Sales Overview</h3></div>
          <div className="admin-card-body">
            {progressData.map((item, i) => {
              const pct = Math.min((item.value / item.max) * 100, 100).toFixed(0)
              return (
                <div key={i} style={{ marginBottom: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#8b90a7" }}>{item.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#f0f2f8" }}>
                      {i === 0 ? "Rs." + Number(item.value).toLocaleString() : item.value}
                      <span style={{ color: "#555c78", fontWeight: 400, marginLeft: 4 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ background: "#252a3a", borderRadius: "20px", height: "8px", overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: item.color, borderRadius: "20px", transition: "width 0.8s ease", boxShadow: "0 0 8px " + item.color + "60" }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header"><h3>⚡ Quick Navigation</h3></div>
          <div className="admin-card-body">
            <div className="quick-links">
              {quickLinks.map(link => (
                <Link key={link.to} to={link.to} className="quick-link-card">
                  <span className="ql-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

    </AdminLayout>
  )
}

export default AdminDashboard