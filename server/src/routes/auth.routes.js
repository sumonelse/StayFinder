import express from "express"
import authController from "../controllers/auth.controller.js"
import { authenticate } from "../middlewares/auth.js"
import { validateUser, userValidators } from "../validators/index.js"

const router = express.Router()

// Public routes
router.post(
    "/register",
    validateUser(userValidators.register),
    authController.register
)

router.post("/login", validateUser(userValidators.login), authController.login)

// Protected routes
router.get("/me", authenticate, authController.getProfile)

router.put(
    "/me",
    authenticate,
    validateUser(userValidators.updateProfile),
    authController.updateProfile
)

// Favorites routes
router.get("/favorites", authenticate, authController.getFavorites)

router.post(
    "/favorites/:propertyId",
    authenticate,
    authController.addToFavorites
)

router.delete(
    "/favorites/:propertyId",
    authenticate,
    authController.removeFromFavorites
)

export default router
