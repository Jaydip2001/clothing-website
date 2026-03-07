import express from "express"
import multer from "multer"
import {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getSingleProduct
} from "../controllers/productController.js"

const router = express.Router()

/* MULTER SETUP */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

const upload = multer({ storage })

router.get("/", getProducts)
router.get("/:id", getSingleProduct)   // ✅ SINGLE PRODUCT ROUTE

router.post("/", upload.single("image"), addProduct)
router.put("/:id", upload.single("image"), updateProduct)
router.delete("/:id", deleteProduct)

export default router
