import express from "express"
import {
  registerUser,
  loginUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser
} from "../controllers/authController.js"

const router = express.Router()

/* ── USER AUTH ── */
router.post("/register", registerUser)
router.post("/login",    loginUser)

/* ── ADMIN USER MANAGEMENT ── */
router.get("/users",        getAllUsers)      // GET    /api/auth/users
router.get("/users/:id",    getSingleUser)   // GET    /api/auth/users/:id
router.put("/users/:id",    updateUser)      // PUT    /api/auth/users/:id
router.delete("/users/:id", deleteUser)      // DELETE /api/auth/users/:id

export default router