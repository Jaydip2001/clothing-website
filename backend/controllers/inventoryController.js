import { db } from "../config/db.js"

/* ADD LOG */
export const addInventoryLog = (product_id, type, qty) => {
  db.query(
    `INSERT INTO inventory_logs (product_id, change_type, quantity)
     VALUES (?,?,?)`,
    [product_id, type, qty]
  )
}


/* GET LOGS */
export const getLogs = (req, res) => {
  const sql = `
    SELECT l.*, p.name AS product_name
    FROM inventory_logs l
    JOIN products p ON l.product_id = p.id
    ORDER BY l.id DESC
  `

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
}
