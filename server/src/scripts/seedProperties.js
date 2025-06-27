import mongoose from "mongoose"
import dotenv from "dotenv"
import { generatePropertySeedData } from "../data/propertySeedData.js"
import Property from "../models/property.model.js"
import User from "../models/user.model.js"

// Load environment variables
dotenv.config()

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
        return conn
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

/**
 * Seed properties to the database
 */
const seedProperties = async () => {
    try {
        // Connect to the database
        await connectDB()

        // Get host users (users with role 'host' or 'admin')
        const hosts = await User.find({
            role: { $in: ["host", "admin"] },
        }).select("_id")

        if (hosts.length === 0) {
            console.log("No host users found. Please create host users first.")
            process.exit(1)
        }

        // Extract host IDs
        const hostIds = hosts.map((host) => host._id.toString())
        console.log(`Found ${hostIds.length} host users`)

        // Clear existing properties
        await Property.deleteMany({})
        console.log("Deleted existing properties")

        // Generate property seed data (90% in India)
        const propertyCount = process.argv[2] ? parseInt(process.argv[2]) : 100
        const indianPercentage = process.argv[3]
            ? parseInt(process.argv[3])
            : 90

        console.log(
            `Generating ${propertyCount} properties (${indianPercentage}% in India)...`
        )
        const propertySeedData = generatePropertySeedData(
            hostIds,
            propertyCount,
            indianPercentage
        )

        // Insert properties into the database
        await Property.insertMany(propertySeedData)
        console.log(`${propertyCount} properties seeded successfully!`)

        // Disconnect from the database
        await mongoose.disconnect()
        console.log("Database connection closed")

        process.exit(0)
    } catch (error) {
        console.error(`Error seeding properties: ${error.message}`)
        if (error.stack) {
            console.error(error.stack)
        }
        process.exit(1)
    }
}

// Run the seed function
seedProperties()
