import BaseController from "./base.controller.js"
import { uploadService } from "../services/index.js"
import logger from "../utils/logger.js"

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
            logger.info("Single image upload request", {
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                hasFile: !!req.file,
            })

            if (!req.file) {
                logger.warn("Upload request without file", {
                    userId: req.user?.id,
                    ip: req.ip,
                })
                return this.sendError(res, "No file uploaded", 400)
            }

            const folder = req.body.folder || "stayfinder"
            const result = await uploadService.uploadImage(
                req.file.buffer,
                req.file.originalname,
                folder
            )

            logger.info("Single image upload completed", {
                userId: req.user?.id,
                fileName: req.file.originalname,
                folder,
                resultUrl: result.url,
            })

            return this.sendSuccess(res, result, "Image uploaded successfully")
        } catch (error) {
            logger.error("Single image upload error", error, {
                userId: req.user?.id,
                fileName: req.file?.originalname,
                folder: req.body.folder,
            })

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
            logger.info("Multiple image upload request", {
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                fileCount: req.files?.length || 0,
            })

            if (!req.files || req.files.length === 0) {
                logger.warn("Multiple upload request without files", {
                    userId: req.user?.id,
                    ip: req.ip,
                })
                return this.sendError(res, "No files uploaded", 400)
            }

            const folder = req.body.folder || "stayfinder"
            const results = await uploadService.uploadMultipleImages(
                req.files,
                folder
            )

            logger.info("Multiple image upload completed", {
                userId: req.user?.id,
                fileCount: req.files.length,
                folder,
                resultUrls: results.map((r) => r.url),
            })

            return this.sendSuccess(
                res,
                results,
                "Images uploaded successfully"
            )
        } catch (error) {
            logger.error("Multiple image upload error", error, {
                userId: req.user?.id,
                fileCount: req.files?.length,
                folder: req.body.folder,
            })

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
