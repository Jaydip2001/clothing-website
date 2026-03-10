import { db } from "../config/db.js"

/* ================= GET ALL PRODUCTS ================= */
export const getProducts = (req, res) => {
  const { category, sub } = req.query

  let sql = `
    SELECT p.*, 
           c.name AS category,
           s.name AS subcategory,
           (SELECT image FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
  `
  const params = []
  const conditions = []

  if (category) { conditions.push("p.category_id = ?"); params.push(category) }
  if (sub)      { conditions.push("p.subcategory_id = ?"); params.push(sub) }
  if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ")

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err)
    // use primary_image as image fallback
    const products = result.map(p => ({ ...p, image: p.primary_image || p.image }))
    res.json(products)
  })
}

/* ================= GET SINGLE PRODUCT ================= */
export const getSingleProduct = (req, res) => {
  const { id } = req.params

  const sql = `
    SELECT p.*, 
           c.name AS category,
           s.name AS subcategory
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    WHERE p.id = ?
  `

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err)
    if (result.length === 0) return res.status(404).json({ message: "Product not found" })

    const product = result[0]

    // fetch all images for this product
    db.query(
      "SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC",
      [id],
      (err2, images) => {
        if (err2) return res.status(500).json(err2)
        product.images = images
        product.image  = images.find(i => i.is_primary)?.image || images[0]?.image || product.image
        res.json(product)
      }
    )
  })
}

/* ================= ADD PRODUCT ================= */
export const addProduct = (req, res) => {
  const { category_id, subcategory_id, name, description, price, stock, sizes } = req.body
  const files = req.files || []
  const mainImage = files[0] ? files[0].filename : null

  db.query(
    `INSERT INTO products (category_id, subcategory_id, name, description, price, image, stock, sizes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [category_id, subcategory_id || null, name, description, price, mainImage, stock, sizes || null],
    (err, result) => {
      if (err) return res.status(500).json(err)
      const productId = result.insertId

      if (files.length > 0) {
        const imageRows = files.map((f, i) => [productId, f.filename, i === 0 ? 1 : 0])
        db.query(
          "INSERT INTO product_images (product_id, image, is_primary) VALUES ?",
          [imageRows],
          (err2) => {
            if (err2) return res.status(500).json(err2)
            res.json({ message: "Product added successfully" })
          }
        )
      } else {
        res.json({ message: "Product added successfully" })
      }
    }
  )
}

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = (req, res) => {
  const { id } = req.params
  const { category_id, subcategory_id, name, description, price, stock, sizes } = req.body
  const files = req.files || []

  const updateSql = `UPDATE products SET category_id=?, subcategory_id=?, name=?, description=?, price=?, stock=?, sizes=?${files.length > 0 ? ", image=?" : ""} WHERE id=?`
  const values = files.length > 0
    ? [category_id, subcategory_id || null, name, description, price, stock, sizes || null, files[0].filename, id]
    : [category_id, subcategory_id || null, name, description, price, stock, sizes || null, id]

  db.query(updateSql, values, (err) => {
    if (err) return res.status(500).json(err)

    if (files.length > 0) {
      // delete old images and insert new ones
      db.query("DELETE FROM product_images WHERE product_id = ?", [id], (err2) => {
        if (err2) return res.status(500).json(err2)
        const imageRows = files.map((f, i) => [id, f.filename, i === 0 ? 1 : 0])
        db.query(
          "INSERT INTO product_images (product_id, image, is_primary) VALUES ?",
          [imageRows],
          (err3) => {
            if (err3) return res.status(500).json(err3)
            res.json({ message: "Updated successfully" })
          }
        )
      })
    } else {
      res.json({ message: "Updated successfully" })
    }
  })
}

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err)
    res.json({ message: "Deleted successfully" })
  })
}