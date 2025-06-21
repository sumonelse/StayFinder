import { Booking, Property, User } from "../models/index.js"
import notificationService from "./notification.service.js"

/**
 * Service for booking-related operations
 */
class BookingService {
    /**
     * Create a new booking
     * @param {Object} bookingData - Booking data
     * @param {String} userId - User ID making the booking
     * @returns {Object} Created booking
     */
    async createBooking(bookingData, userId) {
        const {
            propertyId,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            specialRequests,
        } = bookingData

        // Validate dates
        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        const today = new Date()

        if (checkIn < today) {
            throw new Error("Check-in date cannot be in the past")
        }

        if (checkOut <= checkIn) {
            throw new Error("Check-out date must be after check-in date")
        }

        // Find property
        const property = await Property.findById(propertyId)
        if (!property) {
            throw new Error("Property not found")
        }

        // Check if property is available
        if (!property.isAvailable || !property.isApproved) {
            throw new Error("Property is not available for booking")
        }

        // Check if number of guests is valid
        if (numberOfGuests > property.maxGuests) {
            throw new Error(
                `Maximum number of guests allowed is ${property.maxGuests}`
            )
        }

        // Check if property is already booked for the selected dates
        const existingBooking = await Booking.findOne({
            property: propertyId,
            status: { $in: ["pending", "confirmed"] },
            $or: [
                {
                    // Check-in date falls within an existing booking
                    checkInDate: { $lte: checkOut },
                    checkOutDate: { $gte: checkIn },
                },
            ],
        })

        if (existingBooking) {
            throw new Error("Property is already booked for the selected dates")
        }

        // Calculate total price
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
        let totalPrice = property.price * nights

        // Apply price period adjustments
        if (property.pricePeriod === "week") {
            totalPrice = property.price * Math.ceil(nights / 7)
        } else if (property.pricePeriod === "month") {
            totalPrice = property.price * Math.ceil(nights / 30)
        }

        // Create booking
        const booking = new Booking({
            property: propertyId,
            guest: userId,
            host: property.host,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            totalPrice,
            specialRequests,
            status: "pending",
            paymentStatus: "pending",
        })

        await booking.save()

        // Send notifications
        try {
            const host = await User.findById(property.host)
            const guest = await User.findById(userId)

            // Send notification to host about new booking
            await notificationService.sendNewBookingNotification(
                booking,
                property,
                host,
                guest
            )

            console.log(`✅ Booking notification sent to host: ${host.email}`)
        } catch (emailError) {
            console.error(
                "❌ Error sending booking notification:",
                emailError.message
            )
            // Don't fail the booking if email fails
        }

        return booking
    }

    /**
     * Check property availability for given dates
     * @param {String} propertyId - Property ID
     * @param {Date} checkInDate - Check-in date
     * @param {Date} checkOutDate - Check-out date
     * @param {String} excludeBookingId - Booking ID to exclude from check (for updates)
     * @returns {Object} Availability status
     */
    async checkAvailability(
        propertyId,
        checkInDate,
        checkOutDate,
        excludeBookingId = null
    ) {
        // Validate dates
        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        const now = new Date()

        if (checkIn < now) {
            return {
                isAvailable: false,
                reason: "Check-in date cannot be in the past",
            }
        }

        if (checkOut <= checkIn) {
            return {
                isAvailable: false,
                reason: "Check-out date must be after check-in date",
            }
        }

        // Check if property exists and is available
        const property = await Property.findById(propertyId)
        if (!property) {
            throw new Error("Property not found")
        }

        if (!property.isAvailable || !property.isApproved) {
            return {
                isAvailable: false,
                reason: "Property is not available for booking",
            }
        }

        // Build query for existing bookings
        const query = {
            property: propertyId,
            status: { $in: ["pending", "confirmed"] },
            $or: [
                {
                    checkInDate: { $lt: checkOut },
                    checkOutDate: { $gt: checkIn },
                },
            ],
        }

        // Exclude specific booking if provided (for updates)
        if (excludeBookingId) {
            query._id = { $ne: excludeBookingId }
        }

        const existingBookings = await Booking.find(query)

        if (existingBookings.length > 0) {
            return {
                isAvailable: false,
                reason: "Property is already booked for these dates",
                conflictingBookings: existingBookings.map((booking) => ({
                    id: booking._id,
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
                    status: booking.status,
                })),
            }
        }

        // Calculate number of nights
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
        let totalPrice = property.price * nights

        // Apply price period adjustments
        if (property.pricePeriod === "week") {
            totalPrice = property.price * Math.ceil(nights / 7)
        } else if (property.pricePeriod === "month") {
            totalPrice = property.price * Math.ceil(nights / 30)
        }

        return {
            isAvailable: true,
            nights,
            pricePerNight: property.price,
            totalPrice,
            property: {
                title: property.title,
                maxGuests: property.maxGuests,
            },
        }
    }

    /**
     * Get all bookings for a user
     * @param {String} userId - User ID
     * @param {Object} queryParams - Query parameters for filtering and pagination
     * @returns {Object} Bookings and pagination info
     */
    async getUserBookings(userId, queryParams) {
        const {
            status,
            page = 1,
            limit = 10,
            sort = "-createdAt",
        } = queryParams

        // Build filter object
        const filter = { guest: userId }
        if (status) filter.status = status

        // Count total documents
        const total = await Booking.countDocuments(filter)

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit)

        // Get bookings
        const bookings = await Booking.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate({
                path: "property",
                select: "title type address images price pricePeriod",
            })
            .populate({
                path: "host",
                select: "name email profilePicture",
            })

        return {
            bookings,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        }
    }

    /**
     * Get all bookings for properties owned by a host
     * @param {String} hostId - Host user ID
     * @param {Object} queryParams - Query parameters for filtering and pagination
     * @returns {Object} Bookings and pagination info
     */
    async getHostBookings(hostId, queryParams) {
        const {
            status,
            page = 1,
            limit = 10,
            sort = "-createdAt",
        } = queryParams

        // Build filter object
        const filter = { host: hostId }
        if (status) filter.status = status

        // Count total documents
        const total = await Booking.countDocuments(filter)

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit)

        // Get bookings
        const bookings = await Booking.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate({
                path: "property",
                select: "title type address images price pricePeriod",
            })
            .populate({
                path: "guest",
                select: "name email profilePicture",
            })

        return {
            bookings,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        }
    }

    /**
     * Get a single booking by ID
     * @param {String} bookingId - Booking ID
     * @param {String} userId - User ID making the request
     * @param {String} userRole - User role
     * @returns {Object} Booking object
     */
    async getBookingById(bookingId, userId, userRole) {
        const booking = await Booking.findById(bookingId)
            .populate({
                path: "property",
                select: "title type address images price pricePeriod bedrooms bathrooms maxGuests amenities",
            })
            .populate({
                path: "guest",
                select: "name email profilePicture phone",
            })
            .populate({
                path: "host",
                select: "name email profilePicture phone",
            })

        if (!booking) {
            throw new Error("Booking not found")
        }

        // Check if user is authorized to view this booking
        if (
            booking.guest._id.toString() !== userId.toString() &&
            booking.host._id.toString() !== userId.toString() &&
            userRole !== "admin"
        ) {
            throw new Error("You don't have permission to view this booking")
        }

        return booking
    }

    /**
     * Update booking status (confirm or cancel)
     * @param {String} bookingId - Booking ID
     * @param {Object} updateData - Status update data
     * @param {String} userId - User ID making the request
     * @param {String} userRole - User role
     * @returns {Object} Updated booking
     */
    async updateBookingStatus(bookingId, updateData, userId, userRole) {
        const { status, reason } = updateData

        if (!["confirmed", "cancelled", "completed"].includes(status)) {
            throw new Error(
                "Invalid status. Must be 'confirmed', 'cancelled', or 'completed'"
            )
        }

        const booking = await Booking.findById(bookingId)

        if (!booking) {
            throw new Error("Booking not found")
        }

        // Check if user is authorized to update this booking
        const isHost = booking.host.toString() === userId.toString()
        const isGuest = booking.guest.toString() === userId.toString()
        const isAdmin = userRole === "admin"

        if (!isHost && !isGuest && !isAdmin) {
            throw new Error("You don't have permission to update this booking")
        }

        // Validate status transitions
        const validTransitions = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["completed", "cancelled"],
            cancelled: [], // Cannot change from cancelled
            completed: [], // Cannot change from completed
        }

        if (!validTransitions[booking.status]?.includes(status)) {
            throw new Error(
                `Cannot change booking status from ${booking.status} to ${status}`
            )
        }

        // Only host or admin can confirm bookings
        if (status === "confirmed" && !isHost && !isAdmin) {
            throw new Error("Only the host or admin can confirm bookings")
        }

        // Only host or admin can mark as completed
        if (status === "completed" && !isHost && !isAdmin) {
            throw new Error(
                "Only the host or admin can mark bookings as completed"
            )
        }

        // Validate cancellation reason
        if (status === "cancelled" && !reason) {
            throw new Error("Cancellation reason is required")
        }

        // Store previous status for logging
        const previousStatus = booking.status

        // Update booking status
        booking.status = status

        // If cancelling, record reason and who cancelled
        if (status === "cancelled") {
            booking.cancellationReason = reason
            booking.cancelledBy = isHost ? "host" : isGuest ? "guest" : "admin"
            booking.cancelledAt = new Date()

            // Update payment status for cancellations
            if (booking.paymentStatus === "paid") {
                booking.paymentStatus = "refunded"
            }
        }

        // If completing, update completion date
        if (status === "completed") {
            booking.completedAt = new Date()
        }

        booking.updatedAt = new Date()
        await booking.save()

        // Send notifications based on status change
        try {
            const host = await User.findById(booking.host)
            const guest = await User.findById(booking.guest)
            const property = await Property.findById(booking.property)

            if (status === "confirmed") {
                // Send confirmation email to guest
                await notificationService.sendBookingConfirmation(
                    booking,
                    property,
                    guest
                )
                console.log(
                    `✅ Booking confirmation sent to guest: ${guest.email}`
                )
            } else if (status === "cancelled") {
                // Send cancellation emails to both parties
                const cancelledBy = isHost
                    ? "host"
                    : isGuest
                      ? "guest"
                      : "admin"

                // Email to guest
                await notificationService.sendBookingCancellation(
                    booking,
                    property,
                    guest.email,
                    guest.name,
                    cancelledBy
                )

                // Email to host (if not cancelled by host)
                if (!isHost) {
                    await notificationService.sendBookingCancellation(
                        booking,
                        property,
                        host.email,
                        host.name,
                        cancelledBy
                    )
                }

                console.log(`✅ Booking cancellation notifications sent`)
            }
        } catch (emailError) {
            console.error(
                "❌ Error sending status change notification:",
                emailError.message
            )
            // Don't fail the status update if email fails
        }

        // Log status change for audit trail
        console.log(
            `Booking ${bookingId} status changed from ${previousStatus} to ${status} by user ${userId}`
        )

        return booking
    }

    /**
     * Update payment status (admin only)
     * @param {String} bookingId - Booking ID
     * @param {Object} paymentData - Payment update data
     * @returns {Object} Updated booking
     */
    async updatePaymentStatus(bookingId, paymentData) {
        const { paymentStatus, paymentId } = paymentData

        if (!["paid", "refunded", "failed"].includes(paymentStatus)) {
            throw new Error("Invalid payment status")
        }

        const booking = await Booking.findById(bookingId)

        if (!booking) {
            throw new Error("Booking not found")
        }

        // Update payment status
        booking.paymentStatus = paymentStatus
        if (paymentId) booking.paymentId = paymentId

        // If payment is successful, confirm booking
        if (paymentStatus === "paid" && booking.status === "pending") {
            booking.status = "confirmed"
        }

        await booking.save()
        return booking
    }

    /**
     * Get booking availability for a property
     * @param {String} propertyId - Property ID
     * @param {Object} dateRange - Date range to check
     * @returns {Object} Availability info
     */
    async getPropertyAvailability(propertyId, dateRange) {
        const { startDate, endDate } = dateRange

        if (!startDate || !endDate) {
            throw new Error("Start date and end date are required")
        }

        // Find property
        const property = await Property.findById(propertyId)
        if (!property) {
            throw new Error("Property not found")
        }

        // Check if property is available
        if (!property.isAvailable || !property.isApproved) {
            throw new Error("Property is not available for booking")
        }

        // Find bookings for the property in the date range
        const bookings = await Booking.find({
            property: propertyId,
            status: { $in: ["pending", "confirmed"] },
            $or: [
                {
                    checkInDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
                {
                    checkOutDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
                {
                    checkInDate: { $lte: new Date(startDate) },
                    checkOutDate: { $gte: new Date(endDate) },
                },
            ],
        }).select("checkInDate checkOutDate")

        // Create an array of unavailable dates
        const unavailableDates = []
        bookings.forEach((booking) => {
            const start = new Date(booking.checkInDate)
            const end = new Date(booking.checkOutDate)
            const dates = []

            // Generate all dates between check-in and check-out
            for (
                let date = new Date(start);
                date < end;
                date.setDate(date.getDate() + 1)
            ) {
                dates.push(new Date(date))
            }

            unavailableDates.push(...dates)
        })

        return {
            property: {
                id: property._id,
                title: property.title,
                isAvailable: property.isAvailable,
            },
            unavailableDates,
        }
    }
}

export default new BookingService()
