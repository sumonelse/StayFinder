import BaseController from "./base.controller.js"
import { uploadService } from "../services/index.js"

/**
 * Controller for handling image uploads
 */
class UploadController extends BaseController {
    /**
     * Upload a single image
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} - Response with upload result
     */
    async uploadSingleImage(req, res) {
        try {
            if (!req.file) {
                return this.sendError(res, "No file uploaded", 400)
            }

            const folder = req.body.folder || "stayfinder"
            const result = await uploadService.uploadImage(
                req.file.path,
                folder
            )

            return this.sendSuccess(res, result, "Image uploaded successfully")
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error uploading image",
                500
            )
        }
    }

    /**
     * Upload multiple images
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} - Response with upload results
     */
    async uploadMultipleImages(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return this.sendError(res, "No files uploaded", 400)
            }

            const folder = req.body.folder || "stayfinder"
            const filePaths = req.files.map((file) => file.path)
            const results = await uploadService.uploadMultipleImages(
                filePaths,
                folder
            )

            return this.sendSuccess(
                res,
                results,
                "Images uploaded successfully"
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error uploading images",
                500
            )
        }
    }
}

// Create and export a singleton instance
const uploadController = new UploadController()

// Bind all methods to the instance to preserve 'this' context
Object.getOwnPropertyNames(UploadController.prototype)
    .filter((method) => method !== "constructor")
    .forEach((method) => {
        uploadController[method] =
            uploadController[method].bind(uploadController)
    })

export default uploadController
