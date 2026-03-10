import express from "express"
import {
  getDashboardStats,
  getMonthlySales
} from "../controllers/dashboardController.js"

const router = express.Router()

router.get("/", getDashboardStats)
router.get("/monthly", getMonthlySales)   // ✅ GET /api/dashboard/monthly

export default router