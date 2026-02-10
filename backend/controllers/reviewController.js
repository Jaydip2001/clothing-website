import { db } from "../config/db.js"

/* ADD REVIEW (User) */
export const addReview = (req, res) => {
  const { product_id, user_id, rating, comment } = req.body

  db.query(
    `INSERT INTO reviews (product_id,user_id,rating,comment)
     VALUES (?,?,?,?)`,
    [product_id, user_id, rating, comment],
    (err) => {
      if (err) return res.status(500).json(err)
      res.json({ message: "Review added" })
    }
  )
}


/* GET ALL REVIEWS (Admin) */
export const getReviews = (req, res) => {
  db.query(
    `SELECT r.*, p.name AS product_name, u.name AS user_name
     FROM reviews r
     JOIN products p ON r.product_id = p.id
     JOIN users u ON r.user_id = u.id
     ORDER BY r.id DESC`,
    (err, result) => {
      if (err) return res.status(500).json(err)
      res.json(result)
    }
  )
}


/* ADMIN REPLY */
export const replyReview = (req, res) => {
  const { id } = req.params
  const { admin_reply } = req.body

  db.query(
    "UPDATE reviews SET admin_reply=? WHERE id=?",
    [admin_reply, id],
    (err) => {
      if (err) return res.status(500).json(err)
      res.json({ message: "Reply added" })
    }
  )
}


/* DELETE REVIEW */
export const deleteReview = (req, res) => {
  db.query("DELETE FROM reviews WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err)
    res.json({ message: "Deleted" })
  })
}
