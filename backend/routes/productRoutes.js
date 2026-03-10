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

router.get("/",     getProducts)
router.get("/:id",  getSingleProduct)

// ✅ Changed from upload.single("image") to upload.array("images", 6)
router.post("/",    upload.array("images", 6), addProduct)
router.put("/:id",  upload.array("images", 6), updateProduct)
router.delete("/:id", deleteProduct)

export default router