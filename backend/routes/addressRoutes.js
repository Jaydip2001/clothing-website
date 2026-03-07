import express from "express"
import { addAddress, getAddress } from "../controllers/addressController.js"

const router = express.Router()

router.post("/add", addAddress)
router.get("/:user_id", getAddress)

export default router