import dotenv from "dotenv"
import app from "./src/app.js"
import connectDB from "./src/config/db.js"
import { config } from "./src/config/config.js"
import { createDatabaseIndexes } from "./src/config/indexes.js"

// Load environment variables first thing
dotenv.config()

// Check if we're running in Vercel
const isVercel = process.env.VERCEL === "1"

// Database connection promise - will be used for Vercel
let dbConnectionPromise = null

// Initialize database connection for Vercel
if (isVercel) {
    console.log("🚀 Initializing server for Vercel serverless deployment")

    // Start the connection process but don't wait for it
    // Store the promise for later use
    dbConnectionPromise = connectDB()
        .then(() => {
            console.log("✅ Database connected for Vercel deployment")
            return true
        })
        .catch((err) => {
            console.error("❌ Failed to connect to database:", err.message)
            // Don't throw here, we'll handle connection issues per-request
            return false
        })
} else {
    // For local development, start a traditional server
    const startServer = async () => {
        try {
            // Connect to MongoDB with proper error handling
            await connectDB()

            // Create database indexes
            // await createDatabaseIndexes()

            const PORT = config.port || 5000

            const server = app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`)
                console.log(`🌐 Environment: ${config.env}`)
            })

            // Graceful shutdown handling
            process.on("SIGTERM", () => {
                console.log("SIGTERM received, shutting down gracefully")
                server.close(() => {
                    console.log("Server closed")
                    process.exit(0)
                })
            })

            process.on("SIGINT", () => {
                console.log("SIGINT received, shutting down gracefully")
                server.close(() => {
                    console.log("Server closed")
                    process.exit(0)
                })
            })
        } catch (error) {
            console.error("❌ Failed to start server:", error.message)
            process.exit(1)
        }
    }

    startServer()
}

// Middleware to ensure database connection before processing requests
const withDatabase = async (req, res, next) => {
    if (isVercel && dbConnectionPromise) {
        try {
            // Wait for the connection to be established if it's not already
            await dbConnectionPromise
            next()
        } catch (error) {
            console.error("❌ Database connection error:", error.message)
            return res.status(500).json({
                error: "Database connection error",
                message: "Server is experiencing database connectivity issues",
            })
        }
    } else {
        // In non-Vercel environments, we've already connected in startServer()
        next()
    }
}

// Add the database connection middleware to the app
if (isVercel) {
    app.use(withDatabase)
}

// Export the Express app for Vercel serverless functions
export default app
