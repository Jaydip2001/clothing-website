import { db } from "../config/db.js"

/* ADD CATEGORY */
export const addCategory = (req, res) => {
  console.log("REQ BODY:", req.body)
  console.log("REQ FILE:", req.file)

  const { name, description } = req.body
  const image = req.file ? req.file.filename : null

  db.query(
    "INSERT INTO categories (name, description, image) VALUES (?, ?, ?)",
    [name, description, image],
    (err) => {
      if (err) return res.status(500).json(err)
      res.json({ message: "Category added successfully" })
    }
  )
}

/* GET ALL CATEGORIES */
export const getCategories = (req, res) => {
  db.query("SELECT * FROM categories", (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
}

/* UPDATE CATEGORY */
export const updateCategory = (req, res) => {
  const { id } = req.params
  const { name, description } = req.body

  if (req.file) {
    // ✅ NEW IMAGE UPLOADED → update image
    const image = req.file.filename

    db.query(
      "UPDATE categories SET name=?, description=?, image=? WHERE id=?",
      [name, description, image, id],
      (err) => {
        if (err) return res.status(500).json(err)
        res.json({ message: "Category updated with new image" })
      }
    )
  } else {
    // ✅ NO NEW IMAGE → keep old image
    db.query(
      "UPDATE categories SET name=?, description=? WHERE id=?",
      [name, description, id],
      (err) => {
        if (err) return res.status(500).json(err)
        res.json({ message: "Category updated without changing image" })
      }
    )
  }
}


/* DELETE CATEGORY */
export const deleteCategory = (req, res) => {
  const { id } = req.params

  // 1️⃣ Check if category is used
  db.query(
    "SELECT COUNT(*) AS total FROM products WHERE category_id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err)

      if (result[0].total > 0) {
        return res.status(400).json({
          message: "Cannot delete category. Products exist in this category."
        })
      }

      // 2️⃣ Safe to delete
      db.query(
        "DELETE FROM categories WHERE id = ?",
        [id],
        (err2) => {
          if (err2) return res.status(500).json(err2)
          res.json({ message: "Category deleted successfully" })
        }
      )
    }
  )
}


