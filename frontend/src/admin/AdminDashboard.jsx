import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

function AdminDashboard() {
  const [stats, setStats] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axios.get("http://localhost:5000/api/dashboard")
      setStats(res.data)
    }
    fetchStats()
  }, [])

  // ✅ LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("admin")   // remove admin session
    navigate("/admin/login")            // redirect
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* ✅ LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "6px 12px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>

      <div style={{
        display: "flex",
        gap: "30px",
        marginTop: "40px"
      }}>
        <div>
          <h2>{stats.users}</h2>
          <p>Users</p>
        </div>

        <div>
          <h2>{stats.products}</h2>
          <p>Products</p>
        </div>

        <div>
          <h2>{stats.categories}</h2>
          <p>Categories</p>
        </div>

        <div>
          <h2>{stats.orders}</h2>
          <p>Orders</p>
        </div>

        <div>
          <h2>{stats.reviews}</h2>
          <p>Reviews</p>
        </div>

        <div>
          <h2>₹{stats.revenue}</h2>
          <p>Revenue</p>
        </div>
      </div>

      <hr />

      <h3>Manage</h3>
      <Link to="/admin/categories">Categories</Link> |{" "}
      <Link to="/admin/products">Products</Link> |{" "}
      <Link to="/admin/orders">Orders</Link> |{" "}
      <Link to="/admin/reviews">Reviews</Link> |{" "}
      <Link to="/admin/inventory">Inventory</Link>
    </div>
  )
}

export default AdminDashboard
