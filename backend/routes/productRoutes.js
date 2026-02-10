import express from "express"
import multer from "multer"
import {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct
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
router.post("/", upload.single("image"), addProduct)
router.put("/:id", upload.single("image"), updateProduct)
router.delete("/:id", deleteProduct)

export default router
