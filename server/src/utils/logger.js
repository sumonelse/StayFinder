import fs from "fs"
import path from "path"

/**
 * Simple logger utility for the application
 */
class Logger {
    constructor() {
        this.isProduction = process.env.NODE_ENV === "production"
        this.isVercel = process.env.VERCEL === "1"

        // Only create log directory in development
        if (!this.isProduction && !this.isVercel) {
            this.logDir = path.join(process.cwd(), "logs")
            this.ensureLogDirectory()
        }
    }

    /**
     * Ensure logs directory exists (development only)
     */
    ensureLogDirectory() {
        if (
            !this.isProduction &&
            !this.isVercel &&
            !fs.existsSync(this.logDir)
        ) {
            fs.mkdirSync(this.logDir, { recursive: true })
        }
    }

    /**
     * Get current timestamp
     */
    getTimestamp() {
        return new Date().toISOString()
    }

    /**
     * Format log message
     */
    formatMessage(level, message, meta = {}) {
        const timestamp = this.getTimestamp()
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta,
        }
        return JSON.stringify(logEntry)
    }

    /**
     * Write log to file (development only) or structured console output (production)
     */
    writeToFile(filename, content) {
        // In production/Vercel, output structured logs to console instead of files
        if (this.isProduction || this.isVercel) {
            // Output structured JSON for log aggregation services
            console.log(content)
            return
        }

        // Development: write to files as before
        const logPath = path.join(this.logDir, filename)
        const logLine = content + "\n"

        try {
            fs.appendFileSync(logPath, logLine)
        } catch (error) {
            console.error("Failed to write log to file:", error)
        }
    }

    /**
     * Log info message
     */
    info(message, meta = {}) {
        const logMessage = this.formatMessage("info", message, meta)
        console.log(`ℹ️  ${message}`)
        this.writeToFile("app.log", logMessage)
    }

    /**
     * Log warning message
     */
    warn(message, meta = {}) {
        const logMessage = this.formatMessage("warn", message, meta)
        console.warn(`⚠️  ${message}`)
        this.writeToFile("app.log", logMessage)
    }

    /**
     * Log error message
     */
    error(message, error = null, meta = {}) {
        const errorMeta = {
            ...meta,
            ...(error && {
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
            }),
        }

        const logMessage = this.formatMessage("error", message, errorMeta)
        console.error(`❌ ${message}`)
        if (error) {
            console.error(error)
        }

        this.writeToFile("error.log", logMessage)
        this.writeToFile("app.log", logMessage)
    }

    /**
     * Log debug message (only in development)
     */
    debug(message, meta = {}) {
        if (process.env.NODE_ENV === "development") {
            const logMessage = this.formatMessage("debug", message, meta)
            console.debug(`🐛 ${message}`)
            this.writeToFile("debug.log", logMessage)
        }
    }

    /**
     * Log HTTP request
     */
    http(req, res, responseTime) {
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
            userId: req.user?.id || "anonymous",
        }

        const message = `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`
        const logMessage = this.formatMessage("http", message, logData)

        // Color code based on status
        if (res.statusCode >= 400) {
            console.log(`🔴 ${message}`)
        } else if (res.statusCode >= 300) {
            console.log(`🟡 ${message}`)
        } else {
            console.log(`🟢 ${message}`)
        }

        this.writeToFile("access.log", logMessage)
    }

    /**
     * Log database operations
     */
    db(operation, collection, meta = {}) {
        const message = `Database ${operation} on ${collection}`
        const logData = {
            operation,
            collection,
            ...meta,
        }

        const logMessage = this.formatMessage("db", message, logData)
        this.writeToFile("database.log", logMessage)

        if (process.env.NODE_ENV === "development") {
            console.log(`💾 ${message}`)
        }
    }

    /**
     * Log authentication events
     */
    auth(event, userId, meta = {}) {
        const message = `Auth event: ${event} for user ${userId}`
        const logData = {
            event,
            userId,
            ...meta,
        }

        const logMessage = this.formatMessage("auth", message, logData)
        this.writeToFile("auth.log", logMessage)
        this.writeToFile("app.log", logMessage)

        console.log(`🔐 ${message}`)
    }

    /**
     * Log security events
     */
    security(event, details, meta = {}) {
        const message = `Security event: ${event}`
        const logData = {
            event,
            details,
            ...meta,
        }

        const logMessage = this.formatMessage("security", message, logData)
        this.writeToFile("security.log", logMessage)
        this.writeToFile("app.log", logMessage)

        console.warn(`🚨 ${message}`)
    }

    /**
     * Clean old log files (development only)
     */
    cleanOldLogs() {
        // Skip log cleaning in production/Vercel
        if (this.isProduction || this.isVercel) {
            return
        }

        try {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const logFiles = fs.readdirSync(this.logDir)

            logFiles.forEach((file) => {
                const filePath = path.join(this.logDir, file)
                const stats = fs.statSync(filePath)

                if (stats.mtime < thirtyDaysAgo) {
                    fs.unlinkSync(filePath)
                    this.info(`Deleted old log file: ${file}`)
                }
            })
        } catch (error) {
            // Silently fail in production
            if (!this.isProduction) {
                console.error("Failed to clean logs:", error)
            }
        }
    }
}

// Create singleton instance
const logger = new Logger()

// Clean old logs on startup
try {
    logger.cleanOldLogs()
} catch (error) {
    console.error("Failed to clean old logs:", error)
}

export default logger
