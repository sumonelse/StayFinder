import BaseController from "./base.controller.js"
import { bookingService } from "../services/index.js"

/**
 * Controller for booking-related routes
 */
class BookingController extends BaseController {
    /**
     * Create a new booking
     * @route POST /api/bookings
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createBooking(req, res) {
        try {
            const booking = await bookingService.createBooking(
                req.body,
                req.user._id
            )
            return this.sendSuccess(
                res,
                { booking },
                "Booking created successfully",
                201
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error creating booking",
                error.message.includes("not found") ||
                    error.message.includes("not available") ||
                    error.message.includes("already booked") ||
                    error.message.includes("Maximum") ||
                    error.message.includes("past") ||
                    error.message.includes("after")
                    ? 400
                    : 500
            )
        }
    }

    /**
     * Get all bookings for the current user
     * @route GET /api/bookings
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUserBookings(req, res) {
        try {
            const result = await bookingService.getUserBookings(
                req.user._id,
                req.query
            )
            return this.sendSuccess(res, result)
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error fetching bookings",
                500
            )
        }
    }

    /**
     * Get all bookings for properties owned by the current user (host)
     * @route GET /api/bookings/host
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getHostBookings(req, res) {
        try {
            const result = await bookingService.getHostBookings(
                req.user._id,
                req.query
            )
            return this.sendSuccess(res, result)
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error fetching host bookings",
                500
            )
        }
    }

    /**
     * Get a single booking by ID
     * @route GET /api/bookings/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getBookingById(req, res) {
        try {
            const booking = await bookingService.getBookingById(
                req.params.id,
                req.user._id,
                req.user.role
            )
            return this.sendSuccess(res, { booking })
        } catch (error) {
            if (error.message.includes("permission")) {
                return this.sendError(res, error.message, 403)
            }
            return this.sendError(
                res,
                error.message || "Error fetching booking",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Update booking status (confirm or cancel)
     * @route PATCH /api/bookings/:id/status
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateBookingStatus(req, res) {
        try {
            const booking = await bookingService.updateBookingStatus(
                req.params.id,
                req.body,
                req.user._id,
                req.user.role
            )
            return this.sendSuccess(
                res,
                { booking },
                `Booking ${booking.status} successfully`
            )
        } catch (error) {
            if (
                error.message.includes("permission") ||
                error.message.includes("Only the host")
            ) {
                return this.sendError(res, error.message, 403)
            }
            return this.sendError(
                res,
                error.message || "Error updating booking status",
                error.message.includes("not found") ? 404 : 400
            )
        }
    }

    /**
     * Update payment status (admin only)
     * @route PATCH /api/bookings/:id/payment
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updatePaymentStatus(req, res) {
        try {
            const booking = await bookingService.updatePaymentStatus(
                req.params.id,
                req.body
            )
            return this.sendSuccess(
                res,
                { booking },
                `Payment status updated to ${booking.paymentStatus}`
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error updating payment status",
                error.message.includes("not found") ? 404 : 400
            )
        }
    }

    /**
     * Get booking availability for a property
     * @route GET /api/bookings/availability/:propertyId
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getPropertyAvailability(req, res) {
        try {
            const result = await bookingService.getPropertyAvailability(
                req.params.propertyId,
                req.query
            )
            return this.sendSuccess(res, result)
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error checking availability",
                error.message.includes("not found") ||
                    error.message.includes("required")
                    ? 400
                    : 500
            )
        }
    }
}

// Create and export a singleton instance
const bookingController = new BookingController()

// Bind all methods to the instance to preserve 'this' context
Object.getOwnPropertyNames(BookingController.prototype)
    .filter((method) => method !== "constructor")
    .forEach((method) => {
        bookingController[method] =
            bookingController[method].bind(bookingController)
    })

export default bookingController
