import express from "express"
import authController from "../controllers/auth.controller.js"
import { authenticate } from "../middlewares/auth.js"
import { validateUser, userValidators } from "../validators/index.js"
import {
    authLimiter,
    generalLimiter,
} from "../middlewares/rateLimit.middleware.js"

const router = express.Router()

// Public routes
router.post(
    "/register",
    authLimiter,
    validateUser(userValidators.register),
    authController.register
)

router.post(
    "/login",
    authLimiter,
    validateUser(userValidators.login),
    authController.login
)

// Password reset routes
router.post(
    "/forgot-password",
    authLimiter,
    validateUser(userValidators.forgotPassword),
    authController.forgotPassword
)
router.post(
    "/reset-password",
    authLimiter,
    validateUser(userValidators.resetPassword),
    authController.resetPassword
)

// Protected routes
router.get("/me", authenticate, generalLimiter, authController.getProfile)

router.put(
    "/me",
    authenticate,
    generalLimiter,
    validateUser(userValidators.updateProfile),
    authController.updateProfile
)

// Favorites routes
router.get(
    "/favorites",
    authenticate,
    generalLimiter,
    authController.getFavorites
)

router.post(
    "/favorites/:propertyId",
    authenticate,
    generalLimiter,
    authController.addToFavorites
)

router.delete(
    "/favorites/:propertyId",
    authenticate,
    generalLimiter,
    authController.removeFromFavorites
)

export default router
