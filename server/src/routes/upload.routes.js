import express from "express"
import uploadController from "../controllers/upload.controller.js"
import upload, { handleUploadError } from "../middlewares/upload.middleware.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { uploadLimiter } from "../middlewares/rateLimit.middleware.js"

const router = express.Router()

// Note: Using memory storage for Vercel compatibility
// Files are handled in memory and uploaded directly to Cloudinary

// Routes
router.post(
    "/single",
    authenticate,
    uploadLimiter,
    upload.single("image"),
    handleUploadError,
    uploadController.uploadSingleImage
)

router.post(
    "/multiple",
    authenticate,
    uploadLimiter,
    upload.array("images", 10),
    handleUploadError,
    uploadController.uploadMultipleImages
)

// Routes with role-based authorization (only hosts and admins can upload property images)
router.post(
    "/property/single",
    authenticate,
    authorize(["host", "admin"]),
    uploadLimiter,
    upload.single("image"),
    handleUploadError,
    uploadController.uploadSingleImage
)

router.post(
    "/property/multiple",
    authenticate,
    authorize(["host", "admin"]),
    uploadLimiter,
    upload.array("images", 10),
    handleUploadError,
    uploadController.uploadMultipleImages
)

// Profile picture upload
router.post(
    "/profile-picture",
    authenticate,
    uploadLimiter,
    upload.single("profilePicture"),
    handleUploadError,
    uploadController.uploadSingleImage
)

export default router
