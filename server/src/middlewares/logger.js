import fs from "fs"
import morgan from "morgan"
import { join } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

// Get directory name in ES module context
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Check if we're in Vercel or production environment
const isProduction = process.env.NODE_ENV === "production"
const isVercel = process.env.VERCEL === "1"

// Setup file logging only in development environment
let accessLogStream = { write: (message) => console.log(message) }

// Only create directories and file streams in development
if (!isProduction && !isVercel) {
    // Ensure logs directory exists
    const logsDir = join(dirname(__dirname), "logs")
    fs.mkdirSync(logsDir, { recursive: true })

    // Create access log stream
    const accessLogPath = join(logsDir, "access.log")
    accessLogStream = fs.createWriteStream(accessLogPath, { flags: "a" })
}

/**
 * Configure and return Morgan logger middleware based on environment
 * @param {string} nodeEnv - The current environment (production, development, etc.)
 * @returns {Function} Configured Morgan middleware
 */
export const configureLogger = (nodeEnv) => {
    const isVercel = process.env.VERCEL === "1"

    if (nodeEnv === "production" || isVercel) {
        // In Vercel or production, use a minimal format and log to console
        return morgan("tiny", {
            skip: (req, res) => res.statusCode < 400, // Skip logging for successful responses
        })
    }

    // In development (not Vercel), log to file
    if (!isVercel) {
        return morgan("dev", {
            stream: accessLogStream, // Log to file in development
        })
    }

    // Fallback to console logging
    return morgan("dev")
}

export default configureLogger
