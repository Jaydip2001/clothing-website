import express from "express"
import {
  addReview,
  getReviews,
  replyReview,
  deleteReview
} from "../controllers/reviewController.js"

const router = express.Router()

router.post("/", addReview)
router.get("/", getReviews)
router.put("/:id", replyReview)
router.delete("/:id", deleteReview)

export default router
