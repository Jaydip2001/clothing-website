import { db } from "../config/db.js"

/* GET ALL ORDERS WITH DETAILS */
export const getOrders = (req, res) => {
  const sql = `
    SELECT 
      o.id,
      o.total_amount,
      o.status,
      o.created_at,

      u.name AS user_name,

      a.full_name,
      a.phone,
      a.city,
      a.pincode,

      p.payment_status

    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN payments p ON o.id = p.order_id
    LEFT JOIN addresses a ON u.id = a.user_id
    ORDER BY o.id DESC
  `

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
}


/* GET ORDER ITEMS (products inside order) */
export const getOrderItems = (req, res) => {
  const { id } = req.params

  const sql = `
    SELECT 
      oi.quantity,
      oi.price,
      pr.name,
      pr.image
    FROM order_items oi
    JOIN products pr ON oi.product_id = pr.id
    WHERE oi.order_id = ?
  `

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
}


/* UPDATE ORDER STATUS */
export const updateOrderStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body

  db.query(
    "UPDATE orders SET status=? WHERE id=?",
    [status, id],
    (err) => {
      if (err) return res.status(500).json(err)
      res.json({ message: "Status updated successfully" })
    }
  )
}
