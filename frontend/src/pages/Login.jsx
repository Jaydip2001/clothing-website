import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      )

      localStorage.setItem("user", JSON.stringify(res.data.user))
      alert("Login successful")
      navigate("/")
    } catch {
      alert("Invalid credentials")
    }
  }

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>

      {/* ✅ REGISTER BUTTON ADDED HERE */}
      <br />
      <p>
        Don't have an account?{" "}
        <Link to="/register">
          <button type="button">
            Register
          </button>
        </Link>
      </p>
    </div>
  )
}

export default Login
