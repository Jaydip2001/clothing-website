import express from "express"
import { addToCart, getCart } from "../controllers/cartController.js"

const router = express.Router()

router.post("/add", addToCart)
router.get("/:user_id", getCart)

export default router
