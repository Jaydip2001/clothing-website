import { db } from "../config/db.js"

/* ─────────────────────────────────────────
   CATEGORY CRUD
───────────────────────────────────────── */

export const addCategory = (req, res) => {
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

export const getCategories = (req, res) => {
  db.query("SELECT * FROM categories", (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
}

export const updateCategory = (req, res) => {
  const { id } = req.params
  const { name, description } = req.body
  if (req.file) {
    db.query(
      "UPDATE categories SET name=?, description=?, image=? WHERE id=?",
      [name, description, req.file.filename, id],
      (err) => {
        if (err) return res.status(500).json(err)
        res.json({ message: "Category updated with new image" })
      }
    )
  } else {
    db.query(
      "UPDATE categories SET name=?, description=? WHERE id=?",
      [name, description, id],
      (err) => {
        if (err) return res.status(500).json(err)
        res.json({ message: "Category updated" })
      }
    )
  }
}

export const deleteCategory = (req, res) => {
  const { id } = req.params
  db.query("SELECT COUNT(*) AS total FROM products WHERE category_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err)
    if (result[0].total > 0)
      return res.status(400).json({ message: "Cannot delete category. Products exist in this category." })
    db.query("DELETE FROM categories WHERE id = ?", [id], (err2) => {
      if (err2) return res.status(500).json(err2)
      res.json({ message: "Category deleted successfully" })
    })
  })
}

/* ─────────────────────────────────────────
   SUBCATEGORY CRUD
───────────────────────────────────────── */

/* GET all subcategories (with category name) */
export const getSubcategories = (req, res) => {
  db.query(
    `SELECT s.*, c.name AS category_name
     FROM subcategories s
     JOIN categories c ON s.category_id = c.id
     ORDER BY s.category_id, s.id`,
    (err, result) => {
      if (err) return res.status(500).json(err)
      res.json(result)
    }
  )
}

/* GET subcategories for ONE category */
export const getSubcategoriesByCategory = (req, res) => {
  const { category_id } = req.params
  db.query(
    "SELECT * FROM subcategories WHERE category_id = ? ORDER BY id",
    [category_id],
    (err, result) => {
      if (err) return res.status(500).json(err)
      res.json(result)
    }
  )
}

/* GET categories WITH their subcategories nested */
export const getCategoriesWithSubs = (req, res) => {
  db.query("SELECT * FROM categories ORDER BY id", (err, cats) => {
    if (err) return res.status(500).json(err)
    db.query("SELECT * FROM subcategories ORDER BY category_id, id", (err2, subs) => {
      if (err2) return res.status(500).json(err2)
      const result = cats.map(cat => ({
        ...cat,
        subcategories: subs.filter(s => s.category_id === cat.id)
      }))
      res.json(result)
    })
  })
}

/* ADD subcategory */
export const addSubcategory = (req, res) => {
  const { category_id, name } = req.body
  if (!category_id || !name)
    return res.status(400).json({ message: "category_id and name are required" })
  db.query(
    "INSERT INTO subcategories (category_id, name) VALUES (?, ?)",
    [category_id, name],
    (err) => {
      if (err) return res.status(500).json(err)
      res.json({ message: "Subcategory added successfully" })
    }
  )
}

/* UPDATE subcategory */
export const updateSubcategory = (req, res) => {
  const { id } = req.params
  const { name } = req.body
  db.query("UPDATE subcategories SET name=? WHERE id=?", [name, id], (err) => {
    if (err) return res.status(500).json(err)
    res.json({ message: "Subcategory updated successfully" })
  })
}

/* DELETE subcategory */
export const deleteSubcategory = (req, res) => {
  const { id } = req.params
  db.query("DELETE FROM subcategories WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err)
    res.json({ message: "Subcategory deleted successfully" })
  })
}