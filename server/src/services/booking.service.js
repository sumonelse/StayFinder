import { Booking, Property, User } from "../models/index.js"

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
        return booking
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

        if (!["confirmed", "cancelled"].includes(status)) {
            throw new Error(
                "Invalid status. Must be 'confirmed' or 'cancelled'"
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

        // Only host or admin can confirm bookings
        if (status === "confirmed" && !isHost && !isAdmin) {
            throw new Error("Only the host or admin can confirm bookings")
        }

        // Update booking status
        booking.status = status

        // If cancelling, record reason and who cancelled
        if (status === "cancelled") {
            booking.cancellationReason = reason || "No reason provided"
            booking.cancelledBy = isHost ? "host" : isGuest ? "guest" : "admin"
            booking.cancelledAt = new Date()
        }

        await booking.save()
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
