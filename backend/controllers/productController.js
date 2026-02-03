import { db } from "../config/db.js"

/* GET PRODUCTS */
export const getProducts = (req, res) => {
  db.query(
    `SELECT p.*, c.name AS category
     FROM products p
     JOIN categories c ON p.category_id = c.id`,
    (err, result) => {
      if (err) return res.status(500).json(err)
      res.json(result)
    }
  )
}

/* ADD */
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

/* UPDATE */
export const updateProduct = (req, res) => {
  const { id } = req.params
  const { category_id, name, description, price, stock } = req.body
  const image = req.file ? req.file.filename : null

  if (image) {
    db.query(
      `UPDATE products
       SET category_id=?,name=?,description=?,price=?,image=?,stock=?
       WHERE id=?`,
      [category_id, name, description, price, image, stock, id],
      (err) => {
        if (err) return res.status(500).json(err)
        res.json({ message: "Updated with image" })
      }
    )
  } else {
    db.query(
      `UPDATE products
       SET category_id=?,name=?,description=?,price=?,stock=?
       WHERE id=?`,
      [category_id, name, description, price, stock, id],
      (err) => {
        if (err) return res.status(500).json(err)
        res.json({ message: "Updated" })
      }
    )
  }
}

/* DELETE */
export const deleteProduct = (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err)
    res.json({ message: "Deleted successfully" })
  })
}
