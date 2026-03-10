import { useEffect, useState } from "react"
import axios from "axios"
import AdminLayout from "./Adminlayout"
import "./admin-css/admin.css"

function AdminInventory() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await axios.get("http://localhost:5000/api/inventory")
      setLogs(res.data)
    }
    fetchLogs()
  }, [])

  const typeClass = (type) => {
    if (!type) return ""
    if (type === "SALE") return "badge-cancelled"
    if (type === "RESTOCK") return "badge-paid"
    return "badge-shipped"
  }

  return (
    <AdminLayout title="Inventory">
      <div className="page-header">
        <h1>Inventory Logs</h1>
        <p>Track all stock changes and movements</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Logs ({logs.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Change Type</th>
              <th>Quantity</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td className="text-muted">{l.id}</td>
                <td><b>{l.product_name}</b></td>
                <td>
                  <span className={`badge ${typeClass(l.change_type)}`}>
                    {l.change_type}
                  </span>
                </td>
                <td>
                  <span style={{ color: l.quantity < 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                    {l.quantity > 0 ? `+${l.quantity}` : l.quantity}
                  </span>
                </td>
                <td className="text-secondary" style={{ fontSize: "13px" }}>
                  {new Date(l.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

export default AdminInventory