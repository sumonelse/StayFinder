import { Property, User } from "../models/index.js"

/**
 * Service for property-related operations
 */
class PropertyService {
    /**
     * Get all properties with filtering, sorting, and pagination
     * @param {Object} queryParams - Query parameters for filtering and pagination
     * @returns {Object} Properties and pagination info
     */
    async getAllProperties(queryParams) {
        const {
            page = 1,
            limit = 10,
            sort = "-createdAt",
            type,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            maxGuests,
            city,
            country,
            amenities,
            isAvailable,
            isApproved,
            host,
            search,
        } = queryParams

        // Build filter object
        const filter = {}

        // Apply filters if provided
        if (type) filter.type = type
        if (minPrice) filter.price = { $gte: Number(minPrice) }
        if (maxPrice) {
            filter.price = { ...filter.price, $lte: Number(maxPrice) }
        }
        if (bedrooms) filter.bedrooms = Number(bedrooms)
        if (bathrooms) filter.bathrooms = Number(bathrooms)
        if (maxGuests) filter.maxGuests = { $gte: Number(maxGuests) }
        if (city) filter["address.city"] = { $regex: city, $options: "i" }
        if (country)
            filter["address.country"] = { $regex: country, $options: "i" }
        if (amenities) {
            const amenitiesList = amenities.split(",")
            filter.amenities = { $all: amenitiesList }
        }
        if (isAvailable !== undefined)
            filter.isAvailable = isAvailable === "true"
        if (isApproved !== undefined) filter.isApproved = isApproved === "true"
        if (host) filter.host = host

        // Text search
        if (search) {
            filter.$text = { $search: search }
        }

        // Count total documents
        const total = await Property.countDocuments(filter)

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit)

        // Get properties
        const properties = await Property.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate("host", "name email profilePicture")

        return {
            properties,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        }
    }

    /**
     * Get a single property by ID
     * @param {String} propertyId - Property ID
     * @returns {Object} Property object
     */
    async getPropertyById(propertyId) {
        const property = await Property.findById(propertyId).populate(
            "host",
            "name email profilePicture bio"
        )

        if (!property) {
            throw new Error("Property not found")
        }

        return property
    }

    /**
     * Create a new property
     * @param {Object} propertyData - Property data
     * @param {String} hostId - Host user ID
     * @param {String} hostRole - Host user role
     * @returns {Object} Created property
     */
    async createProperty(propertyData, hostId, hostRole) {
        // Create property
        const property = new Property({
            ...propertyData,
            host: hostId,
            isApproved: hostRole === "admin", // Auto-approve if admin
        })

        await property.save()
        return property
    }

    /**
     * Update a property
     * @param {String} propertyId - Property ID
     * @param {Object} updateData - Data to update
     * @param {String} userId - User ID making the request
     * @param {String} userRole - User role
     * @returns {Object} Updated property
     */
    async updateProperty(propertyId, updateData, userId, userRole) {
        const property = await Property.findById(propertyId)

        if (!property) {
            throw new Error("Property not found")
        }

        // Check if user is the host or an admin
        if (
            property.host.toString() !== userId.toString() &&
            userRole !== "admin"
        ) {
            throw new Error("You don't have permission to update this property")
        }

        // Update property
        const updatedProperty = await Property.findByIdAndUpdate(
            propertyId,
            updateData,
            { new: true, runValidators: true }
        )

        return updatedProperty
    }

    /**
     * Delete a property
     * @param {String} propertyId - Property ID
     * @param {String} userId - User ID making the request
     * @param {String} userRole - User role
     */
    async deleteProperty(propertyId, userId, userRole) {
        const property = await Property.findById(propertyId)

        if (!property) {
            throw new Error("Property not found")
        }

        // Check if user is the host or an admin
        if (
            property.host.toString() !== userId.toString() &&
            userRole !== "admin"
        ) {
            throw new Error("You don't have permission to delete this property")
        }

        await Property.findByIdAndDelete(propertyId)
        return { success: true }
    }

    /**
     * Get properties by host
     * @param {String} hostId - Host user ID
     * @param {Object} queryParams - Query parameters for pagination
     * @returns {Object} Properties and host info
     */
    async getPropertiesByHost(hostId, queryParams) {
        const { page = 1, limit = 10, sort = "-createdAt" } = queryParams

        // Verify host exists
        const host = await User.findById(hostId)
        if (!host) {
            throw new Error("Host not found")
        }

        // Count total documents
        const total = await Property.countDocuments({ host: hostId })

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit)

        // Get properties
        const properties = await Property.find({ host: hostId })
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))

        return {
            properties,
            host: {
                id: host._id,
                name: host.name,
                profilePicture: host.profilePicture,
            },
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        }
    }

    /**
     * Toggle property availability
     * @param {String} propertyId - Property ID
     * @param {String} userId - User ID making the request
     * @param {String} userRole - User role
     * @returns {Object} Updated property
     */
    async toggleAvailability(propertyId, userId, userRole) {
        const property = await Property.findById(propertyId)

        if (!property) {
            throw new Error("Property not found")
        }

        // Check if user is the host or an admin
        if (
            property.host.toString() !== userId.toString() &&
            userRole !== "admin"
        ) {
            throw new Error("You don't have permission to update this property")
        }

        // Toggle availability
        property.isAvailable = !property.isAvailable
        await property.save()

        return property
    }

    /**
     * Approve a property (admin only)
     * @param {String} propertyId - Property ID
     * @returns {Object} Updated property
     */
    async approveProperty(propertyId) {
        const property = await Property.findById(propertyId)

        if (!property) {
            throw new Error("Property not found")
        }

        // Update approval status
        property.isApproved = true
        await property.save()

        return property
    }

    /**
     * Search properties by location (nearby)
     * @param {Object} locationParams - Location parameters
     * @returns {Array} Nearby properties
     */
    async getNearbyProperties(locationParams) {
        const { lat, lng, distance = 10, limit = 10 } = locationParams

        if (!lat || !lng) {
            throw new Error("Latitude and longitude are required")
        }

        // Find properties within the specified distance (in kilometers)
        const properties = await Property.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: parseFloat(distance) * 1000, // Convert to meters
                },
            },
            isAvailable: true,
            isApproved: true,
        })
            .limit(Number(limit))
            .populate("host", "name profilePicture")

        return properties
    }

    /**
     * Update property rating after a review
     * @param {String} propertyId - Property ID
     */
    async updatePropertyRating(propertyId) {
        const property = await Property.findById(propertyId)
        if (!property) {
            throw new Error("Property not found")
        }

        // This would typically be calculated from the Review model
        // For now, we'll just update the property to show the method
        // In a real implementation, you would aggregate reviews for this property

        // Example of how this might be implemented:
        // const result = await Review.aggregate([
        //     { $match: { property: mongoose.Types.ObjectId(propertyId), isApproved: true } },
        //     { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        // ]);

        // const avgRating = result.length > 0 ? result[0].avgRating : 0;
        // const reviewCount = result.length > 0 ? result[0].count : 0;

        // await Property.findByIdAndUpdate(propertyId, { avgRating, reviewCount });

        return property
    }
}

export default new PropertyService()
