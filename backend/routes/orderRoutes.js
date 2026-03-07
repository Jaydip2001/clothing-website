import express from "express"
import {
  getOrders,
  getOrderItems,
  updateOrderStatus,
  createOrder,
  getUserOrders
} from "../controllers/orderController.js"

const router = express.Router()

router.get("/", getOrders)

router.get("/user/:user_id", getUserOrders)

router.get("/:id/items", getOrderItems)

router.put("/:id", updateOrderStatus)

router.post("/create", createOrder)

export default router 