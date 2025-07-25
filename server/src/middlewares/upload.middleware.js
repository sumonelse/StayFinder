import multer from "multer"
import path from "path"

// Configure memory storage for Vercel compatibility
// Files will be stored in memory as Buffer objects instead of on disk
const storage = multer.memoryStorage()

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(",") || [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/avif",
    ]

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(
            new Error(
                `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
            ),
            false
        )
    }
}

// Create the multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // Default 5MB
        files: 10, // Maximum 10 files
    },
})

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File too large. Maximum size is 5MB.",
                timestamp: new Date().toISOString(),
            })
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files. Maximum 10 files allowed.",
                timestamp: new Date().toISOString(),
            })
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Unexpected field name for uploaded file.",
                timestamp: new Date().toISOString(),
            })
        }
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            timestamp: new Date().toISOString(),
        })
    }
    next()
}

export default upload
