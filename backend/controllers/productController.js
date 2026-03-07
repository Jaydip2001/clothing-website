import { db } from "../config/db.js"

/* ================= GET ALL PRODUCTS ================= */
export const getProducts = (req, res) => {
  const { category } = req.query

  let sql = `
    SELECT p.*, c.name AS category
    FROM products p
    JOIN categories c ON p.category_id = c.id
  `
  const params = []

  if (category) {
    sql += " WHERE p.category_id = ?"
    params.push(category)
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
}

/* ================= GET SINGLE PRODUCT ================= */
export const getSingleProduct = (req, res) => {
  const { id } = req.params

  const sql = `
    SELECT p.*, c.name AS category
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err)

    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(result[0])
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
    (err) => {
      if (err) return res.status(500).json(err)
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
