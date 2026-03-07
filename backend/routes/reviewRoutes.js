import express from "express"
import {
  addReview,
  getReviews,
  getProductReviews,
  replyReview,
  deleteReview
} from "../controllers/reviewController.js"

const router = express.Router()

router.post("/add", addReview)                          // POST   /api/reviews/add
router.get("/", getReviews)                             // GET    /api/reviews  (admin)
router.get("/product/:product_id", getProductReviews)  // GET    /api/reviews/product/:id (public)
router.put("/:id", replyReview)                        // PUT    /api/reviews/:id
router.delete("/:id", deleteReview)                    // DELETE /api/reviews/:id

export default router