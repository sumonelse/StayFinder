import api from "./axios"

/**
 * Service for booking-related API calls
 */
const bookingService = {
    /**
     * Create a new booking
     * @param {Object} bookingData - Booking data
     * @returns {Promise<Object>} Created booking
     */
    async createBooking(bookingData) {
        const response = await api.post("/bookings", bookingData)
        return response.data.booking
    },

    /**
     * Get all bookings for the current user
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Bookings and pagination info
     */
    async getUserBookings(params = {}) {
        const response = await api.get("/bookings", { params })
        return response.data
    },

    /**
     * Get all bookings for properties owned by the current user (host)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Bookings and pagination info
     */
    async getHostBookings(params = {}) {
        const response = await api.get("/bookings/host", { params })
        return response.data
    },

    /**
     * Get a single booking by ID
     * @param {string} id - Booking ID
     * @returns {Promise<Object>} Booking data
     */
    async getBookingById(id) {
        const response = await api.get(`/bookings/${id}`)
        return response.data.booking
    },

    /**
     * Update booking status (confirm or cancel)
     * @param {string} id - Booking ID
     * @param {Object} statusData - Status data { status: 'confirmed' | 'cancelled' }
     * @returns {Promise<Object>} Updated booking
     */
    async updateBookingStatus(id, statusData) {
        const response = await api.patch(`/bookings/${id}/status`, statusData)
        return response.data.booking
    },

    /**
     * Update payment status (admin only)
     * @param {string} id - Booking ID
     * @param {Object} paymentData - Payment data { paymentStatus: 'paid' | 'refunded' }
     * @returns {Promise<Object>} Updated booking
     */
    async updatePaymentStatus(id, paymentData) {
        const response = await api.patch(`/bookings/${id}/payment`, paymentData)
        return response.data.booking
    },

    /**
     * Get booking availability for a property
     * @param {string} propertyId - Property ID
     * @param {Object} params - Query parameters (checkInDate, checkOutDate)
     * @returns {Promise<Object>} Availability info
     */
    async getPropertyAvailability(propertyId, params) {
        const response = await api.get(`/bookings/availability/${propertyId}`, {
            params,
        })
        return response.data
    },
}

export default bookingService
