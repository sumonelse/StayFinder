import cloudinary from "../config/cloudinary.js"
import fs from "fs"

/**
 * Service for handling image uploads to Cloudinary
 */
class UploadService {
    /**
     * Upload a single image to Cloudinary
     * @param {string} filePath - Path to the local file
     * @param {string} folder - Cloudinary folder to upload to
     * @returns {Promise<Object>} - Cloudinary upload result
     */
    async uploadImage(filePath, folder = "stayfinder") {
        try {
            // Upload the image to Cloudinary
            const result = await cloudinary.uploader.upload(filePath, {
                folder: folder,
            })

            // Delete the local file after upload
            fs.unlinkSync(filePath)

            return {
                url: result.secure_url,
                publicId: result.public_id,
            }
        } catch (error) {
            // Delete the local file if upload fails
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
            throw error
        }
    }

    /**
     * Upload multiple images to Cloudinary
     * @param {Array<string>} filePaths - Array of paths to local files
     * @param {string} folder - Cloudinary folder to upload to
     * @returns {Promise<Array<Object>>} - Array of Cloudinary upload results
     */
    async uploadMultipleImages(filePaths, folder = "stayfinder") {
        try {
            const uploadPromises = filePaths.map((filePath) =>
                this.uploadImage(filePath, folder)
            )
            return await Promise.all(uploadPromises)
        } catch (error) {
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
