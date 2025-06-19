import api from "./axios"

/**
 * Service for review-related API calls
 */
const reviewService = {
    /**
     * Create a new review
     * @param {Object} reviewData - Review data
     * @returns {Promise<Object>} Created review
     */
    async createReview(reviewData) {
        const response = await api.post("/reviews", reviewData)
        return response.data.review
    },

    /**
     * Get all reviews for a property
     * @param {string} propertyId - Property ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Reviews and pagination info
     */
    async getPropertyReviews(propertyId, params = {}) {
        const response = await api.get(`/reviews/property/${propertyId}`, {
            params,
        })
        return response.data
    },

    /**
     * Get a single review by ID
     * @param {string} id - Review ID
     * @returns {Promise<Object>} Review data
     */
    async getReviewById(id) {
        const response = await api.get(`/reviews/${id}`)
        return response.data.review
    },

    /**
     * Update a review
     * @param {string} id - Review ID
     * @param {Object} reviewData - Review data to update
     * @returns {Promise<Object>} Updated review
     */
    async updateReview(id, reviewData) {
        const response = await api.put(`/reviews/${id}`, reviewData)
        return response.data.review
    },

    /**
     * Delete a review
     * @param {string} id - Review ID
     * @returns {Promise<Object>} Success message
     */
    async deleteReview(id) {
        const response = await api.delete(`/reviews/${id}`)
        return response.data
    },

    /**
     * Add host response to a review
     * @param {string} id - Review ID
     * @param {Object} responseData - Response data { text: string }
     * @returns {Promise<Object>} Updated review
     */
    async respondToReview(id, responseData) {
        const response = await api.post(`/reviews/${id}/response`, responseData)
        return response.data.review
    },

    /**
     * Report a review
     * @param {string} id - Review ID
     * @param {Object} reportData - Report data { reason: string }
     * @returns {Promise<Object>} Updated review
     */
    async reportReview(id, reportData) {
        const response = await api.post(`/reviews/${id}/report`, reportData)
        return response.data.review
    },

    /**
     * Get all reviews that need moderation (admin only)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Reviews and pagination info
     */
    async getReviewsForModeration(params = {}) {
        const response = await api.get("/reviews/moderation", { params })
        return response.data
    },

    /**
     * Moderate a review (admin only)
     * @param {string} id - Review ID
     * @param {Object} moderationData - Moderation data { approve: boolean }
     * @returns {Promise<Object>} Updated review
     */
    async moderateReview(id, moderationData) {
        const response = await api.patch(
            `/reviews/${id}/moderate`,
            moderationData
        )
        return response.data.review
    },
}

export default reviewService
