import express from "express"
import {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory
} from "../controllers/categoryController.js"

import { upload } from "../middleware/upload.js"

const router = express.Router()

// 👇 THIS LINE IS WHERE upload.single("image") MUST BE
router.post("/", upload.single("image"), addCategory)

// 👇 AND HERE FOR UPDATE
router.put("/:id", upload.single("image"), updateCategory)

router.get("/", getCategories)
router.delete("/:id", deleteCategory)

export default router
