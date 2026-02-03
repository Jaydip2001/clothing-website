import express from "express"
import {
  getOrders,
  getOrderItems,
  updateOrderStatus
} from "../controllers/orderController.js"

const router = express.Router()

router.get("/", getOrders)
router.get("/:id/items", getOrderItems)
router.put("/:id", updateOrderStatus)

export default router
