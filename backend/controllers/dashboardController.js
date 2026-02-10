import { db } from "../config/db.js"

export const getDashboardStats = (req, res) => {
  const stats = {}

  db.query("SELECT COUNT(*) AS users FROM users", (e1, r1) => {
    if (e1) return res.status(500).json(e1)
    stats.users = r1[0].users

    db.query("SELECT COUNT(*) AS products FROM products", (e2, r2) => {
      if (e2) return res.status(500).json(e2)
      stats.products = r2[0].products

      // ✅ ADD THIS
      db.query("SELECT COUNT(*) AS categories FROM categories", (e3, r3) => {
        if (e3) return res.status(500).json(e3)
        stats.categories = r3[0].categories

        db.query("SELECT COUNT(*) AS orders FROM orders", (e4, r4) => {
          if (e4) return res.status(500).json(e4)
          stats.orders = r4[0].orders

          db.query("SELECT COUNT(*) AS reviews FROM reviews", (e5, r5) => {
            if (e5) return res.status(500).json(e5)
            stats.reviews = r5[0].reviews

            db.query(
              "SELECT SUM(total_amount) AS revenue FROM orders WHERE status='Paid'",
              (e6, r6) => {
                if (e6) return res.status(500).json(e6)

                stats.revenue = r6[0].revenue || 0
                res.json(stats)
              }
            )
          })
        })
      })
    })
  })
}
