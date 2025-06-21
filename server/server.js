import dotenv from "dotenv"
import app from "./src/app.js"
import connectDB from "./src/config/db.js"
import { config } from "./src/config/config.js"
import { createDatabaseIndexes } from "./src/config/indexes.js"

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
