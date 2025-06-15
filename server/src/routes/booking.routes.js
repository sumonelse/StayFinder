import express from "express"
import bookingController from "../controllers/booking.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { validateBooking, bookingValidators } from "../validators/index.js"

const router = express.Router()

// Public routes
router.get(
    "/availability/:propertyId",
    bookingController.getPropertyAvailability
)

// Protected routes - require authentication
router.post(
    "/",
    authenticate,
    validateBooking(bookingValidators.createBooking),
    bookingController.createBooking
)

router.get("/", authenticate, bookingController.getUserBookings)

router.get(
    "/host",
    authenticate,
    authorize(["host", "admin"]),
    bookingController.getHostBookings
)

router.get("/:id", authenticate, bookingController.getBookingById)

router.patch(
    "/:id/status",
    authenticate,
    validateBooking(bookingValidators.updateBookingStatus),
    bookingController.updateBookingStatus
)

// Admin only routes
router.patch(
    "/:id/payment",
    authenticate,
    authorize(["admin"]),
    validateBooking(bookingValidators.updatePaymentStatus),
    bookingController.updatePaymentStatus
)

export default router
