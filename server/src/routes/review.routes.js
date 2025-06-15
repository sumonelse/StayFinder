import express from "express"
import reviewController from "../controllers/review.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { validateReview, reviewValidators } from "../validators/index.js"

const router = express.Router()

// Public routes
router.get("/property/:propertyId", reviewController.getPropertyReviews)

router.get("/:id", reviewController.getReviewById)

// Protected routes - require authentication
router.post(
    "/",
    authenticate,
    validateReview(reviewValidators.createReview),
    reviewController.createReview
)

router.put(
    "/:id",
    authenticate,
    validateReview(reviewValidators.updateReview),
    reviewController.updateReview
)

router.delete("/:id", authenticate, reviewController.deleteReview)

router.post(
    "/:id/response",
    authenticate,
    authorize(["host", "admin"]),
    validateReview(reviewValidators.respondToReview),
    reviewController.respondToReview
)

router.post(
    "/:id/report",
    authenticate,
    validateReview(reviewValidators.reportReview),
    reviewController.reportReview
)

// Admin only routes
router.get(
    "/moderation",
    authenticate,
    authorize(["admin"]),
    reviewController.getReviewsForModeration
)

router.patch(
    "/:id/moderate",
    authenticate,
    authorize(["admin"]),
    reviewController.moderateReview
)

export default router
