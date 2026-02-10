import { db } from "../config/db.js"
import { addInventoryLog } from "./inventoryController.js"

/* ================= GET PRODUCTS (ADMIN + USER) ================= */
export const getProducts = (req, res) => {
  const { category } = req.query   // 👈 read category from URL

  let sql = `
    SELECT p.*, c.name AS category
    FROM products p
    JOIN categories c ON p.category_id = c.id
  `
  const params = []

  // ✅ USER SIDE FILTER
  if (category) {
    sql += " WHERE p.category_id = ?"
    params.push(category)
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
}

/* ================= ADD PRODUCT ================= */
export const addProduct = (req, res) => {
  const { category_id, name, description, price, stock } = req.body
  const image = req.file ? req.file.filename : null

  db.query(
    `INSERT INTO products
     (category_id,name,description,price,image,stock)
     VALUES (?,?,?,?,?,?)`,
    [category_id, name, description, price, image, stock],
    (err, result) => {
      if (err) return res.status(500).json(err)

      // 🔥 INVENTORY LOG
      addInventoryLog(result.insertId, "ADD", stock)

      res.json({ message: "Product added successfully" })
    }
  )
}

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = (req, res) => {
  const { id } = req.params
  const { category_id, name, description, price, stock } = req.body
  const image = req.file ? req.file.filename : null

  const sql = image
    ? `UPDATE products SET category_id=?,name=?,description=?,price=?,image=?,stock=? WHERE id=?`
    : `UPDATE products SET category_id=?,name=?,description=?,price=?,stock=? WHERE id=?`

  const values = image
    ? [category_id, name, description, price, image, stock, id]
    : [category_id, name, description, price, stock, id]

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json(err)

    // 🔥 INVENTORY LOG
    addInventoryLog(id, "UPDATE", stock)

    res.json({ message: "Updated successfully" })
  })
}

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err)
    res.json({ message: "Deleted successfully" })
  })
}
