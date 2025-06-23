import express from "express"
import healthRoutes from "./health.routes.js"
import authRoutes from "./auth.routes.js"
import propertyRoutes from "./property.routes.js"
import bookingRoutes from "./booking.routes.js"
import reviewRoutes from "./review.routes.js"
import uploadRoutes from "./upload.routes.js"
import adminRoutes from "./admin.routes.js"

const router = express.Router()

// Health check routes
router.use("/health", healthRoutes)

// Authentication routes
router.use("/auth", authRoutes)

// Property routes
router.use("/properties", propertyRoutes)

// Booking routes
router.use("/bookings", bookingRoutes)

// Review routes
router.use("/reviews", reviewRoutes)

// Upload routes
router.use("/uploads", uploadRoutes)

// Admin routes
router.use("/admin", adminRoutes)

export default router
