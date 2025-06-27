import mongoose from "mongoose"
import { config } from "./config.js"

// Track connection status
let isConnected = false

const connectDB = async () => {
    // If already connected, return the existing connection
    if (isConnected) {
        console.log("✅ Using existing database connection")
        return mongoose.connection
    }

    try {
        if (!config.dbURL) {
            throw new Error(
                "MongoDB connection string (DB_URI) is not defined in environment variables"
            )
        }

        // Increase timeouts for Vercel serverless environment
        const connection = await mongoose.connect(config.dbURL, {
            serverSelectionTimeoutMS: 10000, // Increased from 5000
            socketTimeoutMS: 60000, // Increased from 45000
            // These options help with connection stability in serverless
            bufferCommands: true, // Enable command buffering
            connectTimeoutMS: 10000, // Connection timeout
        })

        isConnected = true
        console.log("✅ Database connected successfully")

        // Handle connection errors after initial connection
        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err)
            isConnected = false
        })

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected. Attempting to reconnect...")
            isConnected = false
        })

        mongoose.connection.on("reconnected", () => {
            console.log("MongoDB reconnected")
            isConnected = true
        })

        return connection
    } catch (error) {
        console.error("Database connection error:", error.message)
        isConnected = false
        // Don't exit the process here, let the caller handle it
        throw error
    }
}

export default connectDB
