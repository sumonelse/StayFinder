import { BlockedDate, Property } from "../models/index.js"

/**
 * Service for managing blocked dates
 */
class BlockedDateService {
    /**
     * Block dates for a property
     * @param {String} propertyId - Property ID
     * @param {Array} dates - Array of dates to block
     * @param {String} reason - Reason for blocking
     * @param {String} note - Optional note
     * @param {String} userId - User ID blocking the dates
     * @returns {Array} Created blocked dates
     */
    async blockDates(
        propertyId,
        dates,
        reason = "unavailable",
        note = "",
        userId
    ) {
        // Validate property exists and user has permission
        const property = await Property.findById(propertyId)
        if (!property) {
            throw new Error("Property not found")
        }

        if (property.host.toString() !== userId.toString()) {
            throw new Error(
                "You don't have permission to block dates for this property"
            )
        }

        // Convert dates to Date objects and validate they're not in the past
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const validDates = dates.map((dateStr) => {
            const date = new Date(dateStr)
            date.setHours(0, 0, 0, 0)

            if (date < today) {
                throw new Error("Cannot block dates in the past")
            }

            return date
        })

        // Create blocked dates (ignore duplicates)
        const blockedDates = []
        for (const date of validDates) {
            try {
                const blockedDate = new BlockedDate({
                    property: propertyId,
                    date,
                    reason,
                    note,
                    blockedBy: userId,
                })

                const saved = await blockedDate.save()
                blockedDates.push(saved)
            } catch (error) {
                // Skip if already blocked (duplicate key error)
                if (error.code !== 11000) {
                    throw error
                }
            }
        }

        return blockedDates
    }

    /**
     * Unblock dates for a property
     * @param {String} propertyId - Property ID
     * @param {Array} dates - Array of dates to unblock
     * @param {String} userId - User ID unblocking the dates
     * @returns {Number} Number of dates unblocked
     */
    async unblockDates(propertyId, dates, userId) {
        // Validate property exists and user has permission
        const property = await Property.findById(propertyId)
        if (!property) {
            throw new Error("Property not found")
        }

        if (property.host.toString() !== userId.toString()) {
            throw new Error(
                "You don't have permission to unblock dates for this property"
            )
        }

        // Convert dates to Date objects
        const datesToUnblock = dates.map((dateStr) => {
            const date = new Date(dateStr)
            date.setHours(0, 0, 0, 0)
            return date
        })

        // Remove blocked dates
        const result = await BlockedDate.deleteMany({
            property: propertyId,
            date: { $in: datesToUnblock },
        })

        return result.deletedCount
    }

    /**
     * Get blocked dates for a property within a date range
     * @param {String} propertyId - Property ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Array} Blocked dates
     */
    async getBlockedDates(propertyId, startDate, endDate) {
        const blockedDates = await BlockedDate.find({
            property: propertyId,
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        }).sort({ date: 1 })

        return blockedDates
    }

    /**
     * Get blocked dates for a property (for calendar display)
     * @param {String} propertyId - Property ID
     * @param {String} year - Year (optional)
     * @param {String} month - Month (optional)
     * @returns {Object} Blocked dates grouped by date
     */
    async getBlockedDatesForCalendar(propertyId, year, month) {
        let startDate, endDate

        if (year && month) {
            startDate = new Date(year, month - 1, 1)
            endDate = new Date(year, month, 0)
        } else if (year) {
            startDate = new Date(year, 0, 1)
            endDate = new Date(year, 11, 31)
        } else {
            // Default to current year
            const currentYear = new Date().getFullYear()
            startDate = new Date(currentYear, 0, 1)
            endDate = new Date(currentYear + 1, 11, 31)
        }

        const blockedDates = await this.getBlockedDates(
            propertyId,
            startDate,
            endDate
        )

        // Convert to object with date strings as keys
        const dateMap = {}
        blockedDates.forEach((blocked) => {
            const dateStr = blocked.date.toISOString().split("T")[0]
            dateMap[dateStr] = {
                reason: blocked.reason,
                note: blocked.note,
                blockedAt: blocked.createdAt,
            }
        })

        return dateMap
    }

    /**
     * Get blocked dates in a specific date range
     * @param {String} propertyId - Property ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Object} Object with date strings as keys and block info as values
     */
    async getBlockedDatesInRange(propertyId, startDate, endDate) {
        try {
            const blockedDates = await this.getBlockedDates(
                propertyId,
                startDate,
                endDate
            )

            // Convert to object with date strings as keys
            const dateMap = {}
            blockedDates.forEach((blocked) => {
                const dateStr = blocked.date.toISOString().split("T")[0]
                dateMap[dateStr] = {
                    reason: blocked.reason,
                    note: blocked.note,
                    blockedAt: blocked.createdAt,
                }
            })

            return dateMap
        } catch (error) {
            console.error("Error getting blocked dates in range:", error)
            return {} // Return empty object on error
        }
    }

    /**
     * Check if specific dates are blocked
     * @param {String} propertyId - Property ID
     * @param {Array} dates - Array of date strings to check
     * @returns {Object} Object with date strings as keys and boolean values
     */
    async checkDatesBlocked(propertyId, dates) {
        const dateObjects = dates.map((dateStr) => {
            const date = new Date(dateStr)
            date.setHours(0, 0, 0, 0)
            return date
        })

        const blockedDates = await BlockedDate.find({
            property: propertyId,
            date: { $in: dateObjects },
        })

        const blockedMap = {}
        dates.forEach((dateStr) => {
            blockedMap[dateStr] = false
        })

        blockedDates.forEach((blocked) => {
            const dateStr = blocked.date.toISOString().split("T")[0]
            blockedMap[dateStr] = true
        })

        return blockedMap
    }
}

const blockedDateService = new BlockedDateService()
export default blockedDateService
