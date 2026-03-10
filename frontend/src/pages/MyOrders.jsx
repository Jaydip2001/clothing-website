import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import "./user-css/myorders.css"

function MyOrders() {
  const user     = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  const [orders, setOrders]         = useState([])
  const [orderItems, setOrderItems] = useState({})
  const [loading, setLoading]       = useState(true)

  /* ── FETCH ── */
  useEffect(() => {
    if (user) fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const res = await axios.get(`http://localhost:5000/api/orders/user/${user.id}`)
    const fetched = res.data
    setOrders(fetched)

    const allItems = {}
    await Promise.all(fetched.map(async (order) => {
      const itemRes = await axios.get(`http://localhost:5000/api/orders/${order.id}/items`)
      allItems[order.id] = itemRes.data
    }))
    setOrderItems(allItems)
    setLoading(false)
  }

  /* ── TRACKING STEPS ── */
  const STEPS = ["pending", "paid", "shipped", "delivered"]
  const STEP_ICONS = { pending: "🕐", paid: "✓", shipped: "🚚", delivered: "✓" }
  const STEP_LABELS = { pending: "Ordered", paid: "Confirmed", shipped: "Shipped", delivered: "Delivered" }

  const getStepState = (step, currentStatus) => {
    if (currentStatus === "cancelled") return step === "pending" ? "cancelled" : "inactive"
    const currentIdx = STEPS.indexOf(currentStatus)
    const stepIdx    = STEPS.indexOf(step)
    if (stepIdx < currentIdx)  return "done"
    if (stepIdx === currentIdx) return "active"
    return "inactive"
  }

  const statusClass = (s) => {
    if (!s) return ""
    return s.toLowerCase()
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", fontFamily: "'DM Sans',sans-serif" }}>Loading orders...</div>

  return (
    <div className="orders-page">

      {/* ── HEADER ── */}
      <div className="orders-header">
        <button className="orders-back" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="orders-header-title">
          My Orders
          {orders.length > 0 && <span className="orders-header-count">({orders.length})</span>}
        </h1>
      </div>

      <div className="orders-body">

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Looks like you haven't placed any orders.</p>
            <button className="orders-empty-btn" onClick={() => navigate("/")}>Start Shopping</button>
          </div>
        ) : (
          orders.map((order, idx) => (
            <div key={order.id} className="order-card" style={{ animationDelay: `${idx * 0.07}s` }}>

              {/* ── TOP BAR ── */}
              <div className="order-card-top">
                <div className="order-card-top-left">
                  <span className="order-id">Order #{order.id}</span>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
                <span className={`order-status ${statusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* ── BODY ── */}
              <div className="order-card-body">

                {/* ITEMS */}
                <div className="order-items">
                  {(orderItems[order.id] || []).map((item, i) => (
                    <div key={i} className="order-item">
                      <img
                        src={`http://localhost:5000/uploads/${item.image}`}
                        alt={item.name}
                      />
                      <div className="order-item-info">
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-meta">
                          Qty: {item.quantity}
                          {item.size && ` · Size: ${item.size}`}
                        </p>
                      </div>
                      <span className="order-item-price">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* FOOTER */}
                <div className="order-card-footer">
                  <p className="order-total">
                    <span>Total</span>₹{order.total_amount}
                  </p>
                  <span style={{ fontSize: "12px", color: "var(--mid-gray)", fontWeight: 600 }}>
                    {order.payment_method || "COD"}
                  </span>
                </div>

                {/* TRACKING */}
                {order.status !== "cancelled" && (
                  <div className="order-tracking">
                    <p className="order-tracking-title">Order Tracking</p>
                    <div className="tracking-steps">
                      {STEPS.map((step, i) => {
                        const state = getStepState(step, order.status?.toLowerCase())
                        return (
                          <>
                            <div key={step} className="tracking-step">
                              <div className={`tracking-dot ${state}`}>
                                {state === "done" || state === "active" ? "✓" : i + 1}
                              </div>
                              <span className={`tracking-label ${state}`}>
                                {STEP_LABELS[step]}
                              </span>
                            </div>
                            {i < STEPS.length - 1 && (
                              <div key={`line-${i}`} className={`tracking-line ${state === "done" ? "done" : ""}`} />
                            )}
                          </>
                        )
                      })}
                    </div>
                  </div>
                )}

                {order.status === "cancelled" && (
                  <div style={{
                    marginTop: "16px", padding: "12px 16px",
                    background: "#fff1f2", borderRadius: "4px",
                    color: "var(--danger)", fontSize: "13px", fontWeight: 600
                  }}>
                    ✕ This order has been cancelled
                  </div>
                )}

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyOrders