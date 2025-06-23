import mongoose from "mongoose"
import { Property } from "../src/models/index.js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

/**
 * Script to approve all existing properties for testing
 */
async function approveAllProperties() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_URI)
        console.log("✅ Connected to MongoDB")

        // Update all properties to set isApproved: true
        const result = await Property.updateMany(
            { isApproved: false },
            { $set: { isApproved: true } }
        )

        console.log(
            `✅ Updated ${result.modifiedCount} properties to approved status`
        )

        // List all properties with their approval status
        const properties = await Property.find(
            {},
            "title isAvailable isApproved"
        ).lean()
        console.log("\n📋 Property Status Summary:")
        properties.forEach((property, index) => {
            console.log(`${index + 1}. ${property.title}`)
            console.log(`   - Available: ${property.isAvailable}`)
            console.log(`   - Approved: ${property.isApproved}`)
            console.log()
        })

        console.log(`✅ Total properties: ${properties.length}`)
    } catch (error) {
        console.error("❌ Error updating properties:", error)
    } finally {
        // Close connection
        await mongoose.connection.close()
        console.log("🔒 Database connection closed")
    }
}

// Run the script
approveAllProperties()
