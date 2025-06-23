import BaseController from "./base.controller.js"
import blockedDateService from "../services/blockedDate.service.js"

/**
 * Controller for blocked date management
 */
class BlockedDateController extends BaseController {
    /**
     * Block dates for a property
     * @route POST /api/properties/:propertyId/blocked-dates
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async blockDates(req, res) {
        try {
            const { propertyId } = req.params
            const { dates, reason, note } = req.body
            const userId = req.user._id

            if (!dates || !Array.isArray(dates) || dates.length === 0) {
                return this.sendError(res, "Dates array is required", 400)
            }

            const blockedDates = await blockedDateService.blockDates(
                propertyId,
                dates,
                reason,
                note,
                userId
            )

            return this.sendSuccess(
                res,
                { blockedDates },
                `${blockedDates.length} date(s) blocked successfully`
            )
        } catch (error) {
            if (error.message.includes("permission")) {
                return this.sendError(res, error.message, 403)
            }
            if (error.message.includes("not found")) {
                return this.sendError(res, error.message, 404)
            }
            return this.sendError(res, error.message, 400)
        }
    }

    /**
     * Unblock dates for a property
     * @route DELETE /api/properties/:propertyId/blocked-dates
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async unblockDates(req, res) {
        try {
            const { propertyId } = req.params
            const { dates } = req.body
            const userId = req.user._id

            if (!dates || !Array.isArray(dates) || dates.length === 0) {
                return this.sendError(res, "Dates array is required", 400)
            }

            const unblocked = await blockedDateService.unblockDates(
                propertyId,
                dates,
                userId
            )

            return this.sendSuccess(
                res,
                { unblocked },
                `${unblocked} date(s) unblocked successfully`
            )
        } catch (error) {
            if (error.message.includes("permission")) {
                return this.sendError(res, error.message, 403)
            }
            if (error.message.includes("not found")) {
                return this.sendError(res, error.message, 404)
            }
            return this.sendError(res, error.message, 400)
        }
    }

    /**
     * Get blocked dates for a property
     * @route GET /api/properties/:propertyId/blocked-dates
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getBlockedDates(req, res) {
        try {
            const { propertyId } = req.params
            const { year, month } = req.query

            const blockedDates =
                await blockedDateService.getBlockedDatesForCalendar(
                    propertyId,
                    year,
                    month
                )

            return this.sendSuccess(res, { blockedDates })
        } catch (error) {
            return this.sendError(res, error.message, 400)
        }
    }
}

// Create and export a singleton instance
const blockedDateController = new BlockedDateController()

// Bind all methods to the instance to preserve 'this' context
Object.getOwnPropertyNames(BlockedDateController.prototype)
    .filter((method) => method !== "constructor")
    .forEach((method) => {
        blockedDateController[method] = blockedDateController[method].bind(
            blockedDateController
        )
    })

export default blockedDateController
