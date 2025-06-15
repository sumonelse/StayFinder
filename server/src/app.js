// Import necessary modules
import express from "express"
import compression from "compression"
import { config } from "./config/config.js"
import routes from "./routes/index.js"
import errorHandler from "./middlewares/errorHandler.js"
import configureLogger from "./middlewares/logger.js"
import { configureSecurity } from "./middlewares/security.js"
import homeController from "./controllers/home.controller.js"

/**
 * Express application setup
 * Configures middleware, routes, and error handling
 */
const setupApp = () => {
    const app = express()

    // Configure security middleware
    const {
        helmetMiddleware,
        corsMiddleware,
        jsonParserMiddleware,
        urlencodedParserMiddleware,
    } = configureSecurity(config)

    // Trust proxy if behind a reverse proxy (like Nginx)
    if (config.env === "production") {
        app.set("trust proxy", 1)
    }

    // Apply security middleware
    app.use(helmetMiddleware)
    app.use(corsMiddleware)

    // Apply request parsing middleware
    app.use(jsonParserMiddleware)
    app.use(urlencodedParserMiddleware)

    // Apply compression middleware
    app.use(compression())

    // Configure and apply logging middleware
    app.use(configureLogger(config.env))

    // Apply routes
    app.use("/api", routes)

    // Root route for basic server check
    app.get("/", homeController.getServerInfo.bind(homeController))

    // 404 handler for undefined routes
    app.use("*", homeController.notFound.bind(homeController))

    // Error handling middleware (must be last)
    app.use(errorHandler)

    return app
}

// Create and export the configured Express app
const app = setupApp()
export default app
