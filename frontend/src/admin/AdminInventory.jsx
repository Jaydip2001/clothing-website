import { useEffect, useState } from "react"
import axios from "axios"

function AdminInventory() {

  const [logs, setLogs] = useState([])

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await axios.get("http://localhost:5000/api/inventory")
      setLogs(res.data)
    }

    fetchLogs()
  }, [])

  return (
    <div>
      <h2>Inventory Logs</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.product_name}</td>
              <td>{l.change_type}</td>
              <td>{l.quantity}</td>
              <td>{new Date(l.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminInventory
