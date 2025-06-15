import BaseController from "./base.controller.js"
import { userService } from "../services/index.js"

/**
 * Controller for authentication-related routes
 */
class AuthController extends BaseController {
    /**
     * Register a new user
     * @route POST /api/auth/register
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async register(req, res) {
        try {
            const userData = req.body
            const result = await userService.registerUser(userData)

            return this.sendSuccess(
                res,
                result,
                "User registered successfully",
                201
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error registering user",
                error.message.includes("exists") ? 400 : 500
            )
        }
    }

    /**
     * Login user
     * @route POST /api/auth/login
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async login(req, res) {
        try {
            const { email, password } = req.body
            const result = await userService.loginUser(email, password)

            return this.sendSuccess(res, result, "Login successful")
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error logging in",
                error.message.includes("Invalid") ? 401 : 500
            )
        }
    }

    /**
     * Get current user profile
     * @route GET /api/auth/me
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getProfile(req, res) {
        try {
            const user = await userService.getUserProfile(req.user._id)
            return this.sendSuccess(res, { user })
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error fetching user profile",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Update user profile
     * @route PUT /api/auth/me
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateProfile(req, res) {
        try {
            const updateData = req.body
            const user = await userService.updateUserProfile(
                req.user._id,
                updateData
            )

            return this.sendSuccess(
                res,
                { user },
                "Profile updated successfully"
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error updating profile",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Add property to favorites
     * @route POST /api/auth/favorites/:propertyId
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async addToFavorites(req, res) {
        try {
            const { propertyId } = req.params
            const user = await userService.addToFavorites(
                req.user._id,
                propertyId
            )

            return this.sendSuccess(
                res,
                { user },
                "Property added to favorites"
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error adding property to favorites",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Remove property from favorites
     * @route DELETE /api/auth/favorites/:propertyId
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async removeFromFavorites(req, res) {
        try {
            const { propertyId } = req.params
            const user = await userService.removeFromFavorites(
                req.user._id,
                propertyId
            )

            return this.sendSuccess(
                res,
                { user },
                "Property removed from favorites"
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error removing property from favorites",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Get user favorites
     * @route GET /api/auth/favorites
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getFavorites(req, res) {
        try {
            const favorites = await userService.getUserFavorites(req.user._id)

            return this.sendSuccess(res, { favorites })
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error fetching favorites",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }
}

// Create and export a singleton instance
const authController = new AuthController()
export default authController
