import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
    {
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },
        guest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        checkInDate: {
            type: Date,
            required: [true, "Check-in date is required"],
        },
        checkOutDate: {
            type: Date,
            required: [true, "Check-out date is required"],
        },
        numberOfGuests: {
            type: Number,
            required: [true, "Number of guests is required"],
            min: [1, "Number of guests must be at least 1"],
        },
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: [0, "Total price cannot be negative"],
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "refunded", "failed"],
            default: "pending",
        },
        paymentId: {
            type: String,
            default: null,
        },
        specialRequests: {
            type: String,
            maxlength: [500, "Special requests cannot exceed 500 characters"],
        },
        cancellationReason: {
            type: String,
            default: null,
        },
        cancelledBy: {
            type: String,
            enum: ["guest", "host", "admin", null],
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
)

// Create a compound index for checking availability
bookingSchema.index({ property: 1, checkInDate: 1, checkOutDate: 1 })

// Create an index for user bookings
bookingSchema.index({ guest: 1, status: 1 })
bookingSchema.index({ host: 1, status: 1 })

const Booking = mongoose.model("Booking", bookingSchema)

export default Booking
