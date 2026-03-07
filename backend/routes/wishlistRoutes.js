import express from "express"
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} from "../controllers/wishlistController.js"

const router = express.Router()

router.post("/add", addToWishlist)
router.get("/:user_id", getWishlist)
router.post("/remove", removeFromWishlist) // 👈 NEW

export default router
