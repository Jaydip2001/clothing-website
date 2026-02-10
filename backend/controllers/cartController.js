import { db } from "../config/db.js"

/* ================= ADD TO CART ================= */
export const addToCart = (req, res) => {
  const { user_id, product_id, quantity } = req.body

  db.query(
    "SELECT * FROM cart WHERE user_id=? AND product_id=?",
    [user_id, product_id],
    (err, result) => {
      if (err) return res.status(500).json(err)

      if (result.length > 0) {
        db.query(
          "UPDATE cart SET quantity = quantity + ? WHERE user_id=? AND product_id=?",
          [quantity, user_id, product_id],
          () => res.json({ message: "Cart updated" })
        )
      } else {
        db.query(
          "INSERT INTO cart (user_id, product_id, quantity) VALUES (?,?,?)",
          [user_id, product_id, quantity],
          () => res.json({ message: "Added to cart" })
        )
      }
    }
  )
}

/* ================= GET CART ITEMS ================= */
export const getCart = (req, res) => {
  const { user_id } = req.params

  const sql = `
    SELECT 
      c.id,
      c.quantity,
      p.id AS product_id,
      p.name,
      p.price,
      p.image
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
}
