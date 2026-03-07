import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function MyOrders() {

  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [orderItems, setOrderItems] = useState({}) // ✅ { orderId: [items] }

  /* ================= FETCH ORDERS WITH ITEMS ================= */
  const fetchOrders = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/orders/user/${user.id}`
    )
    const fetchedOrders = res.data
    setOrders(fetchedOrders)

    // ✅ Fetch items for every order at once
    const allItems = {}
    await Promise.all(
      fetchedOrders.map(async (order) => {
        const itemRes = await axios.get(
          `http://localhost:5000/api/orders/${order.id}/items`
        )
        allItems[order.id] = itemRes.data
      })
    )
    setOrderItems(allItems)
  }

  useEffect(() => {
    if (user) fetchOrders()
  }, [])


  /* ================= ORDER TRACKING ================= */
  const trackingSteps = (status) => {
    const steps = ["Pending", "Paid", "Shipped", "Delivered"]

    return steps.map((step, index) => {
      const active = steps.indexOf(status) >= index

      return (
        <div key={index} style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "5px"
        }}>
          <div style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: active ? "green" : "#ccc",
            marginRight: "10px"
          }} />
          {step}
        </div>
      )
    })
  }


  return (
    <div style={{ padding: "20px" }}>

      {/* ✅ BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "15px",
          padding: "8px 16px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "1px solid #ccc"
        }}
      >
        ⬅ Back
      </button>

      <h1>My Orders</h1>

      {orders.length === 0 && (
        <p style={{ color: "gray" }}>No orders yet.</p>
      )}

      {orders.map(order => (

        <div key={order.id} style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "20px"
        }}>

          {/* ✅ PRODUCTS AT TOP — image + name */}
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "15px" }}>
            {(orderItems[order.id] || []).map((item, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "1px solid #eee",
                borderRadius: "6px",
                padding: "8px"
              }}>
                <img
                  src={`http://localhost:5000/uploads/${item.image}`}
                  width="60"
                  height="60"
                  style={{ objectFit: "cover", borderRadius: "4px" }}
                  alt={item.name}
                />
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>{item.name}</p>
                  <p style={{ margin: 0, color: "gray", fontSize: "13px" }}>
                    Qty: {item.quantity} — ₹{item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER INFO */}
          {/* <p style={{ margin: "4px 0" }}>
            <b>Order #</b>{order.id}
          </p> */}
          <p style={{ margin: "4px 0" }}>
            <b>Total:</b> ₹{order.total_amount}
          </p>
          <p style={{ margin: "4px 0" }}>
            <b>Status:</b> {order.status}
          </p>
          <p style={{ margin: "4px 0" }}>
            <b>Date:</b> {new Date(order.created_at).toLocaleDateString()}
          </p>

          {/* TRACKING */}
          <h4 style={{ marginTop: "12px" }}>Tracking</h4>
          {trackingSteps(order.status)}

        </div>

      ))}

    </div>
  )
}

export default MyOrders