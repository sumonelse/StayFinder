import BaseController from "./base.controller.js"
import { reviewService } from "../services/index.js"

/**
 * Controller for review-related routes
 */
class ReviewController extends BaseController {
    /**
     * Create a new review
     * @route POST /api/reviews
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createReview(req, res) {
        try {
            const review = await reviewService.createReview(
                req.body,
                req.user._id
            )
            return this.sendSuccess(
                res,
                { review },
                "Review submitted successfully",
                201
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error creating review",
                error.message.includes("not found") ||
                    error.message.includes("already reviewed") ||
                    error.message.includes("can only review")
                    ? 400
                    : 500
            )
        }
    }

    /**
     * Get all reviews for a property
     * @route GET /api/reviews/property/:propertyId
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getPropertyReviews(req, res) {
        try {
            const result = await reviewService.getPropertyReviews(
                req.params.propertyId,
                req.query
            )
            return this.sendSuccess(res, result)
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error fetching reviews",
                500
            )
        }
    }

    /**
     * Get a single review by ID
     * @route GET /api/reviews/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getReviewById(req, res) {
        try {
            const review = await reviewService.getReviewById(req.params.id)
            return this.sendSuccess(res, { review })
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error fetching review",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Update a review
     * @route PUT /api/reviews/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateReview(req, res) {
        try {
            const review = await reviewService.updateReview(
                req.params.id,
                req.body,
                req.user._id
            )
            return this.sendSuccess(
                res,
                { review },
                "Review updated successfully"
            )
        } catch (error) {
            if (error.message.includes("your own")) {
                return this.sendError(res, error.message, 403)
            }
            return this.sendError(
                res,
                error.message || "Error updating review",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Delete a review
     * @route DELETE /api/reviews/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteReview(req, res) {
        try {
            await reviewService.deleteReview(
                req.params.id,
                req.user._id,
                req.user.role
            )
            return this.sendSuccess(res, null, "Review deleted successfully")
        } catch (error) {
            if (error.message.includes("permission")) {
                return this.sendError(res, error.message, 403)
            }
            return this.sendError(
                res,
                error.message || "Error deleting review",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Add host response to a review
     * @route POST /api/reviews/:id/response
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async respondToReview(req, res) {
        try {
            const review = await reviewService.respondToReview(
                req.params.id,
                req.body.text,
                req.user._id
            )
            return this.sendSuccess(
                res,
                { review },
                "Response added successfully"
            )
        } catch (error) {
            if (error.message.includes("Only the property host")) {
                return this.sendError(res, error.message, 403)
            }
            return this.sendError(
                res,
                error.message || "Error responding to review",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Report a review
     * @route POST /api/reviews/:id/report
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async reportReview(req, res) {
        try {
            const review = await reviewService.reportReview(
                req.params.id,
                req.body.reason,
                req.user._id
            )
            return this.sendSuccess(
                res,
                { review },
                "Review reported successfully"
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error reporting review",
                error.message.includes("not found") ||
                    error.message.includes("already reported")
                    ? 400
                    : 500
            )
        }
    }

    /**
     * Get all reviews that need moderation (admin only)
     * @route GET /api/reviews/moderation
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getReviewsForModeration(req, res) {
        try {
            const result = await reviewService.getReviewsForModeration(
                req.query
            )
            return this.sendSuccess(res, result)
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error fetching reviews for moderation",
                500
            )
        }
    }

    /**
     * Moderate a review (admin only)
     * @route PATCH /api/reviews/:id/moderate
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async moderateReview(req, res) {
        try {
            const review = await reviewService.moderateReview(
                req.params.id,
                req.body.approve
            )
            return this.sendSuccess(
                res,
                { review },
                `Review ${req.body.approve ? "approved" : "rejected"} successfully`
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error moderating review",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }
}

// Create and export a singleton instance
const reviewController = new ReviewController()
export default reviewController
