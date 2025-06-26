import { User } from "../models/index.js"
import { generateToken } from "../utils/jwt.js"
import jwt from "jsonwebtoken"
import notificationService from "./notification.service.js"

/**
 * Service for user-related operations
 */
class UserService {
    /**
     * Register a new user
     * @param {Object} userData - User data for registration
     * @returns {Object} User object and token
     */
    async registerUser(userData) {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email })
        if (existingUser) {
            throw new Error("User with this email already exists")
        }

        // Create new user
        const user = new User({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role === "host" ? "host" : "user", // Only allow user or host roles on registration
            phone: userData.phone || "",
            bio: userData.bio || "",
            profilePicture: userData.profilePicture || "",
        })

        await user.save()

        // Generate JWT token
        const token = generateToken(user)

        return {
            user: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                favorites: [], // New users have no favorites
            },
            token,
        }
    }

    /**
     * Login a user
     * @param {String} email - User email
     * @param {String} password - User password
     * @returns {Object} User object and token
     */
    async loginUser(email, password) {
        // Find user by email
        const user = await User.findOne({ email })
        if (!user) {
            throw new Error("Invalid email or password")
        }

        // Check password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            throw new Error("Invalid email or password")
        }

        // Generate JWT token
        const token = generateToken(user)

        // Convert favorites to strings
        const favorites = user.favorites
            ? user.favorites.map((id) => id.toString())
            : []

        return {
            user: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                favorites: favorites,
            },
            token,
        }
    }

    /**
     * Get user profile by ID
     * @param {String} userId - User ID
     * @returns {Object} User object
     */
    async getUserProfile(userId) {
        const user = await User.findById(userId).select("-password")
        if (!user) {
            throw new Error("User not found")
        }

        // Convert the user object to a plain JavaScript object
        const userObj = user.toObject()

        // Convert ObjectIDs in favorites array to strings
        if (userObj.favorites && Array.isArray(userObj.favorites)) {
            userObj.favorites = userObj.favorites.map((id) => id.toString())
        }

        return userObj
    }

    /**
     * Update user profile
     * @param {String} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Object} Updated user object
     */
    async updateUserProfile(userId, updateData) {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                name: updateData.name,
                phone: updateData.phone,
                bio: updateData.bio,
                profilePicture: updateData.profilePicture,
            },
            { new: true, runValidators: true }
        ).select("-password")

        if (!user) {
            throw new Error("User not found")
        }

        return user
    }

    /**
     * Add property to user favorites
     * @param {String} userId - User ID
     * @param {String} propertyId - Property ID
     * @returns {Object} Updated user object
     */
    async addToFavorites(userId, propertyId) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favorites: propertyId } },
            { new: true }
        ).select("-password")

        if (!user) {
            throw new Error("User not found")
        }

        // Convert the user object to a plain JavaScript object
        const userObj = user.toObject()

        // Convert ObjectIDs in favorites array to strings
        if (userObj.favorites && Array.isArray(userObj.favorites)) {
            userObj.favorites = userObj.favorites.map((id) => id.toString())
        }

        return userObj
    }

    /**
     * Remove property from user favorites
     * @param {String} userId - User ID
     * @param {String} propertyId - Property ID
     * @returns {Object} Updated user object
     */
    async removeFromFavorites(userId, propertyId) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { favorites: propertyId } },
            { new: true }
        ).select("-password")

        if (!user) {
            throw new Error("User not found")
        }

        // Convert the user object to a plain JavaScript object
        const userObj = user.toObject()

        // Convert ObjectIDs in favorites array to strings
        if (userObj.favorites && Array.isArray(userObj.favorites)) {
            userObj.favorites = userObj.favorites.map((id) => id.toString())
        }

        return userObj
    }

    /**
     * Get user favorites with property details
     * @param {String} userId - User ID
     * @returns {Array} Array of favorite properties
     */
    async getUserFavorites(userId) {
        const user = await User.findById(userId).select("favorites").populate({
            path: "favorites",
            select: "title type price images address avgRating reviewCount",
        })

        if (!user) {
            throw new Error("User not found")
        }

        // Convert the favorites array to a plain JavaScript array
        const favorites = user.favorites.map((favorite) => {
            const favObj = favorite.toObject()
            // Ensure the _id is a string
            favObj._id = favObj._id.toString()
            return favObj
        })

        return favorites
    }

    /**
     * Send password reset email
     * @param {String} email - User email
     */
    async forgotPassword(email) {
        const user = await User.findOne({ email })
        if (!user) {
            throw new Error("User not found")
        }

        // Check if JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            throw new Error(
                "JWT_SECRET is not defined in environment variables"
            )
        }

        // Generate reset token (expires in 1 hour)
        const resetToken = jwt.sign(
            { userId: user._id, type: "password_reset" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        // Store reset token in user document
        user.passwordResetToken = resetToken
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        await user.save()

        // Send reset email
        await notificationService.sendPasswordReset(
            email,
            user.name,
            resetToken
        )

        return { success: true }
    }

    /**
     * Reset password with token
     * @param {String} token - Reset token
     * @param {String} newPassword - New password
     */
    async resetPassword(token, newPassword) {
        try {
            // Check if JWT_SECRET is defined
            if (!process.env.JWT_SECRET) {
                throw new Error(
                    "JWT_SECRET is not defined in environment variables"
                )
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            if (decoded.type !== "password_reset") {
                throw new Error("Invalid reset token")
            }

            const user = await User.findById(decoded.userId)
            if (!user) {
                throw new Error("User not found")
            }

            // Check if token matches and hasn't expired
            if (
                user.passwordResetToken !== token ||
                user.passwordResetExpires < new Date()
            ) {
                throw new Error("Invalid or expired reset token")
            }

            // Update password and clear reset token
            user.password = newPassword
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            await user.save()

            return { success: true }
        } catch (error) {
            if (
                error.name === "JsonWebTokenError" ||
                error.name === "TokenExpiredError"
            ) {
                throw new Error("Invalid or expired reset token")
            }
            throw error
        }
    }
}

export default new UserService()
