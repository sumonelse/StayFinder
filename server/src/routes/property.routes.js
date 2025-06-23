import express from "express"
import propertyController from "../controllers/property.controller.js"
import blockedDateController from "../controllers/blockedDate.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { validateProperty, propertyValidators } from "../validators/index.js"

const router = express.Router()

// Public routes
router.get("/", propertyController.getAllProperties)
router.get("/nearby", propertyController.getNearbyProperties)
router.get("/host/:hostId", propertyController.getPropertiesByHost)
router.get("/:id", propertyController.getPropertyById)

// Protected routes - require authentication
router.post(
    "/",
    authenticate,
    authorize(["host", "admin"]),
    validateProperty(propertyValidators.createProperty),
    propertyController.createProperty
)

router.put(
    "/:id",
    authenticate,
    validateProperty(propertyValidators.updateProperty),
    propertyController.updateProperty
)

router.delete("/:id", authenticate, propertyController.deleteProperty)

router.patch(
    "/:id/availability",
    authenticate,
    propertyController.toggleAvailability
)

// Blocked dates routes (host only)
router.post(
    "/:propertyId/blocked-dates",
    authenticate,
    blockedDateController.blockDates
)

router.delete(
    "/:propertyId/blocked-dates",
    authenticate,
    blockedDateController.unblockDates
)

router.get(
    "/:propertyId/blocked-dates",
    authenticate,
    blockedDateController.getBlockedDates
)

// Admin only routes
router.patch(
    "/:id/approve",
    authenticate,
    authorize(["admin"]),
    propertyController.approveProperty
)

export default router
