import { db } from "../config/db.js"

/* ================= MAIN STATS ================= */
export const getDashboardStats = (req, res) => {
  const stats = {}

  db.query("SELECT COUNT(*) AS users FROM users", (e1, r1) => {
    if (e1) return res.status(500).json(e1)
    stats.users = r1[0].users

    db.query("SELECT COUNT(*) AS products FROM products", (e2, r2) => {
      if (e2) return res.status(500).json(e2)
      stats.products = r2[0].products

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
              "SELECT SUM(total_amount) AS revenue FROM orders WHERE status IN ('paid','Paid','shipped','Shipped','delivered','Delivered')",
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

/* ================= MONTHLY SALES DATA ================= */
export const getMonthlySales = (req, res) => {

  const sql = `
    SELECT 
      DATE_FORMAT(created_at, '%b') AS month,
      MONTH(created_at)             AS month_num,
      YEAR(created_at)              AS year,
      SUM(total_amount)             AS sales,
      COUNT(*)                      AS orders
    FROM orders
    WHERE status IN ('paid','Paid','shipped','Shipped','delivered','Delivered')
      AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
    ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
  `

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err)

    // Fill in missing months with 0 so chart always shows 12 months
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const now = new Date()

    const filled = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = monthNames[d.getMonth()]
      const found = result.find(
        r => r.month === monthLabel && r.year === d.getFullYear()
      )
      filled.push({
        month:  monthLabel,
        sales:  found ? parseFloat(found.sales)  : 0,
        orders: found ? parseInt(found.orders)   : 0
      })
    }

    res.json(filled)
  })
}