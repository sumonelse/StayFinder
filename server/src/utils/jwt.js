import jwt from "jsonwebtoken"

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object (without password)
 * @returns {String} JWT token
 */
export const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables")
    }

    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d", // Token expires in 7 days
        }
    )
}

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables")
    }

    return jwt.verify(token, process.env.JWT_SECRET)
}
