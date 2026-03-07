import { useEffect, useState } from "react"
import axios from "axios"

function AdminOrders() {

  const [orders, setOrders] = useState([])
  const [items, setItems] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)

  /* ================= FETCH ORDERS ================= */

  const fetchOrders = async () => {
    try {

      const res = await axios.get("http://localhost:5000/api/orders")
      setOrders(res.data)

    } catch (err) {

      console.error("Error loading orders")

    }
  }

  useEffect(() => {

    fetchOrders()

  }, [])

  /* ================= CHANGE ORDER STATUS ================= */

  const changeStatus = async (id, status) => {

    try {

      await axios.put(`http://localhost:5000/api/orders/${id}`, {
        status
      })

      fetchOrders()

    } catch (err) {

      alert("Error updating order status")

    }
  }

  /* ================= VIEW ORDER ITEMS ================= */

  const viewItems = async (id) => {

    try {

      const res = await axios.get(
        `http://localhost:5000/api/orders/${id}/items`
      )

      setItems(res.data)
      setSelectedOrder(id)

    } catch (err) {

      alert("Error loading order items")

    }
  }

  return (

    <div style={{ padding: "20px" }}>

      <h2>Manage Orders</h2>

      <table border="1" cellPadding="10">

        {/* ================= TABLE HEADER ================= */}

        <thead>

          <tr>

            <th>ID</th>
            <th>User</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Shipping Address</th>
            <th>Status</th>
            <th>Products</th>

          </tr>

        </thead>

        {/* ================= TABLE BODY ================= */}

        <tbody>

          {orders.map(order => (

            <tr key={order.id}>

              <td>{order.id}</td>

              <td>{order.user_name}</td>

              <td>₹{order.total_amount}</td>

              {/* PAYMENT INFO */}

              <td>

                {order.payment_method} <br />

                <b>{order.payment_status}</b>

              </td>

              {/* FULL ADDRESS */}

              <td>

                <b>{order.full_name}</b> <br />

                📞 {order.phone} <br />

                {order.address} <br />

                {order.city}, {order.state} - {order.pincode}

              </td>

              {/* STATUS */}

              <td>

                <select

                  value={order.status}

                  onChange={(e) =>
                    changeStatus(order.id, e.target.value)
                  }

                >

                  <option>Pending</option>
                  <option>Paid</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>

                </select>

                <br /><br />

                {order.status !== "Delivered" && (

                  <button

                    style={{
                      background: "green",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      cursor: "pointer"
                    }}

                    onClick={() =>
                      changeStatus(order.id, "Delivered")
                    }

                  >

                    Deliver

                  </button>

                )}

              </td>

              {/* VIEW ITEMS */}

              <td>

                <button

                  onClick={() => viewItems(order.id)}

                >

                  View

                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* ================= ORDER ITEMS ================= */}

      {selectedOrder && (

        <div style={{ marginTop: "30px" }}>

          <h3>Products in Order #{selectedOrder}</h3>

          {items.map((item, i) => (

            <div key={i} style={{ marginBottom: "10px" }}>

              <img

                src={`http://localhost:5000/uploads/${item.image}`}

                width="50"

                style={{ marginRight: "10px" }}

                alt=""

              />

              {item.name} × {item.quantity} — ₹{item.price}

            </div>

          ))}

        </div>

      )}

    </div>

  )

}

export default AdminOrders