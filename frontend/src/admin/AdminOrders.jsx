import { useEffect, useState } from "react"
import axios from "axios"

function AdminOrders() {

  const [orders, setOrders] = useState([])
  const [items, setItems] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)

  /* FETCH ORDERS */
  const fetchOrders = async () => {
    const res = await axios.get("http://localhost:5000/api/orders")
    setOrders(res.data)
  }

  useEffect(() => {
    const loadOrders = async () => {
      await fetchOrders()
    }
    loadOrders()
  }, [])

  /* CHANGE STATUS */
  const changeStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/orders/${id}`, { status })
    fetchOrders()
  }

  /* VIEW ITEMS */
  const viewItems = async (id) => {
    const res = await axios.get(`http://localhost:5000/api/orders/${id}/items`)
    setItems(res.data)
    setSelectedOrder(id)
  }

  return (
    <div>
      <h2>Manage Orders</h2>

      <table border="1" cellPadding="8">
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.user_name}</td>
              <td>₹{order.total_amount}</td>
              <td>{order.payment_status}</td>
              <td>{order.city}</td>

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
              </td>

              <td>
                <button onClick={() => viewItems(order.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedOrder && (
        <div>
          <h3>Products in Order #{selectedOrder}</h3>

          {items.map((item, i) => (
            <div key={i}>
              <img
                src={`http://localhost:5000/uploads/${item.image}`}
                width="50"
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
