import express from "express"
import ApiResponse from "../utils/ApiResponse.js"

const router = express.Router()

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get("/", (req, res) => {
    const apiResponse = new ApiResponse(res)

    // Basic health check response
    const healthData = {
        status: "UP",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
    }

    apiResponse.success(healthData, "Server is healthy")
})

export default router
