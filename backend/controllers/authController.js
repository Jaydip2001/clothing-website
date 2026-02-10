import { db } from "../config/db.js"
import bcrypt from "bcryptjs"

export const registerUser = (req, res) => {
  const { name, email, password } = req.body
  const hash = bcrypt.hashSync(password, 10)

  db.query(
    "INSERT INTO users (name,email,password) VALUES (?,?,?)",
    [name, email, hash],
    (err) => {
      if (err) return res.status(500).json(err)
      res.json({ message: "User registered successfully" })
    }
  )
}

export const loginUser = (req, res) => {
  const { email, password } = req.body

  db.query("SELECT * FROM users WHERE email=?", [email], (err, result) => {
    if (err) return res.status(500).json(err)
    if (result.length === 0) return res.status(401).json({ message: "User not found" })

    const valid = bcrypt.compareSync(password, result[0].password)
    if (!valid) return res.status(401).json({ message: "Wrong password" })

    res.json({ message: "Login successful", user: result[0] })
  })
}
