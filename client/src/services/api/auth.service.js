import api from "./axios"

/**
 * Service for authentication-related API calls
 */
const authService = {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} User data and token
     */
    async register(userData) {
        const response = await api.post("/auth/register", userData)

        // Ensure user has a favorites array
        if (!response.data.user.favorites) {
            response.data.user.favorites = []
            console.log(
                "Added missing favorites array to user data in register API"
            )
        }

        return response.data
    },

    /**
     * Login a user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data and token
     */
    async login(email, password) {
        const response = await api.post("/auth/login", { email, password })

        // Ensure user has a favorites array
        if (!response.data.user.favorites) {
            response.data.user.favorites = []
            console.log(
                "Added missing favorites array to user data in login API"
            )
        }

        return response.data
    },

    /**
     * Get current user profile
     * @returns {Promise<Object>} User data
     */
    async getCurrentUser() {
        const response = await api.get("/auth/me")

        // Ensure user has a favorites array
        if (!response.data.user.favorites) {
            response.data.user.favorites = []
            console.log(
                "Added missing favorites array to user data in getCurrentUser API"
            )
        }

        return response.data.user
    },

    /**
     * Update user profile
     * @param {Object} userData - User profile data to update
     * @returns {Promise<Object>} Updated user data
     */
    async updateProfile(userData) {
        const response = await api.put("/auth/me", userData)
        return response.data.user
    },

    /**
     * Add property to favorites
     * @param {string} propertyId - Property ID to add to favorites
     * @returns {Promise<Object>} Updated user data
     */
    async addToFavorites(propertyId) {
        const response = await api.post(`/auth/favorites/${propertyId}`)
        return response.data.user
    },

    /**
     * Remove property from favorites
     * @param {string} propertyId - Property ID to remove from favorites
     * @returns {Promise<Object>} Updated user data
     */
    async removeFromFavorites(propertyId) {
        const response = await api.delete(`/auth/favorites/${propertyId}`)
        return response.data.user
    },

    /**
     * Get user favorites with property details
     * @returns {Promise<Array>} Array of favorite properties
     */
    async getFavorites() {
        const response = await api.get("/auth/favorites")
        return response.data.favorites
    },

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} Response data
     */
    async requestPasswordReset(email) {
        const response = await api.post("/auth/forgot-password", { email })
        return response.data
    },

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} password - New password
     * @returns {Promise<Object>} Response data
     */
    async resetPassword(token, password) {
        const response = await api.post("/auth/reset-password", {
            token,
            password,
        })
        return response.data
    },
}

export default authService
