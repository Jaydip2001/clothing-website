import { useState } from "react"
import axios from "axios"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password
    })
    alert(res.data.message)
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} /><br/>
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br/>
        <button>Login</button>
      </form>
    </div>
  )
}

export default Login
