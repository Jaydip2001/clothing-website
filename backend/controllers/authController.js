import { db } from "../config/db.js"
import bcrypt from "bcryptjs"

/* ================= REGISTER ================= */
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

/* ================= LOGIN ================= */
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

/* ================= GET ALL USERS (Admin) ================= */
export const getAllUsers = (req, res) => {
  db.query(
    `SELECT 
      u.id, 
      u.name, 
      u.email,
      COUNT(DISTINCT o.id) AS total_orders,
      COALESCE(SUM(o.total_amount), 0) AS total_spent
     FROM users u
     LEFT JOIN orders o ON u.id = o.user_id
     GROUP BY u.id, u.name, u.email
     ORDER BY u.id DESC`,
    (err, result) => {
      if (err) return res.status(500).json(err)
      res.json(result)
    }
  )
}
/* ================= GET SINGLE USER (Admin) ================= */
export const getSingleUser = (req, res) => {
  const { id } = req.params

  db.query(
    `SELECT id, name, email, created_at FROM users WHERE id = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err)
      if (result.length === 0) return res.status(404).json({ message: "User not found" })
      res.json(result[0])
    }
  )
}

/* ================= UPDATE USER (Admin) ================= */
export const updateUser = (req, res) => {
  const { id } = req.params
  const { name, email, password } = req.body

  if (password) {
    // ✅ Update with new password
    const hash = bcrypt.hashSync(password, 10)
    db.query(
      "UPDATE users SET name=?, email=?, password=? WHERE id=?",
      [name, email, hash, id],
      (err) => {
        if (err) return res.status(500).json(err)
        res.json({ message: "User updated successfully" })
      }
    )
  } else {
    // ✅ Update without changing password
    db.query(
      "UPDATE users SET name=?, email=? WHERE id=?",
      [name, email, id],
      (err) => {
        if (err) return res.status(500).json(err)
        res.json({ message: "User updated successfully" })
      }
    )
  }
}

/* ================= DELETE USER (Admin) ================= */
export const deleteUser = (req, res) => {
  const { id } = req.params

  db.query("DELETE FROM users WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err)
    res.json({ message: "User deleted successfully" })
  })
}