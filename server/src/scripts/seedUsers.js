import mongoose from "mongoose"
import dotenv from "dotenv"
import { users } from "../data/userSeedData.js"
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
 * Seed users to the database
 */
const seedUsers = async () => {
    try {
        // Connect to the database
        await connectDB()

        // Clear existing users
        await User.deleteMany({})
        console.log("Deleted existing users")

        // Create and save users individually to ensure password hashing middleware runs
        for (const userData of users) {
            const user = new User(userData)
            await user.save()
        }
        console.log(`${users.length} users seeded successfully!`)

        // Disconnect from the database
        await mongoose.disconnect()
        console.log("Database connection closed")

        process.exit(0)
    } catch (error) {
        console.error(`Error seeding users: ${error.message}`)
        if (error.stack) {
            console.error(error.stack)
        }
        process.exit(1)
    }
}

// Run the seed function
seedUsers()
