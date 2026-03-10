import express from "express"
import {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory,
  getSubcategories,
  getSubcategoriesByCategory,
  getCategoriesWithSubs,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory
} from "../controllers/categoryController.js"
import { upload } from "../middleware/upload.js"

const router = express.Router()

/* ── CATEGORIES ── */
router.post("/",        upload.single("image"), addCategory)
router.put("/:id",      upload.single("image"), updateCategory)
router.get("/",         getCategories)
router.delete("/:id",   deleteCategory)

/* ── CATEGORIES WITH NESTED SUBS (used by frontend mega menu) ── */
router.get("/with-subs", getCategoriesWithSubs)   // GET /api/categories/with-subs

/* ── SUBCATEGORIES ── */
router.get("/subcategories",                  getSubcategories)             // GET  all subs
router.get("/subcategories/:category_id",     getSubcategoriesByCategory)  // GET  subs by category
router.post("/subcategories",                 addSubcategory)              // POST add sub
router.put("/subcategories/:id",              updateSubcategory)           // PUT  update sub
router.delete("/subcategories/:id",           deleteSubcategory)           // DELETE sub

export default router