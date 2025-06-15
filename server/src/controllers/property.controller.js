import BaseController from "./base.controller.js"
import { propertyService } from "../services/index.js"

/**
 * Controller for property-related routes
 */
class PropertyController extends BaseController {
    /**
     * Get all properties with filtering, sorting, and pagination
     * @route GET /api/properties
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllProperties(req, res) {
        try {
            const result = await propertyService.getAllProperties(req.query)
            return this.sendSuccess(res, result)
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error fetching properties",
                500
            )
        }
    }

    /**
     * Get a single property by ID
     * @route GET /api/properties/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getPropertyById(req, res) {
        try {
            const property = await propertyService.getPropertyById(
                req.params.id
            )
            return this.sendSuccess(res, { property })
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error fetching property",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Create a new property
     * @route POST /api/properties
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createProperty(req, res) {
        try {
            const property = await propertyService.createProperty(
                req.body,
                req.user._id,
                req.user.role
            )
            return this.sendSuccess(
                res,
                { property },
                "Property created successfully",
                201
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error creating property",
                500
            )
        }
    }

    /**
     * Update a property
     * @route PUT /api/properties/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateProperty(req, res) {
        try {
            const property = await propertyService.updateProperty(
                req.params.id,
                req.body,
                req.user._id,
                req.user.role
            )
            return this.sendSuccess(
                res,
                { property },
                "Property updated successfully"
            )
        } catch (error) {
            if (error.message.includes("permission")) {
                return this.sendError(res, error.message, 403)
            }
            return this.sendError(
                res,
                error.message || "Error updating property",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Delete a property
     * @route DELETE /api/properties/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteProperty(req, res) {
        try {
            await propertyService.deleteProperty(
                req.params.id,
                req.user._id,
                req.user.role
            )
            return this.sendSuccess(res, null, "Property deleted successfully")
        } catch (error) {
            if (error.message.includes("permission")) {
                return this.sendError(res, error.message, 403)
            }
            return this.sendError(
                res,
                error.message || "Error deleting property",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Get properties by host
     * @route GET /api/properties/host/:hostId
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getPropertiesByHost(req, res) {
        try {
            const result = await propertyService.getPropertiesByHost(
                req.params.hostId,
                req.query
            )
            return this.sendSuccess(res, result)
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error fetching host properties",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Toggle property availability
     * @route PATCH /api/properties/:id/availability
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async toggleAvailability(req, res) {
        try {
            const property = await propertyService.toggleAvailability(
                req.params.id,
                req.user._id,
                req.user.role
            )
            return this.sendSuccess(
                res,
                { property },
                `Property is now ${property.isAvailable ? "available" : "unavailable"}`
            )
        } catch (error) {
            if (error.message.includes("permission")) {
                return this.sendError(res, error.message, 403)
            }
            return this.sendError(
                res,
                error.message || "Error toggling property availability",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Approve a property (admin only)
     * @route PATCH /api/properties/:id/approve
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async approveProperty(req, res) {
        try {
            const property = await propertyService.approveProperty(
                req.params.id
            )
            return this.sendSuccess(
                res,
                { property },
                "Property approved successfully"
            )
        } catch (error) {
            return this.sendError(
                res,
                error.message || "Error approving property",
                error.message.includes("not found") ? 404 : 500
            )
        }
    }

    /**
     * Search properties by location (nearby)
     * @route GET /api/properties/nearby
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getNearbyProperties(req, res) {
        try {
            const properties = await propertyService.getNearbyProperties(
                req.query
            )
            return this.sendSuccess(res, { properties })
        } catch (error) {
            if (error.message.includes("required")) {
                return this.sendError(res, error.message, 400)
            }
            return this.sendError(
                res,
                error.message || "Error finding nearby properties",
                500
            )
        }
    }
}

// Create and export a singleton instance
const propertyController = new PropertyController()
export default propertyController
