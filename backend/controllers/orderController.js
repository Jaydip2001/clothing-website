import { db } from "../config/db.js"
import { addInventoryLog } from "./inventoryController.js"


/* ================= GET ALL ORDERS WITH DETAILS (ADMIN) ================= */
export const getOrders = (req, res) => {
  const sql = `
    SELECT 
      o.id,
      o.total_amount,
      o.status,
      o.created_at,

      u.name AS user_name,

      a.full_name,
      a.phone,
      a.address,
      a.city,
      a.state,
      a.pincode,

      p.payment_method,
      p.payment_status

    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN payments p ON o.id = p.order_id
    LEFT JOIN addresses a ON o.address_id = a.id   -- ✅ use order's own address_id
    ORDER BY o.id DESC
  `

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
}


/* ================= GET ORDER ITEMS ================= */
export const getOrderItems = (req, res) => {

  const { id } = req.params

  const sql = `
    SELECT 
      oi.product_id,
      oi.quantity,
      oi.price,
      pr.name,
      pr.image
    FROM order_items oi
    JOIN products pr ON oi.product_id = pr.id
    WHERE oi.order_id = ?
  `

  db.query(sql, [id], (err, result) => {

    if (err) return res.status(500).json(err)

    res.json(result)

  })
}



/* ================= UPDATE ORDER STATUS (ADMIN) ================= */
export const updateOrderStatus = (req, res) => {

  const { id } = req.params
  const { status } = req.body

  db.query(
    "UPDATE orders SET status=? WHERE id=?",
    [status, id],
    (err) => {

      if (err) return res.status(500).json(err)

      /* 🔥 update inventory when order completed */
      if (["paid", "delivered"].includes(status.toLowerCase())) {

        db.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id=?",
          [id],
          (err2, items) => {

            if (!err2 && items) {

              items.forEach(item => {

                addInventoryLog(
                  item.product_id,
                  "SALE",
                  -item.quantity
                )

              })

            }

          }
        )

      }

      res.json({ message: "Status updated successfully" })

    }
  )

}

/* ================= CREATE ORDER (USER CHECKOUT) ================= */
export const createOrder = (req, res) => {

  const { user_id, total_amount, payment_method, upi_id, items, address } = req.body

  // 1️⃣ SAVE ADDRESS FIRST
  db.query(
    `INSERT INTO addresses (user_id, full_name, phone, address, city, state, pincode)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      address.full_name,
      address.phone,
      address.address,
      address.city,
      address.state,
      address.pincode
    ],
    (err, addrResult) => {
      if (err) return res.status(500).json(err)

      const address_id = addrResult.insertId

      // 2️⃣ CREATE ORDER with address_id
      db.query(
        "INSERT INTO orders (user_id, total_amount, status, address_id) VALUES (?, ?, ?, ?)",
        [user_id, total_amount, "Pending", address_id],
        (err2, result) => {
          if (err2) return res.status(500).json(err2)

          const orderId = result.insertId

          // 3️⃣ SAVE ORDER ITEMS
          items.forEach(item => {
            db.query(
              `INSERT INTO order_items (order_id, product_id, quantity, price)
               VALUES (?, ?, ?, ?)`,
              [orderId, item.product_id, item.quantity, item.price]
            )
          })

          // 4️⃣ SAVE PAYMENT
          db.query(
            `INSERT INTO payments (order_id, user_id, amount, payment_method, payment_status)
             VALUES (?, ?, ?, ?, ?)`,
            [
              orderId,
              user_id,
              total_amount,
              payment_method,
              payment_method === "COD" ? "Pending" : "Paid"
            ],
            (err3) => {
              if (err3) return res.status(500).json(err3)

              // 5️⃣ CLEAR CART
              db.query("DELETE FROM cart WHERE user_id=?", [user_id])

              res.json({
                message: "Order placed successfully",
                order_id: orderId
              })
            }
          )
        }
      )
    }
  )
}

export const getUserOrders = (req,res)=>{

  const {user_id} = req.params

  const sql = `
    SELECT 
      o.id,
      o.total_amount,
      o.status,
      o.created_at
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.id DESC
  `

  db.query(sql,[user_id],(err,result)=>{
    if(err) return res.status(500).json(err)

    res.json(result)
  })

}