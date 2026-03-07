import { db } from "../config/db.js"

/* ================= ADD ADDRESS ================= */
export const addAddress = (req, res) => {

  const { user_id, full_name, phone, address, city, state, pincode } = req.body

  const sql = `
  INSERT INTO addresses
  (user_id, full_name, phone, address, city, state, pincode)
  VALUES (?,?,?,?,?,?,?)
  `

  db.query(
    sql,
    [user_id, full_name, phone, address, city, state, pincode],
    (err, result) => {

      if (err) return res.status(500).json(err)

      res.json({
        message: "Address saved successfully"
      })
    }
  )
}


/* ================= GET USER ADDRESS ================= */

export const getAddress = (req, res) => {

  const { user_id } = req.params

  db.query(
    "SELECT * FROM addresses WHERE user_id=?",
    [user_id],
    (err, result) => {

      if (err) return res.status(500).json(err)

      res.json(result)
    }
  )
}