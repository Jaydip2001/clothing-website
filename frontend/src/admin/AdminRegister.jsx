import { useState } from "react"
import axios from "axios"

function AdminRegister() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/register",
        { name, email, password }
      )

      alert(res.data.message)
    } 
    // catch{
    //   alert("Admin registration failed")
    // }
    catch (err) {
  console.error(err.response?.data || err.message)
  alert("Invalid admin credentials")
}

  }

  return (
    <div>
      <h2>Admin Register</h2>

      <form onSubmit={handleRegister}>
        <input
          placeholder="Admin Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /><br /><br />

        <input
          type="email"
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

        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default AdminRegister
