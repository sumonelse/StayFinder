import api from "./axios"

/**
 * Service for property-related API calls
 */
const propertyService = {
    /**
     * Get all properties with filtering, sorting, and pagination
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Properties and pagination info
     */
    async getAllProperties(params = {}) {
        const response = await api.get("/properties", { params })
        return response.data
    },

    /**
     * Get a single property by ID
     * @param {string} id - Property ID
     * @returns {Promise<Object>} Property data
     */
    async getPropertyById(id) {
        const response = await api.get(`/properties/${id}`)
        return response.data.property
    },

    /**
     * Create a new property
     * @param {Object} propertyData - Property data
     * @returns {Promise<Object>} Created property
     */
    async createProperty(propertyData) {
        const response = await api.post("/properties", propertyData)
        return response.data.property
    },

    /**
     * Update a property
     * @param {string} id - Property ID
     * @param {Object} propertyData - Property data to update
     * @returns {Promise<Object>} Updated property
     */
    async updateProperty(id, propertyData) {
        const response = await api.put(`/properties/${id}`, propertyData)
        return response.data.property
    },

    /**
     * Delete a property
     * @param {string} id - Property ID
     * @returns {Promise<Object>} Success message
     */
    async deleteProperty(id) {
        const response = await api.delete(`/properties/${id}`)
        return response.data
    },

    /**
     * Get properties by host
     * @param {string} hostId - Host ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Properties and pagination info
     */
    async getPropertiesByHost(hostId, params = {}) {
        const response = await api.get(`/properties/host/${hostId}`, { params })
        return response.data
    },

    /**
     * Toggle property availability
     * @param {string} id - Property ID
     * @returns {Promise<Object>} Updated property
     */
    async toggleAvailability(id) {
        const response = await api.patch(`/properties/${id}/availability`)
        return response.data.property
    },

    /**
     * Approve a property (admin only)
     * @param {string} id - Property ID
     * @returns {Promise<Object>} Updated property
     */
    async approveProperty(id) {
        const response = await api.patch(`/properties/${id}/approve`)
        return response.data.property
    },

    /**
     * Search properties by location (nearby)
     * @param {Object} params - Query parameters (lat, lng, distance)
     * @returns {Promise<Array>} Array of properties
     */
    async getNearbyProperties(params) {
        const response = await api.get("/properties/nearby", { params })
        return response.data.properties
    },
}

export default propertyService
