import { Review, Booking, Property, User } from "../models/index.js"
import mongoose from "mongoose"
import notificationService from "./notification.service.js"

/**
 * Service for review-related operations
 */
class ReviewService {
    /**
     * Create a new review
     * @param {Object} reviewData - Review data
     * @param {String} userId - User ID creating the review
     * @returns {Object} Created review
     */
    async createReview(reviewData, userId) {
        const { propertyId, bookingId, rating, comment } = reviewData

        // Check if booking exists and belongs to the user
        const booking = await Booking.findById(bookingId)
        if (!booking) {
            throw new Error("Booking not found")
        }

        if (booking.guest.toString() !== userId.toString()) {
            throw new Error("You can only review properties you have booked")
        }

        if (booking.status !== "completed") {
            throw new Error("You can only review completed bookings")
        }

        // Check if property exists
        const property = await Property.findById(propertyId)
        if (!property) {
            throw new Error("Property not found")
        }

        // Check if property matches booking
        if (booking.property.toString() !== propertyId.toString()) {
            throw new Error("Booking and property do not match")
        }

        // Check if user has already reviewed this booking
        const existingReview = await Review.findOne({
            booking: bookingId,
            reviewer: userId,
        })

        if (existingReview) {
            throw new Error("You have already reviewed this booking")
        }

        // Create review
        const review = new Review({
            property: propertyId,
            booking: bookingId,
            reviewer: userId,
            rating,
            comment,
            isApproved: true, // Auto-approve reviews for now
        })

        await review.save()

        // Update property rating using property service
        const { propertyService } = await import("./index.js")
        await propertyService.updatePropertyRating(propertyId)

        // Send notification to host about new review
        try {
            const property = await Property.findById(propertyId)
            const host = await User.findById(property.host)
            const reviewer = await User.findById(reviewerId)

            await notificationService.sendReviewNotification(
                review,
                property,
                host,
                reviewer
            )
            console.log(`✅ Review notification sent to host: ${host.email}`)
        } catch (emailError) {
            console.error(
                "❌ Error sending review notification:",
                emailError.message
            )
            // Don't fail the review if email fails
        }

        return review
    }

    /**
     * Get all reviews for a property
     * @param {String} propertyId - Property ID
     * @param {Object} queryParams - Query parameters for pagination
     * @returns {Object} Reviews and pagination info
     */
    async getPropertyReviews(propertyId, queryParams) {
        const { page = 1, limit = 10, sort = "-createdAt" } = queryParams

        // Build filter object
        const filter = { property: propertyId, isApproved: true }

        // Count total documents
        const total = await Review.countDocuments(filter)

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit)

        // Get reviews
        const reviews = await Review.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate({
                path: "reviewer",
                select: "name profilePicture",
            })

        return {
            reviews,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        }
    }

    /**
     * Get a single review by ID
     * @param {String} reviewId - Review ID
     * @returns {Object} Review object
     */
    async getReviewById(reviewId) {
        const review = await Review.findById(reviewId)
            .populate({
                path: "property",
                select: "title images",
            })
            .populate({
                path: "reviewer",
                select: "name profilePicture",
            })

        if (!review) {
            throw new Error("Review not found")
        }

        return review
    }

    /**
     * Update a review
     * @param {String} reviewId - Review ID
     * @param {Object} updateData - Data to update
     * @param {String} userId - User ID making the request
     * @returns {Object} Updated review
     */
    async updateReview(reviewId, updateData, userId) {
        const review = await Review.findById(reviewId)

        if (!review) {
            throw new Error("Review not found")
        }

        // Check if user is the reviewer
        if (review.reviewer.toString() !== userId.toString()) {
            throw new Error("You can only update your own reviews")
        }

        // Update review
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            {
                rating: updateData.rating,
                comment: updateData.comment,
            },
            { new: true, runValidators: true }
        )

        // Update property rating using property service
        const { propertyService } = await import("./index.js")
        await propertyService.updatePropertyRating(review.property)

        return updatedReview
    }

    /**
     * Delete a review
     * @param {String} reviewId - Review ID
     * @param {String} userId - User ID making the request
     * @param {String} userRole - User role
     */
    async deleteReview(reviewId, userId, userRole) {
        const review = await Review.findById(reviewId)

        if (!review) {
            throw new Error("Review not found")
        }

        // Check if user is the reviewer or an admin
        if (
            review.reviewer.toString() !== userId.toString() &&
            userRole !== "admin"
        ) {
            throw new Error("You don't have permission to delete this review")
        }

        await Review.findByIdAndDelete(reviewId)

        // Update property rating using property service
        const { propertyService } = await import("./index.js")
        await propertyService.updatePropertyRating(review.property)

        return { success: true }
    }

    /**
     * Add host response to a review
     * @param {String} reviewId - Review ID
     * @param {String} responseText - Response text
     * @param {String} userId - User ID making the request
     * @returns {Object} Updated review
     */
    async respondToReview(reviewId, responseText, userId) {
        const review = await Review.findById(reviewId).populate({
            path: "property",
            select: "host",
        })

        if (!review) {
            throw new Error("Review not found")
        }

        // Check if user is the property host
        if (review.property.host.toString() !== userId.toString()) {
            throw new Error("Only the property host can respond to reviews")
        }

        // Add response
        review.response = {
            text: responseText,
            date: new Date(),
        }

        await review.save()
        return review
    }

    /**
     * Report a review
     * @param {String} reviewId - Review ID
     * @param {String} reason - Report reason
     * @param {String} userId - User ID making the report
     * @returns {Object} Updated review
     */
    async reportReview(reviewId, reason, userId) {
        const review = await Review.findById(reviewId)

        if (!review) {
            throw new Error("Review not found")
        }

        // Check if user has already reported this review
        const alreadyReported = review.reports.some(
            (report) => report.user.toString() === userId.toString()
        )

        if (alreadyReported) {
            throw new Error("You have already reported this review")
        }

        // Add report
        review.reports.push({
            user: userId,
            reason,
            date: new Date(),
        })

        review.reportCount = review.reports.length

        // If report count exceeds threshold, un-approve the review
        if (review.reportCount >= 3) {
            review.isApproved = false
        }

        await review.save()
        return review
    }

    /**
     * Get all reviews that need moderation (admin only)
     * @param {Object} queryParams - Query parameters for pagination
     * @returns {Object} Reviews and pagination info
     */
    async getReviewsForModeration(queryParams) {
        const { page = 1, limit = 10 } = queryParams

        // Build filter object for reviews with reports
        const filter = { reportCount: { $gt: 0 } }

        // Count total documents
        const total = await Review.countDocuments(filter)

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit)

        // Get reviews
        const reviews = await Review.find(filter)
            .sort({ reportCount: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate({
                path: "property",
                select: "title",
            })
            .populate({
                path: "reviewer",
                select: "name",
            })

        return {
            reviews,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        }
    }

    /**
     * Moderate a review (admin only)
     * @param {String} reviewId - Review ID
     * @param {Boolean} approve - Whether to approve the review
     * @returns {Object} Updated review
     */
    async moderateReview(reviewId, approve) {
        const review = await Review.findById(reviewId)

        if (!review) {
            throw new Error("Review not found")
        }

        // Update approval status
        review.isApproved = approve

        // Clear reports if approving
        if (approve) {
            review.reports = []
            review.reportCount = 0
        }

        await review.save()

        // Update property rating using property service
        const { propertyService } = await import("./index.js")
        await propertyService.updatePropertyRating(review.property)

        return review
    }
}

export default new ReviewService()
