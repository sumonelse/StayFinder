import { Property, User, Review, Booking } from "../models/index.js"

/**
 * Create database indexes for better performance
 */
export const createDatabaseIndexes = async () => {
    try {
        console.log("🔍 Creating database indexes...")

        // Property indexes
        await Property.collection.createIndex(
            {
                title: "text",
                description: "text",
                "address.city": "text",
                "address.country": "text",
            },
            {
                name: "property_text_search",
                weights: {
                    title: 10,
                    description: 5,
                    "address.city": 3,
                    "address.country": 2,
                },
            }
        )

        await Property.collection.createIndex({ location: "2dsphere" })
        await Property.collection.createIndex({ host: 1 })
        await Property.collection.createIndex({ type: 1 })
        await Property.collection.createIndex({ price: 1 })
        await Property.collection.createIndex({ isAvailable: 1, isApproved: 1 })
        await Property.collection.createIndex({ avgRating: -1 })
        await Property.collection.createIndex({ createdAt: -1 })

        // User indexes
        await User.collection.createIndex({ email: 1 }, { unique: true })
        await User.collection.createIndex({ role: 1 })

        // Booking indexes
        await Booking.collection.createIndex({ guest: 1 })
        await Booking.collection.createIndex({ property: 1 })
        await Booking.collection.createIndex({ status: 1 })
        await Booking.collection.createIndex({ paymentStatus: 1 })
        await Booking.collection.createIndex({
            property: 1,
            checkInDate: 1,
            checkOutDate: 1,
        })
        await Booking.collection.createIndex({ createdAt: -1 })

        // Review indexes
        await Review.collection.createIndex({ property: 1 })
        await Review.collection.createIndex({ reviewer: 1 })
        await Review.collection.createIndex({ booking: 1 })
        await Review.collection.createIndex({ isApproved: 1 })
        await Review.collection.createIndex({ rating: -1 })
        await Review.collection.createIndex({ reportCount: -1 })
        await Review.collection.createIndex({ createdAt: -1 })

        console.log("✅ Database indexes created successfully")
    } catch (error) {
        console.error("❌ Error creating database indexes:", error.message)
        throw error
    }
}
