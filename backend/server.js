import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { db } from "./config/db.js"
import productRoutes from "./routes/productRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import adminAuthRoutes from "./routes/adminAuthRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import inventoryRoutes from "./routes/inventoryRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"



dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/products", productRoutes)

app.get("/", (req, res) => {
  res.send("Clothing Store API is running 🚀")
})
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})

app.use("/api/auth", authRoutes)
app.use("/api/admin", adminAuthRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/uploads", express.static("uploads"))

app.use("/api/orders", orderRoutes)

app.use("/api/reviews", reviewRoutes)


app.use("/api/inventory", inventoryRoutes)


app.use("/api/dashboard", dashboardRoutes)



// Test DB connection

