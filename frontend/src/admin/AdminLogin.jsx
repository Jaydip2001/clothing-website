import { useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/login",
        { email, password }
      )

      // ✅ SAVE ADMIN SESSION
      localStorage.setItem("admin", JSON.stringify(res.data.admin))

      alert("Login successful")
      navigate("/admin")
    } catch {
      alert("Invalid admin credentials")
    }
  }

  return (
    <div>
      <h1>Admin Login</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />

        <button type="submit">Login</button>
      </form>

      <br />

      {/* ✅ REGISTER LINK */}
      <p>
        New Admin?{" "}
        <Link
          to="/admin/register"
          style={{
            padding: "6px 12px",
            border: "1px solid black",
            textDecoration: "none",
            marginLeft: "5px"
          }}
        >
          Register
        </Link>
      </p>
    </div>
  )
}

export default AdminLogin
