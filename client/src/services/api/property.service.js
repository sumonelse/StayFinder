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
        try {
            // Create a clean copy of the data to send to the server
            const cleanData = JSON.parse(JSON.stringify(propertyData))

            // Ensure rules is properly formatted
            if (cleanData.rules) {
                // Make sure additionalRules is an array
                if (!Array.isArray(cleanData.rules.additionalRules)) {
                    cleanData.rules.additionalRules = []
                }
            }

            // Convert numeric string values to numbers
            if (typeof cleanData.price === "string") {
                cleanData.price = parseFloat(cleanData.price) || 0
            }

            if (typeof cleanData.cleaningFee === "string") {
                cleanData.cleaningFee = parseFloat(cleanData.cleaningFee) || 0
            }

            if (typeof cleanData.serviceFee === "string") {
                cleanData.serviceFee = parseFloat(cleanData.serviceFee) || 0
            }

            if (typeof cleanData.bedrooms === "string") {
                cleanData.bedrooms = parseInt(cleanData.bedrooms) || 0
            }

            if (typeof cleanData.bathrooms === "string") {
                cleanData.bathrooms = parseInt(cleanData.bathrooms) || 0
            }

            if (typeof cleanData.maxGuests === "string") {
                cleanData.maxGuests = parseInt(cleanData.maxGuests) || 1
            }

            console.log("Cleaned data for update:", cleanData)
            const response = await api.put(`/properties/${id}`, cleanData)
            return response.data.property
        } catch (error) {
            console.error(
                "Error updating property:",
                error.response?.data || error.message
            )
            throw error
        }
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
        if (!hostId) {
            throw new Error("Host ID is required to fetch properties")
        }

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
        try {
            if (!params.lat || !params.lng) {
                throw new Error("Latitude and longitude are required")
            }

            const response = await api.get("/properties/nearby", { params })

            // Calculate distance from user if not provided by the API
            if (
                response.data.properties &&
                response.data.properties.length > 0
            ) {
                const properties = response.data.properties.map((property) => {
                    // If the API doesn't provide distance, calculate it
                    if (
                        !property.distance &&
                        property.location &&
                        property.location.coordinates
                    ) {
                        const [lng, lat] = property.location.coordinates
                        property.distance = this.calculateDistance(
                            params.lat,
                            params.lng,
                            lat,
                            lng
                        )
                    }
                    return property
                })

                // Sort by distance
                return properties.sort(
                    (a, b) =>
                        (a.distance || Infinity) - (b.distance || Infinity)
                )
            }

            return response.data.properties
        } catch (error) {
            console.error("Error fetching nearby properties:", error)
            throw error
        }
    },

    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param {number} lat1 - Latitude of first point
     * @param {number} lon1 - Longitude of first point
     * @param {number} lat2 - Latitude of second point
     * @param {number} lon2 - Longitude of second point
     * @returns {number} Distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371 // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1)
        const dLon = this.deg2rad(lon2 - lon1)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
                Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c // Distance in km
        return Math.round(distance * 10) / 10 // Round to 1 decimal place
    },

    /**
     * Convert degrees to radians
     * @param {number} deg - Degrees
     * @returns {number} Radians
     */
    deg2rad(deg) {
        return deg * (Math.PI / 180)
    },

    /**
     * Block dates for a property
     * @param {string} propertyId - Property ID
     * @param {Array<string>} dates - Array of date strings to block
     * @param {string} reason - Reason for blocking
     * @param {string} note - Optional note
     * @returns {Promise<Object>} Blocked dates response
     */
    async blockDates(propertyId, dates, reason = "unavailable", note = "") {
        try {
            const response = await api.post(
                `/properties/${propertyId}/blocked-dates`,
                {
                    dates,
                    reason,
                    note,
                }
            )
            return response
        } catch (error) {
            console.error("Error blocking dates:", error)
            throw error
        }
    },

    /**
     * Unblock dates for a property
     * @param {string} propertyId - Property ID
     * @param {Array<string>} dates - Array of date strings to unblock
     * @returns {Promise<Object>} Unblock response
     */
    async unblockDates(propertyId, dates) {
        try {
            // Use a POST request for unblocking dates
            // This is more reliable than DELETE with a body
            const response = await api.post(
                `/properties/${propertyId}/blocked-dates/unblock`,
                { dates }
            )
            return response
        } catch (error) {
            console.error("Error unblocking dates:", error)
            throw error
        }
    },

    /**
     * Get blocked dates for a property
     * @param {string} propertyId - Property ID
     * @param {number} year - Year (optional)
     * @param {number} month - Month (optional)
     * @returns {Promise<Object>} Blocked dates
     */
    async getBlockedDates(propertyId, year, month) {
        try {
            const params = {}
            if (year) params.year = year
            if (month) params.month = month

            const response = await api.get(
                `/properties/${propertyId}/blocked-dates`,
                {
                    params,
                }
            )
            return response.data.blockedDates
        } catch (error) {
            console.error("Error getting blocked dates:", error)
            throw error
        }
    },
}

export default propertyService
