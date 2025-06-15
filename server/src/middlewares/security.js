import helmet from "helmet"
import cors from "cors"
import express from "express"

/**
 * Configure and return security-related middleware
 * @param {Object} config - Application configuration
 * @returns {Object} Object containing security middleware functions
 */
export const configureSecurity = (config) => {
    return {
        // Helmet middleware for security headers
        helmetMiddleware: helmet(),

        // CORS middleware with configuration
        corsMiddleware: cors({
            origin: config.security.cors.allowedOrigins,
            methods: config.security.cors.allowedMethods,
            allowedHeaders: config.security.cors.allowedHeaders,
            exposedHeaders: config.security.cors.exposedHeaders,
            maxAge: config.security.cors.maxAge,
            credentials: true, // Allow cookies to be sent with requests
        }),

        // JSON body parser with size limits
        jsonParserMiddleware: express.json({
            limit: "1mb", // Limit JSON body size to prevent DoS attacks
        }),

        // URL-encoded parser with size limits
        urlencodedParserMiddleware: express.urlencoded({
            extended: true,
            limit: "1mb", // Limit URL-encoded body size
        }),
    }
}

export default configureSecurity
