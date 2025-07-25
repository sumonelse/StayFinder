import Joi from "joi"

/**
 * Property validation schemas
 */
export const propertyValidators = {
    /**
     * Validate property creation data
     */
    createProperty: Joi.object({
        title: Joi.string().required().trim().min(5).max(100).messages({
            "string.empty": "Title is required",
            "string.min": "Title must be at least 5 characters long",
            "string.max": "Title cannot exceed 100 characters",
            "any.required": "Title is required",
        }),
        description: Joi.string().required().trim().min(20).max(4000).messages({
            "string.empty": "Description is required",
            "string.min": "Description must be at least 20 characters long",
            "string.max": "Description cannot exceed 4000 characters",
            "any.required": "Description is required",
        }),
        type: Joi.string()
            .required()
            .valid(
                "apartment",
                "house",
                "condo",
                "villa",
                "cabin",
                "cottage",
                "hotel",
                "other"
            )
            .messages({
                "string.empty": "Property type is required",
                "any.only": "Invalid property type",
                "any.required": "Property type is required",
            }),
        price: Joi.number().required().min(0).messages({
            "number.base": "Price must be a number",
            "number.min": "Price cannot be negative",
            "any.required": "Price is required",
        }),
        pricePeriod: Joi.string()
            .valid("night", "weekly", "monthly")
            .default("night"),
        serviceFee: Joi.number().min(0).default(0).messages({
            "number.base": "Service fee must be a number",
            "number.min": "Service fee cannot be negative",
        }),
        cleaningFee: Joi.number().min(0).default(0).messages({
            "number.base": "Cleaning fee must be a number",
            "number.min": "Cleaning fee cannot be negative",
        }),
        bedrooms: Joi.number().required().min(0).messages({
            "number.base": "Number of bedrooms must be a number",
            "number.min": "Bedrooms cannot be negative",
            "any.required": "Number of bedrooms is required",
        }),
        bathrooms: Joi.number().required().min(0).messages({
            "number.base": "Number of bathrooms must be a number",
            "number.min": "Bathrooms cannot be negative",
            "any.required": "Number of bathrooms is required",
        }),
        maxGuests: Joi.number().required().min(1).messages({
            "number.base": "Maximum guests must be a number",
            "number.min": "Maximum guests must be at least 1",
            "any.required": "Maximum number of guests is required",
        }),
        address: Joi.object({
            street: Joi.string().required().trim().messages({
                "string.empty": "Street address is required",
                "any.required": "Street address is required",
            }),
            city: Joi.string().required().trim().messages({
                "string.empty": "City is required",
                "any.required": "City is required",
            }),
            state: Joi.string().required().trim().messages({
                "string.empty": "State/Province is required",
                "any.required": "State/Province is required",
            }),
            zipCode: Joi.string().required().trim().messages({
                "string.empty": "Zip/Postal code is required",
                "any.required": "Zip/Postal code is required",
            }),
            country: Joi.string().required().trim().messages({
                "string.empty": "Country is required",
                "any.required": "Country is required",
            }),
        }).required(),
        location: Joi.object({
            type: Joi.string().valid("Point").default("Point"),
            coordinates: Joi.array()
                .items(Joi.number())
                .length(2)
                .required()
                .messages({
                    "array.length":
                        "Coordinates must contain exactly 2 values [longitude, latitude]",
                    "any.required": "Coordinates are required",
                }),
        }).required(),
        amenities: Joi.array().items(Joi.string()).default([]),
        images: Joi.array()
            .items(
                Joi.object({
                    url: Joi.string().required().messages({
                        "string.empty": "Image URL is required",
                        "any.required": "Image URL is required",
                    }),
                    caption: Joi.string().allow("").default(""),
                })
            )
            .min(1)
            .required()
            .messages({
                "array.min": "At least one image is required",
                "any.required": "At least one image is required",
            }),
        rules: Joi.object({
            checkIn: Joi.string().required(),
            checkOut: Joi.string().required(),
            smoking: Joi.boolean().default(false),
            pets: Joi.boolean().default(false),
            parties: Joi.boolean().default(false),
            events: Joi.boolean().default(false),
            quietHours: Joi.string().default("10:00 PM - 7:00 AM"),
            additionalRules: Joi.array()
                .items(
                    Joi.object({
                        title: Joi.string().allow(""),
                        description: Joi.string().allow(""),
                    })
                )
                .default([]),
        }).default({
            checkIn: "3:00 PM",
            checkOut: "11:00 AM",
            smoking: false,
            pets: false,
            parties: false,
            events: false,
            quietHours: "10:00 PM - 7:00 AM",
            additionalRules: [],
        }),
        isAvailable: Joi.boolean().default(true),
    }),

    /**
     * Validate property update data
     */
    updateProperty: Joi.object({
        // Allow any fields that might be sent from the client
        // This makes the validator more lenient for updates
        title: Joi.string().trim().min(5).max(100).messages({
            "string.min": "Title must be at least 5 characters long",
            "string.max": "Title cannot exceed 100 characters",
        }),
        description: Joi.string().trim().min(20).max(4000).messages({
            "string.min": "Description must be at least 20 characters long",
            "string.max": "Description cannot exceed 4000 characters",
        }),
        type: Joi.string()
            .valid(
                "apartment",
                "house",
                "condo",
                "villa",
                "cabin",
                "cottage",
                "hotel",
                "other"
            )
            .messages({
                "any.only": "Invalid property type",
            }),
        price: Joi.number().min(0).messages({
            "number.base": "Price must be a number",
            "number.min": "Price cannot be negative",
        }),
        pricePeriod: Joi.string().valid("night", "weekly", "monthly"),
        serviceFee: Joi.number().min(0).messages({
            "number.base": "Service fee must be a number",
            "number.min": "Service fee cannot be negative",
        }),
        cleaningFee: Joi.number().min(0).messages({
            "number.base": "Cleaning fee must be a number",
            "number.min": "Cleaning fee cannot be negative",
        }),
        bedrooms: Joi.number().min(0).messages({
            "number.base": "Number of bedrooms must be a number",
            "number.min": "Bedrooms cannot be negative",
        }),
        bathrooms: Joi.number().min(0).messages({
            "number.base": "Number of bathrooms must be a number",
            "number.min": "Bathrooms cannot be negative",
        }),
        maxGuests: Joi.number().min(1).messages({
            "number.base": "Maximum guests must be a number",
            "number.min": "Maximum guests must be at least 1",
        }),
        address: Joi.object({
            street: Joi.string().trim(),
            city: Joi.string().trim(),
            state: Joi.string().trim(),
            zipCode: Joi.string().trim(),
            country: Joi.string().trim(),
        }),
        location: Joi.object({
            type: Joi.string().valid("Point").default("Point"),
            coordinates: Joi.array().items(Joi.number()).length(2).messages({
                "array.length":
                    "Coordinates must contain exactly 2 values [longitude, latitude]",
            }),
        }),
        amenities: Joi.array().items(Joi.string()),
        images: Joi.array().items(
            Joi.object({
                url: Joi.string().required().messages({
                    "string.empty": "Image URL is required",
                    "any.required": "Image URL is required",
                }),
                caption: Joi.string().allow("").default(""),
            })
        ),
        rules: Joi.object({
            checkIn: Joi.string().allow(null, ""),
            checkOut: Joi.string().allow(null, ""),
            smoking: Joi.boolean().allow(null),
            pets: Joi.boolean().allow(null),
            parties: Joi.boolean().allow(null),
            events: Joi.boolean().allow(null),
            quietHours: Joi.string().allow(null, ""),
            additionalRules: Joi.array()
                .items(
                    Joi.object({
                        title: Joi.string().allow(""),
                        description: Joi.string().allow(""),
                    })
                )
                .allow(null),
        }).allow(null),
        isAvailable: Joi.boolean(),
    }),
}

/**
 * Middleware to validate request data against a schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, params, query)
 * @param {Object} options - Additional validation options
 * @returns {Function} Express middleware function
 */
export const validateProperty = (schema, property = "body", options = {}) => {
    return (req, res, next) => {
        // For update operations, strip unknown fields to prevent read-only field errors
        const validationOptions = {
            abortEarly: false,
            stripUnknown: true,
            ...options,
        }

        const { error, value } = schema.validate(
            req[property],
            validationOptions
        )

        if (!error) {
            // Update the request with the validated and stripped data
            req[property] = value
            return next()
        }

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
