import logger from "../utils/logger.js"

/**
 * Custom HTTP logging middleware
 */
export const httpLogger = (req, res, next) => {
    const startTime = Date.now()

    // Store original end function
    const originalEnd = res.end

    // Override res.end to capture response time
    res.end = function (chunk, encoding) {
        // Calculate response time
        const responseTime = Date.now() - startTime

        // Log the request
        logger.http(req, res, responseTime)

        // Call original end function
        originalEnd.call(this, chunk, encoding)
    }

    next()
}

/**
 * Error logging middleware
 */
export const errorLogger = (err, req, res, next) => {
    // Log the error
    logger.error(`Error in ${req.method} ${req.url}`, err, {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        userId: req.user?.id || "anonymous",
        body: req.method !== "GET" ? req.body : undefined,
    })

    next(err)
}

/**
 * Authentication event logger
 */
export const authLogger = (event) => {
    return (req, res, next) => {
        // Log successful operations in the route handler
        const originalJson = res.json

        res.json = function (data) {
            // Only log if the response was successful
            if (res.statusCode < 400) {
                const userId = req.user?.id || req.body?.email || "unknown"
                logger.auth(event, userId, {
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.get("User-Agent"),
                })
            }

            return originalJson.call(this, data)
        }

        next()
    }
}

/**
 * Security event logger for suspicious activities
 */
export const securityLogger = (req, res, next) => {
    // Log suspicious activities
    const suspiciousPatterns = [
        /\.\./, // Directory traversal
        /<script/i, // XSS attempts
        /union.*select/i, // SQL injection
        /javascript:/i, // Javascript protocol
        /data:/i, // Data protocol
    ]

    const checkSuspicious = (value) => {
        if (typeof value === "string") {
            return suspiciousPatterns.some((pattern) => pattern.test(value))
        }
        return false
    }

    // Check URL, query params, and body for suspicious content
    const suspicious = [
        req.url,
        JSON.stringify(req.query),
        JSON.stringify(req.body),
    ].some(checkSuspicious)

    if (suspicious) {
        logger.security("Suspicious request detected", {
            url: req.url,
            method: req.method,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent"),
            query: req.query,
            body: req.body,
        })
    }

    next()
}

export default {
    httpLogger,
    errorLogger,
    authLogger,
    securityLogger,
}
