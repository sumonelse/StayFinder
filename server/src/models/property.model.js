import mongoose from "mongoose"

const propertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxlength: [2000, "Description cannot exceed 2000 characters"],
        },
        type: {
            type: String,
            required: [true, "Property type is required"],
            enum: [
                "apartment",
                "house",
                "condo",
                "villa",
                "cabin",
                "cottage",
                "hotel",
                "other",
            ],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        pricePeriod: {
            type: String,
            enum: ["night", "week", "month"],
            default: "night",
        },
        bedrooms: {
            type: Number,
            required: [true, "Number of bedrooms is required"],
            min: [0, "Bedrooms cannot be negative"],
        },
        bathrooms: {
            type: Number,
            required: [true, "Number of bathrooms is required"],
            min: [0, "Bathrooms cannot be negative"],
        },
        maxGuests: {
            type: Number,
            required: [true, "Maximum number of guests is required"],
            min: [1, "Maximum guests must be at least 1"],
        },
        address: {
            street: {
                type: String,
                required: [true, "Street address is required"],
                trim: true,
            },
            city: {
                type: String,
                required: [true, "City is required"],
                trim: true,
            },
            state: {
                type: String,
                required: [true, "State/Province is required"],
                trim: true,
            },
            zipCode: {
                type: String,
                required: [true, "Zip/Postal code is required"],
                trim: true,
            },
            country: {
                type: String,
                required: [true, "Country is required"],
                trim: true,
            },
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        amenities: {
            type: [String],
            default: [],
        },
        images: [
            {
                url: {
                    type: String,
                    required: true,
                },
                caption: {
                    type: String,
                    default: "",
                },
            },
        ],
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        rejectionReason: {
            type: String,
            default: null,
        },
        rules: {
            type: Object,
            default: {
                checkIn: "3:00 PM",
                checkOut: "11:00 AM",
                smoking: false,
                pets: false,
                parties: false,
                events: false,
                quietHours: "10:00 PM - 7:00 AM",
                additionalRules: [],
            },
        },
        avgRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        featuredUntil: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
)

// Create a geospatial index for location-based queries
propertySchema.index({ location: "2dsphere" })

// Create a text index for search functionality
propertySchema.index({
    title: "text",
    description: "text",
    "address.city": "text",
    "address.state": "text",
    "address.country": "text",
})

const Property = mongoose.model("Property", propertySchema)

export default Property
