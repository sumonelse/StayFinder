import { config as conf } from "dotenv"
conf()

// Validate required environment variables
const requiredEnvVars = ["DB_URI", "FRONTEND_DOMAIN"]
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
    console.error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
    )
    process.exit(1)
}

const _config = {
    port: process.env.PORT || 5500,
    dbURL: process.env.DB_URI,
    env: process.env.NODE_ENV || "development",
    frontendDomain: process.env.FRONTEND_DOMAIN,

    // Rate limiting configuration (adjust for production)
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: process.env.NODE_ENV === "production" ? 60 : 1000, // Lower limit in production
    },

    // Security configuration
    security: {
        // Cookie settings
        cookie: {
            secure: process.env.NODE_ENV === "production", // Only send cookies over HTTPS in production
            httpOnly: true, // Prevent client-side JavaScript from accessing cookies
            sameSite: "strict", // Prevent CSRF attacks
        },

        // CORS settings (additional to what's in app.js)
        cors: {
            allowedOrigins: [process.env.FRONTEND_DOMAIN],
            allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            allowedHeaders: ["Content-Type", "Authorization"],
            exposedHeaders: ["Content-Length", "X-Rate-Limit"],
            maxAge: 86400, // 24 hours in seconds
        },
    },
}

export const config = Object.freeze(_config)
