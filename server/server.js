import dotenv from "dotenv"
import app from "./src/app.js"
import connectDB from "./src/config/db.js"
import { config } from "./src/config/config.js"
import { createDatabaseIndexes } from "./src/config/indexes.js"

// Check if we're running in Vercel
const isVercel = process.env.VERCEL === "1"

// Initialize database connection
// This is executed once when the serverless function is cold started
if (isVercel) {
    // Load environment variables
    dotenv.config()

    // Connect to MongoDB (don't await here for Vercel)
    connectDB().catch((err) => {
        console.error("❌ Failed to connect to database:", err.message)
    })

    console.log("🚀 Server initialized for Vercel serverless deployment")
} else {
    // For local development, start a traditional server
    const startServer = async () => {
        try {
            // Load environment variables
            dotenv.config()

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

// Export the Express app for Vercel serverless functions
// This is what Vercel will use to handle incoming requests
export default app
