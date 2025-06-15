import Joi from "joi"

/**
 * User validation schemas
 */
export const userValidators = {
    /**
     * Validate user registration data
     */
    register: Joi.object({
        name: Joi.string().required().trim().min(2).max(50).messages({
            "string.empty": "Name is required",
            "string.min": "Name must be at least 2 characters long",
            "string.max": "Name cannot exceed 50 characters",
            "any.required": "Name is required",
        }),
        email: Joi.string().required().email().trim().lowercase().messages({
            "string.empty": "Email is required",
            "string.email": "Please enter a valid email address",
            "any.required": "Email is required",
        }),
        password: Joi.string().required().min(8).max(30).messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 30 characters",
            "any.required": "Password is required",
        }),
        role: Joi.string().valid("user", "host").default("user"),
        phone: Joi.string().allow("").trim(),
        profilePicture: Joi.string().allow(""),
        bio: Joi.string().allow("").max(500).messages({
            "string.max": "Bio cannot exceed 500 characters",
        }),
    }),

    /**
     * Validate user login data
     */
    login: Joi.object({
        email: Joi.string().required().email().trim().lowercase().messages({
            "string.empty": "Email is required",
            "string.email": "Please enter a valid email address",
            "any.required": "Email is required",
        }),
        password: Joi.string().required().messages({
            "string.empty": "Password is required",
            "any.required": "Password is required",
        }),
    }),

    /**
     * Validate user profile update data
     */
    updateProfile: Joi.object({
        name: Joi.string().trim().min(2).max(50).messages({
            "string.min": "Name must be at least 2 characters long",
            "string.max": "Name cannot exceed 50 characters",
        }),
        phone: Joi.string().allow("").trim(),
        bio: Joi.string().allow("").max(500).messages({
            "string.max": "Bio cannot exceed 500 characters",
        }),
        profilePicture: Joi.string().allow(""),
    }),
}

/**
 * Middleware to validate request data against a schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
export const validateUser = (schema, property = "body") => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false })

        if (!error) return next()

        const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
        }))

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        })
    }
}
