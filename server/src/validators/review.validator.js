import Joi from "joi"

/**
 * Review validation schemas
 */
export const reviewValidators = {
    /**
     * Validate review creation data
     */
    createReview: Joi.object({
        propertyId: Joi.string().required().messages({
            "string.empty": "Property ID is required",
            "any.required": "Property ID is required",
        }),
        bookingId: Joi.string().required().messages({
            "string.empty": "Booking ID is required",
            "any.required": "Booking ID is required",
        }),
        rating: Joi.number().required().min(1).max(5).messages({
            "number.base": "Rating must be a number",
            "number.min": "Rating must be at least 1",
            "number.max": "Rating cannot exceed 5",
            "any.required": "Rating is required",
        }),
        comment: Joi.string().required().trim().min(10).max(1000).messages({
            "string.empty": "Review comment is required",
            "string.min": "Comment must be at least 10 characters long",
            "string.max": "Comment cannot exceed 1000 characters",
            "any.required": "Review comment is required",
        }),
    }),

    /**
     * Validate review update data
     */
    updateReview: Joi.object({
        rating: Joi.number().min(1).max(5).messages({
            "number.base": "Rating must be a number",
            "number.min": "Rating must be at least 1",
            "number.max": "Rating cannot exceed 5",
        }),
        comment: Joi.string().trim().min(10).max(1000).messages({
            "string.min": "Comment must be at least 10 characters long",
            "string.max": "Comment cannot exceed 1000 characters",
        }),
    }),

    /**
     * Validate host response to review
     */
    respondToReview: Joi.object({
        text: Joi.string().required().trim().min(10).max(1000).messages({
            "string.empty": "Response text is required",
            "string.min": "Response must be at least 10 characters long",
            "string.max": "Response cannot exceed 1000 characters",
            "any.required": "Response text is required",
        }),
    }),

    /**
     * Validate review report
     */
    reportReview: Joi.object({
        reason: Joi.string().required().trim().min(10).max(500).messages({
            "string.empty": "Report reason is required",
            "string.min": "Reason must be at least 10 characters long",
            "string.max": "Reason cannot exceed 500 characters",
            "any.required": "Report reason is required",
        }),
    }),
}

/**
 * Middleware to validate request data against a schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
export const validateReview = (schema, property = "body") => {
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
