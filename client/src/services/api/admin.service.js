import api from "./axios"

/**
 * Service for admin-related API calls
 */
const adminService = {
    /**
     * Get dashboard statistics
     * @returns {Promise<Object>} Dashboard stats
     */
    async getDashboardStats() {
        const response = await api.get("/admin/dashboard")
        return response.data
    },

    /**
     * Get all properties with admin details
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Properties and pagination info
     */
    async getProperties(params = {}) {
        const response = await api.get("/admin/properties", { params })
        return response.data
    },

    /**
     * Approve or reject a property
     * @param {string} id - Property ID
     * @param {Object} data - Approval data
     * @returns {Promise<Object>} Updated property
     */
    async updatePropertyApproval(id, data) {
        const response = await api.patch(
            `/admin/properties/${id}/approval`,
            data
        )
        return response.data
    },

    /**
     * Delete a property
     * @param {string} id - Property ID
     * @returns {Promise<Object>} Success response
     */
    async deleteProperty(id) {
        const response = await api.delete(`/admin/properties/${id}`)
        return response.data
    },

    /**
     * Get all bookings with admin details
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Bookings and pagination info
     */
    async getBookings(params = {}) {
        const response = await api.get("/admin/bookings", { params })
        return response.data
    },

    /**
     * Get all users with admin details
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Users and pagination info
     */
    async getUsers(params = {}) {
        const response = await api.get("/admin/users", { params })
        return response.data
    },

    /**
     * Update user status (activate/suspend)
     * @param {string} id - User ID
     * @param {Object} data - Status data
     * @returns {Promise<Object>} Updated user
     */
    async updateUserStatus(id, data) {
        const response = await api.patch(`/admin/users/${id}/status`, data)
        return response.data
    },

    /**
     * Get all reviews with admin details
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Reviews and pagination info
     */
    async getReviews(params = {}) {
        const response = await api.get("/admin/reviews", { params })
        return response.data
    },

    /**
     * Delete a review
     * @param {string} id - Review ID
     * @returns {Promise<Object>} Success response
     */
    async deleteReview(id) {
        const response = await api.delete(`/admin/reviews/${id}`)
        return response.data
    },
}

export default adminService
