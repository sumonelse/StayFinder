import multer from "multer"
import path from "path"

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/") // This directory should be created if it doesn't exist
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname)
        )
    },
})

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true)
    } else {
        cb(new Error("Not an image! Please upload only images."), false)
    }
}

// Create the multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
})

export default upload
