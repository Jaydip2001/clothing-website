import { db } from "../config/db.js"

/* ================= ADD TO WISHLIST ================= */
export const addToWishlist = (req, res) => {
  const { user_id, product_id } = req.body

  const checkSql =
    "SELECT * FROM wishlist WHERE user_id=? AND product_id=?"

  db.query(checkSql, [user_id, product_id], (err, result) => {
    if (err) return res.status(500).json(err)

    if (result.length > 0) {
      return res.status(400).json({ message: "Already in wishlist" })
    }

    const insertSql =
      "INSERT INTO wishlist (user_id, product_id) VALUES (?,?)"

    db.query(insertSql, [user_id, product_id], (err2) => {
      if (err2) return res.status(500).json(err2)
      res.json({ message: "Added to wishlist" })
    })
  })
}

/* ================= GET WISHLIST ================= */
export const getWishlist = (req, res) => {
  const { user_id } = req.params

  const sql = `
    SELECT 
      p.id,
      p.name,
      p.price,
      p.image
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
  `

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
}
/* ================= REMOVE FROM WISHLIST ================= */
export const removeFromWishlist = (req, res) => {
  const { user_id, product_id } = req.body

  db.query(
    "DELETE FROM wishlist WHERE user_id=? AND product_id=?",
    [user_id, product_id],
    (err, result) => {
      if (err) return res.status(500).json(err)

      res.json({ message: "Removed from wishlist" })
    }
  )
}
