import { User } from "../models/index.js"
import { generateToken } from "../utils/jwt.js"

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
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
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

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
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
        return user
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

        return user
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

        return user
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

        return user.favorites
    }
}

export default new UserService()
