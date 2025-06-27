import cloudinary from "../config/cloudinary.js"
import fs from "fs"
import logger from "../utils/logger.js"

/**
 * Service for handling image uploads to Cloudinary
 */
class UploadService {
    /**
     * Upload a single image to Cloudinary from memory buffer
     * @param {Buffer} fileBuffer - File buffer from multer memory storage
     * @param {string} originalName - Original filename for format detection
     * @param {string} folder - Cloudinary folder to upload to
     * @returns {Promise<Object>} - Cloudinary upload result
     */
    async uploadImage(fileBuffer, originalName, folder = "stayfinder") {
        const startTime = Date.now()

        try {
            logger.info("Starting image upload", {
                originalName,
                folder,
                fileSize: fileBuffer.length,
                fileType: this.getFileExtension(originalName),
            })

            // Convert buffer to base64 data URI for Cloudinary
            const base64Data = `data:image/${this.getFileExtension(originalName)};base64,${fileBuffer.toString("base64")}`

            // Upload the image to Cloudinary
            const result = await cloudinary.uploader.upload(base64Data, {
                folder: folder,
                resource_type: "image",
            })

            const uploadTime = Date.now() - startTime

            logger.info("Image upload successful", {
                originalName,
                folder,
                fileSize: fileBuffer.length,
                uploadTime: `${uploadTime}ms`,
                cloudinaryUrl: result.secure_url,
                publicId: result.public_id,
            })

            return {
                url: result.secure_url,
                publicId: result.public_id,
            }
        } catch (error) {
            const uploadTime = Date.now() - startTime

            logger.error("Image upload failed", error, {
                originalName,
                folder,
                fileSize: fileBuffer.length,
                uploadTime: `${uploadTime}ms`,
            })

            throw error
        }
    }

    /**
     * Get file extension from filename
     * @param {string} filename - Original filename
     * @returns {string} - File extension
     */
    getFileExtension(filename) {
        const ext = filename.split(".").pop().toLowerCase()
        // Map common extensions to proper MIME types
        const extensionMap = {
            jpg: "jpeg",
            jpeg: "jpeg",
            png: "png",
            webp: "webp",
            avif: "avif",
        }
        return extensionMap[ext] || "jpeg"
    }

    /**
     * Upload multiple images to Cloudinary from memory buffers
     * @param {Array<Object>} files - Array of file objects with buffer and originalname
     * @param {string} folder - Cloudinary folder to upload to
     * @returns {Promise<Array<Object>>} - Array of Cloudinary upload results
     */
    async uploadMultipleImages(files, folder = "stayfinder") {
        const startTime = Date.now()

        try {
            logger.info("Starting multiple image upload", {
                fileCount: files.length,
                folder,
                files: files.map((f) => ({
                    name: f.originalname,
                    size: f.buffer.length,
                })),
            })

            const uploadPromises = files.map((file) =>
                this.uploadImage(file.buffer, file.originalname, folder)
            )

            const results = await Promise.all(uploadPromises)
            const uploadTime = Date.now() - startTime

            logger.info("Multiple image upload successful", {
                fileCount: files.length,
                folder,
                uploadTime: `${uploadTime}ms`,
                results: results.map((r) => ({
                    url: r.url,
                    publicId: r.publicId,
                })),
            })

            return results
        } catch (error) {
            const uploadTime = Date.now() - startTime

            logger.error("Multiple image upload failed", error, {
                fileCount: files.length,
                folder,
                uploadTime: `${uploadTime}ms`,
            })

            throw error
        }
    }

    /**
     * Delete an image from Cloudinary
     * @param {string} publicId - Cloudinary public ID of the image
     * @returns {Promise<Object>} - Cloudinary deletion result
     */
    async deleteImage(publicId) {
        try {
            return await cloudinary.uploader.destroy(publicId)
        } catch (error) {
            throw error
        }
    }

    /**
     * Delete multiple images from Cloudinary
     * @param {Array<string>} publicIds - Array of Cloudinary public IDs
     * @returns {Promise<Object>} - Cloudinary deletion result
     */
    async deleteMultipleImages(publicIds) {
        try {
            return await cloudinary.api.delete_resources(publicIds)
        } catch (error) {
            throw error
        }
    }
}

export default new UploadService()
