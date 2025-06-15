import express from "express"
import healthRoutes from "./health.routes.js"

const router = express.Router()

// Health check routes
router.use("/health", healthRoutes)

// Add other routes here as they are developed
// Example: router.use("/users", userRoutes)
// Example: router.use("/properties", propertyRoutes)

export default router
