import { verifyToken } from "../utils/jwt.js"
import { User } from "../models/index.js"

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            })
        }

        // Extract token
        const token = authHeader.split(" ")[1]

        // Verify token
        const decoded = verifyToken(token)

        // Find user by ID
        const user = await User.findById(decoded.id).select("-password")

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found or token is invalid.",
            })
        }

        // Attach user to request object
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed. Invalid token.",
        })
    }
}

/**
 * Authorization middleware to restrict access based on user role
 * @param {Array} roles - Array of allowed roles
 */
export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            })
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to access this resource.",
            })
        }

        next()
    }
}
