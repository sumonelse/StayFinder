import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema(
    {
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },
        comment: {
            type: String,
            required: [true, "Review comment is required"],
            trim: true,
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
        response: {
            text: {
                type: String,
                trim: true,
                maxlength: [1000, "Response cannot exceed 1000 characters"],
            },
            date: {
                type: Date,
            },
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
        reportCount: {
            type: Number,
            default: 0,
        },
        reports: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                reason: {
                    type: String,
                    required: true,
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
)

// Ensure a user can only review a property once per booking
reviewSchema.index({ property: 1, booking: 1, reviewer: 1 }, { unique: true })

// Create an index for property reviews
reviewSchema.index({ property: 1, isApproved: 1 })

const Review = mongoose.model("Review", reviewSchema)

export default Review
