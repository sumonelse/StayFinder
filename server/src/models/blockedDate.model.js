import mongoose from "mongoose"

const blockedDateSchema = new mongoose.Schema(
    {
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        reason: {
            type: String,
            enum: ["maintenance", "personal_use", "unavailable", "other"],
            default: "unavailable",
        },
        note: {
            type: String,
            maxlength: 500,
        },
        blockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

// Create compound index for property and date (should be unique)
blockedDateSchema.index({ property: 1, date: 1 }, { unique: true })

// Create index for efficient querying
blockedDateSchema.index({ property: 1, date: 1 })

const BlockedDate = mongoose.model("BlockedDate", blockedDateSchema)

export default BlockedDate
