import { db } from "../config/db.js"
import bcrypt from "bcryptjs"

export const registerAdmin = (req, res) => {
  const { name, email, password } = req.body
  const hash = bcrypt.hashSync(password, 10)

  db.query(
    "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
    [name, email, hash],
    (err) => {
      if (err) return res.status(500).json(err)
      res.json({ message: "Admin registered successfully" })
    }
  )
}

export const loginAdmin = (req, res) => {
  const { email, password } = req.body

  db.query(
    "SELECT * FROM admins WHERE email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).json(err)
      if (result.length === 0)
        return res.status(401).json({ message: "Admin not found" })

      const valid = bcrypt.compareSync(password, result[0].password)
      if (!valid)
        return res.status(401).json({ message: "Wrong password" })

      res.json({
        message: "Admin login successful",
        admin: {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email
        }
      })
    }
  )
}
