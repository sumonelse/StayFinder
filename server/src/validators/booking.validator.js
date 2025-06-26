import Joi from "joi"

/**
 * Booking validation schemas
 */
export const bookingValidators = {
    /**
     * Validate booking creation data
     */
    createBooking: Joi.object({
        propertyId: Joi.string().required().messages({
            "string.empty": "Property ID is required",
            "any.required": "Property ID is required",
        }),
        checkInDate: Joi.date()
            .required()
            .custom((value, helpers) => {
                // Create today's date with time set to beginning of day
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                // Create a date from the value with time set to noon to avoid timezone issues
                const checkInDate = new Date(value)
                checkInDate.setHours(12, 0, 0, 0)

                // Compare dates properly
                if (checkInDate < today) {
                    return helpers.error("date.greater")
                }
                return value
            })
            .messages({
                "date.base": "Check-in date must be a valid date",
                "date.greater": "Check-in date cannot be in the past",
                "any.required": "Check-in date is required",
            }),
        checkOutDate: Joi.date()
            .required()
            .greater(Joi.ref("checkInDate"))
            .messages({
                "date.base": "Check-out date must be a valid date",
                "date.greater": "Check-out date must be after check-in date",
                "any.required": "Check-out date is required",
            }),
        numberOfGuests: Joi.number().required().min(1).messages({
            "number.base": "Number of guests must be a number",
            "number.min": "Number of guests must be at least 1",
            "any.required": "Number of guests is required",
        }),
        specialRequests: Joi.string().allow("").max(500).messages({
            "string.max": "Special requests cannot exceed 500 characters",
        }),
        totalPrice: Joi.number().positive().optional().messages({
            "number.base": "Total price must be a number",
            "number.positive": "Total price must be a positive number",
        }),
    }),

    /**
     * Validate booking status update
     */
    updateBookingStatus: Joi.object({
        status: Joi.string()
            .required()
            .valid("confirmed", "cancelled")
            .messages({
                "string.empty": "Status is required",
                "any.only": "Status must be either 'confirmed' or 'cancelled'",
                "any.re quired": "Status is required",
            }),
        reason: Joi.string()
            .allow("")
            .max(500)
            .when("status", {
                is: "cancelled",
                then: Joi.string().required().messages({
                    "string.empty": "Cancellation reason is required",
                    "any.required": "Cancellation reason is required",
                }),
            })
            .messages({
                "string.max": "Reason cannot exceed 500 characters",
            }),
    }),

    /**
     * Validate payment status update
     */
    updatePaymentStatus: Joi.object({
        paymentStatus: Joi.string()
            .required()
            .valid("paid", "refunded", "failed")
            .messages({
                "string.empty": "Payment status is required",
                "any.only":
                    "Payment status must be 'paid', 'refunded', or 'failed'",
                "any.required": "Payment status is required",
            }),
        paymentId: Joi.string().allow(""),
    }),

    /**
     * Validate availability check
     */
    checkAvailability: Joi.object({
        startDate: Joi.date().required().messages({
            "date.base": "Start date must be a valid date",
            "any.required": "Start date is required",
        }),
        endDate: Joi.date().required().greater(Joi.ref("startDate")).messages({
            "date.base": "End date must be a valid date",
            "date.greater": "End date must be after start date",
            "any.required": "End date is required",
        }),
    }),
}

/**
 * Middleware to validate request data against a schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
export const validateBooking = (schema, property = "body") => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false })

        if (!error) return next()

        const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
        }))

        console.log("err", error)
        console.log("body", req.body)

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        })
    }
}
