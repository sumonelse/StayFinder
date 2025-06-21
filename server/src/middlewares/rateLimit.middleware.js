/**
 * Rate limiting middleware to prevent abuse
 */

// Simple in-memory rate limiter (for production, use Redis or external service)
class RateLimiter {
    constructor() {
        this.requests = new Map()
        this.cleanup()
    }

    // Clean up old entries every minute
    cleanup() {
        setInterval(() => {
            const now = Date.now()
            for (const [key, data] of this.requests.entries()) {
                if (now - data.resetTime > 0) {
                    this.requests.delete(key)
                }
            }
        }, 60000) // Clean every minute
    }

    isAllowed(identifier, limit, windowMs) {
        const now = Date.now()
        const key = identifier

        if (!this.requests.has(key)) {
            this.requests.set(key, {
                count: 1,
                resetTime: now + windowMs,
                firstRequest: now,
            })
            return { allowed: true, remaining: limit - 1 }
        }

        const data = this.requests.get(key)

        // Reset if window has expired
        if (now > data.resetTime) {
            this.requests.set(key, {
                count: 1,
                resetTime: now + windowMs,
                firstRequest: now,
            })
            return { allowed: true, remaining: limit - 1 }
        }

        // Check if limit exceeded
        if (data.count >= limit) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: data.resetTime,
            }
        }

        // Increment count
        data.count++
        this.requests.set(key, data)

        return {
            allowed: true,
            remaining: limit - data.count,
            resetTime: data.resetTime,
        }
    }
}

const rateLimiter = new RateLimiter()

/**
 * Create rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.message - Error message when limit exceeded
 * @param {Function} options.keyGenerator - Function to generate unique key for client
 */
export const createRateLimit = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100, // 100 requests per window
        message = "Too many requests, please try again later",
        keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    } = options

    return (req, res, next) => {
        try {
            const key = keyGenerator(req)
            const result = rateLimiter.isAllowed(key, max, windowMs)

            // Set rate limit headers
            res.set({
                "X-RateLimit-Limit": max,
                "X-RateLimit-Remaining": result.remaining,
                "X-RateLimit-Reset": new Date(
                    result.resetTime || Date.now() + windowMs
                ).toISOString(),
            })

            if (!result.allowed) {
                return res.status(429).json({
                    success: false,
                    message,
                    error: "RATE_LIMIT_EXCEEDED",
                    retryAfter: Math.ceil(
                        (result.resetTime - Date.now()) / 1000
                    ),
                    timestamp: new Date().toISOString(),
                })
            }

            next()
        } catch (error) {
            console.error("Rate limiter error:", error)
            // If rate limiter fails, allow the request to continue
            next()
        }
    }
}

// Predefined rate limiters for different endpoints
export const authLimiter = createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per 15 minutes
    message: "Too many authentication attempts, please try again later",
    keyGenerator: (req) => `auth:${req.ip}:${req.body.email || "unknown"}`,
})

export const generalLimiter = createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: "Too many requests, please try again later",
})

export const strictLimiter = createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per 15 minutes
    message: "Rate limit exceeded for this operation",
})

export const uploadLimiter = createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: "Upload limit exceeded, please try again later",
})

export default {
    createRateLimit,
    authLimiter,
    generalLimiter,
    strictLimiter,
    uploadLimiter,
}
