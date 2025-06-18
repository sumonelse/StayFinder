import express from "express"
import uploadController from "../controllers/upload.controller.js"
import upload from "../middlewares/upload.middleware.js"
import { authenticate, authorize } from "../middlewares/auth.js"

const router = express.Router()

// Create uploads directory if it doesn't exist
import fs from "fs"
import path from "path"
const uploadsDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Routes
router.post(
    "/single",
    authenticate,
    upload.single("image"),
    uploadController.uploadSingleImage
)

router.post(
    "/multiple",
    authenticate,
    upload.array("images", 10),
    uploadController.uploadMultipleImages
)

// Routes with role-based authorization (only hosts and admins can upload property images)
router.post(
    "/property/single",
    authenticate,
    authorize(["host", "admin"]),
    upload.single("image"),
    uploadController.uploadSingleImage
)

router.post(
    "/property/multiple",
    authenticate,
    authorize(["host", "admin"]),
    upload.array("images", 10),
    uploadController.uploadMultipleImages
)

export default router
