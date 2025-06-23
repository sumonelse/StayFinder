import express from "express"
import adminController from "../controllers/admin.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(authorize(["admin"]))

// Dashboard
router.get("/dashboard", adminController.getDashboardStats)

// Properties management
router.get("/properties", adminController.getProperties)
router.patch("/properties/:id/approval", adminController.updatePropertyApproval)
router.delete("/properties/:id", adminController.deleteProperty)

// Bookings management
router.get("/bookings", adminController.getBookings)

// Users management
router.get("/users", adminController.getUsers)
router.patch("/users/:id/status", adminController.updateUserStatus)

// Reviews management
router.get("/reviews", adminController.getReviews)
router.delete("/reviews/:id", adminController.deleteReview)

export default router
