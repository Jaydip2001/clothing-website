import { useEffect, useState } from "react"
import axios from "axios"
import AdminLayout from "./AdminLayout"
import "./admin-css/admin.css"

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [items, setItems] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [search, setSearch] = useState("")  // ✅

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders")
      setOrders(res.data)
    } catch (err) { console.error("Error loading orders") }
  }

  useEffect(() => { fetchOrders() }, [])

  const changeStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}`, { status })
      fetchOrders()
    } catch (err) { alert("Error updating order status") }
  }

  const viewItems = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${id}/items`)
      setItems(res.data)
      setSelectedOrder(id)
    } catch (err) { alert("Error loading order items") }
  }

  const statusClass = (status) => {
    const map = { Pending: "badge-pending", Paid: "badge-paid", Shipped: "badge-shipped", Delivered: "badge-delivered", Cancelled: "badge-cancelled" }
    return map[status] || "badge-pending"
  }

  // ✅ filtered — search by user name, status, or order id
  const filtered = orders.filter(o =>
    o.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.status?.toLowerCase().includes(search.toLowerCase()) ||
    String(o.id).includes(search)
  )

  return (
    <AdminLayout title="Orders">
      <div className="page-header flex-between">
        <div>
          <h1>Manage Orders</h1>
          <p>View and update all customer orders</p>
        </div>
        <input
          className="form-control"
          placeholder="🔍 Search by user, status or order ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "300px" }}
        />
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Orders ({filtered.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>User</th><th>Total</th><th>Payment</th><th>Shipping Address</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>No orders found</td></tr>
            ) : filtered.map(order => (
              <tr key={order.id}>
                <td><span className="text-accent">#{order.id}</span></td>
                <td>{order.user_name}</td>
                <td><b>₹{order.total_amount}</b></td>
                <td>
                  <div>{order.payment_method}</div>
                  <span className={`badge ${order.payment_status === "Paid" ? "badge-paid" : "badge-pending"}`}>{order.payment_status}</span>
                </td>
                <td style={{ fontSize: "12px", lineHeight: "1.6" }}>
                  <b>{order.full_name}</b><br />
                  📞 {order.phone}<br />
                  {order.address}<br />
                  {order.city}, {order.state} - {order.pincode}
                </td>
                <td>
                  <select className="status-select" value={order.status} onChange={(e) => changeStatus(order.id, e.target.value)}>
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                  <br /><br />
                  <span className={`badge ${statusClass(order.status)}`}>{order.status}</span>
                  {order.status !== "Delivered" && (
                    <><br /><br /><button className="btn btn-primary btn-sm" onClick={() => changeStatus(order.id, "Delivered")}>✓ Deliver</button></>
                  )}
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => viewItems(order.id)}>👁 View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Products in Order #{selectedOrder}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(null)}>✕ Close</button>
          </div>
          <div className="admin-card-body">
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <img src={`http://localhost:5000/uploads/${item.image}`} className="product-thumb" alt={item.name} />
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div className="text-secondary" style={{ fontSize: "13px" }}>Qty: {item.quantity} — ₹{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminOrders