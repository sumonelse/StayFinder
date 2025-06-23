import { Booking, Property, User, BlockedDate } from "../models/index.js"
import notificationService from "./notification.service.js"
import blockedDateService from "./blockedDate.service.js"

/**
 * Service for booking-related operations
 */
class BookingService {
    /**
     * Validate booking dates
     * @param {Date} checkInDate - Check-in date
     * @param {Date} checkOutDate - Check-out date
     * @returns {Object} Validation result with isValid and error message
     */
    validateDates(checkInDate, checkOutDate) {
        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        const today = new Date().setHours(0, 0, 0, 0)

        if (checkIn < today) {
            return {
                isValid: false,
                error: "Check-in date cannot be in the past",
            }
        }

        if (checkOut <= checkIn) {
            return {
                isValid: false,
                error: "Check-out date must be after check-in date",
            }
        }

        return {
            isValid: true,
            checkIn,
            checkOut,
        }
    }

    /**
     * Validate property availability
     * @param {String} propertyId - Property ID
     * @returns {Promise<Object>} Property details if valid
     */
    async validateProperty(propertyId) {
        const propertyDetails = await Property.findById(propertyId)

        if (!propertyDetails) {
            throw new Error("Property not found")
        }

        if (!propertyDetails.isAvailable || !propertyDetails.isApproved) {
            throw new Error("Property is not available for booking")
        }

        return propertyDetails
    }

    /**
     * Build a query to find conflicting bookings
     * @param {String} propertyId - Property ID
     * @param {Date} checkIn - Check-in date
     * @param {Date} checkOut - Check-out date
     * @param {String} excludeBookingId - Optional booking ID to exclude
     * @returns {Object} MongoDB query object
     */
    buildBookingConflictQuery(
        propertyId,
        checkIn,
        checkOut,
        excludeBookingId = null
    ) {
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

        return query
    }

    /**
     * Get paginated bookings with common logic
     * @param {Object} filter - MongoDB filter object
     * @param {Object} queryParams - Query parameters
     * @param {Array} populateOptions - Fields to populate
     * @returns {Object} Bookings and pagination info
     */
    async getPaginatedBookings(filter, queryParams, populateOptions) {
        const { page = 1, limit = 10, sort = "-createdAt" } = queryParams

        // Count total documents
        const total = await Booking.countDocuments(filter)

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit)

        // Get bookings
        const bookings = await Booking.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate(populateOptions)

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
     * Calculate total price for a booking
     * @param {Object} propertyDetails - Property details
     * @param {Date} checkIn - Check-in date
     * @param {Date} checkOut - Check-out date
     * @returns {Object} Price details
     */
    calculateTotalPrice(propertyDetails, checkIn, checkOut) {
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
        let totalPrice = propertyDetails.price * nights

        // Apply price period adjustments
        if (propertyDetails.pricePeriod === "week") {
            totalPrice = propertyDetails.price * Math.ceil(nights / 7)
        } else if (propertyDetails.pricePeriod === "month") {
            totalPrice = propertyDetails.price * Math.ceil(nights / 30)
        }

        return {
            nights,
            pricePerNight: propertyDetails.price,
            totalPrice,
        }
    }
    /**
     * Create a new booking
     * @param {Object} bookingData - Booking data
     * @param {String} userId - User ID making the booking
     * @returns {Object} Created booking
     */
    async createBooking(bookingData, userId) {
        // Extract booking data with consistent field names
        const {
            propertyId,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            specialRequests,
            totalPrice: providedTotalPrice,
        } = bookingData

        // Validate dates
        const dateValidation = this.validateDates(checkInDate, checkOutDate)
        if (!dateValidation.isValid) {
            throw new Error(dateValidation.error)
        }

        const { checkIn, checkOut } = dateValidation

        // Validate property
        const propertyDetails = await this.validateProperty(propertyId)

        // Check if number of guests is valid
        if (numberOfGuests > propertyDetails.maxGuests) {
            throw new Error(
                `Maximum number of guests allowed is ${propertyDetails.maxGuests}`
            )
        }

        // Check if property is already booked for the selected dates
        const query = this.buildBookingConflictQuery(
            propertyId,
            checkIn,
            checkOut
        )
        const existingBooking = await Booking.findOne(query)

        if (existingBooking) {
            throw new Error("Property is already booked for the selected dates")
        }

        // Check if any dates are manually blocked
        const datesToCheck = []
        for (
            let date = new Date(checkIn);
            date < checkOut;
            date.setDate(date.getDate() + 1)
        ) {
            datesToCheck.push(date.toISOString().split("T")[0])
        }

        const blockedDatesMap = await blockedDateService.checkDatesBlocked(
            propertyId,
            datesToCheck
        )
        const blockedDates = Object.keys(blockedDatesMap).filter(
            (date) => blockedDatesMap[date]
        )

        if (blockedDates.length > 0) {
            throw new Error(
                `Property is not available for the following dates: ${blockedDates.join(", ")}`
            )
        }

        // Calculate total price
        const { totalPrice, nights } = this.calculateTotalPrice(
            propertyDetails,
            checkIn,
            checkOut
        )

        // Create booking
        const booking = new Booking({
            property: propertyId,
            guest: userId,
            host: propertyDetails.host,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            totalPrice: bookingData.totalPrice || totalPrice, // Use provided total price if available
            specialRequests,
            status: "pending",
            paymentStatus: "pending",
        })

        await booking.save()

        // Send notifications
        try {
            const host = await User.findById(propertyDetails.host)
            const guest = await User.findById(userId)

            // Send notification to host about new booking
            await notificationService.sendNewBookingNotification(
                booking,
                propertyDetails,
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
        const dateValidation = this.validateDates(checkInDate, checkOutDate)
        if (!dateValidation.isValid) {
            return {
                isAvailable: false,
                reason: dateValidation.error,
            }
        }

        const { checkIn, checkOut } = dateValidation

        // Check if property exists and is available
        let propertyDetails
        try {
            propertyDetails = await this.validateProperty(propertyId)
        } catch (error) {
            return {
                isAvailable: false,
                reason: error.message,
            }
        }

        // Build query for existing bookings
        const query = this.buildBookingConflictQuery(
            propertyId,
            checkIn,
            checkOut,
            excludeBookingId
        )

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

        // Calculate price
        const priceDetails = this.calculateTotalPrice(
            propertyDetails,
            checkIn,
            checkOut
        )

        return {
            isAvailable: true,
            nights: priceDetails.nights,
            pricePerNight: priceDetails.pricePerNight,
            totalPrice: priceDetails.totalPrice,
            property: {
                title: propertyDetails.title,
                maxGuests: propertyDetails.maxGuests,
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
        const { status } = queryParams

        // Build filter object
        const filter = { guest: userId }
        if (status) filter.status = status

        // Define populate options
        const populateOptions = [
            {
                path: "property",
                select: "title type address images price pricePeriod",
            },
            {
                path: "host",
                select: "name email profilePicture",
            },
        ]

        // Get paginated bookings
        return this.getPaginatedBookings(filter, queryParams, populateOptions)
    }

    /**
     * Get all bookings for properties owned by a host
     * @param {String} hostId - Host user ID
     * @param {Object} queryParams - Query parameters for filtering and pagination
     * @returns {Object} Bookings and pagination info
     */
    async getHostBookings(hostId, queryParams) {
        const { status } = queryParams

        // Build filter object
        const filter = { host: hostId }
        if (status) filter.status = status

        // Define populate options
        const populateOptions = [
            {
                path: "property",
                select: "title type address images price pricePeriod",
            },
            {
                path: "guest",
                select: "name email profilePicture",
            },
        ]

        // Get paginated bookings
        return this.getPaginatedBookings(filter, queryParams, populateOptions)
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
        // Extract date fields
        const { checkInDate, checkOutDate, detailed = false } = dateRange

        if (!checkInDate || !checkOutDate) {
            throw new Error("Check-in date and check-out date are required")
        }

        // Validate property
        const propertyDetails = await this.validateProperty(propertyId)

        // For specific date range check
        if (!detailed) {
            // Validate dates
            const dateValidation = this.validateDates(checkInDate, checkOutDate)
            if (!dateValidation.isValid) {
                throw new Error(dateValidation.error)
            }

            // Get check-in and check-out dates from validation
            const { checkIn, checkOut } = dateValidation

            // Find bookings for the property in the date range
            const query = this.buildBookingConflictQuery(
                propertyId,
                checkIn,
                checkOut
            )
            const bookings = await Booking.find(query).select(
                "checkInDate checkOutDate"
            )

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
                    id: propertyDetails._id,
                    title: propertyDetails.title,
                    isAvailable: propertyDetails.isAvailable,
                },
                unavailableDates,
                available: bookings.length === 0,
            }
        }
        // For detailed availability map (used by calendar)
        else {
            // Parse dates
            const start = new Date(checkInDate)
            const end = new Date(checkOutDate)

            // Ensure dates are valid
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new Error("Invalid date format")
            }

            // Find all bookings for the property
            const bookings = await Booking.find({
                property: propertyId,
                status: { $nin: ["cancelled", "rejected"] },
                $or: [
                    // Booking starts during the requested period
                    { checkInDate: { $gte: start, $lt: end } },
                    // Booking ends during the requested period
                    { checkOutDate: { $gt: start, $lte: end } },
                    // Booking spans the entire requested period
                    {
                        checkInDate: { $lte: start },
                        checkOutDate: { $gte: end },
                    },
                ],
            }).select("checkInDate checkOutDate")

            // Create a map of dates to availability
            const availabilityMap = {}

            // Initialize all dates as available
            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                const dateString = d.toISOString().split("T")[0]
                availabilityMap[dateString] = true
            }

            // Mark booked dates as unavailable
            bookings.forEach((booking) => {
                const bookingStart = new Date(booking.checkInDate)
                const bookingEnd = new Date(booking.checkOutDate)

                for (
                    let d = new Date(bookingStart);
                    d < bookingEnd;
                    d.setDate(d.getDate() + 1)
                ) {
                    if (d >= start && d < end) {
                        const dateString = d.toISOString().split("T")[0]
                        availabilityMap[dateString] = false
                    }
                }
            })

            // Mark manually blocked dates as unavailable
            const blockedDatesMap =
                await blockedDateService.getBlockedDatesInRange(
                    propertyId,
                    start,
                    end
                )

            Object.keys(blockedDatesMap).forEach((dateString) => {
                if (availabilityMap.hasOwnProperty(dateString)) {
                    availabilityMap[dateString] = false
                }
            })

            // Check if any dates are available
            const hasAvailableDates = Object.values(availabilityMap).some(
                (isAvailable) => isAvailable
            )

            return {
                property: {
                    id: propertyDetails._id,
                    title: propertyDetails.title,
                    isAvailable: propertyDetails.isAvailable,
                },
                availabilityMap,
                blockedDates: blockedDatesMap,
                available: bookings.length === 0 && hasAvailableDates,
            }
        }
    }
}

export default new BookingService()
