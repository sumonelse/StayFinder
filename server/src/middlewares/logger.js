import fs from "fs"
import morgan from "morgan"
import { join } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

// Get directory name in ES module context
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Ensure logs directory exists
const logsDir = join(dirname(__dirname), "logs")
fs.mkdirSync(logsDir, { recursive: true })

// Create access log stream
const accessLogPath = join(logsDir, "access.log")
const accessLogStream = fs.createWriteStream(accessLogPath, { flags: "a" })

/**
 * Configure and return Morgan logger middleware based on environment
 * @param {string} nodeEnv - The current environment (production, development, etc.)
 * @returns {Function} Configured Morgan middleware
 */
export const configureLogger = (nodeEnv) => {
    if (nodeEnv === "production") {
        return morgan("combined", {
            skip: (req, res) => res.statusCode < 400, // Skip logging for successful responses
            stream: accessLogStream, // Log to file
        })
    }

    // Development logging to console
    return morgan("dev")
}

export default configureLogger
