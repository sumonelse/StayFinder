/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format a date string or Date object to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @param {string} options.format - Format style ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
    if (!date) return ""

    const { format = "medium" } = options
    const dateObj = typeof date === "string" ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
        console.error("Invalid date provided to formatDate:", date)
        return ""
    }

    try {
        switch (format) {
            case "short":
                return dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                })

            case "long":
                return dateObj.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    weekday: "long",
                })

            case "medium":
            default:
                return dateObj.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                })
        }
    } catch (error) {
        console.error("Error formatting date:", error)
        return ""
    }
}

/**
 * Get the difference between two dates in days
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} Number of days between dates
 */
export const getDaysBetweenDates = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Reset hours to avoid time zone issues
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
}

/**
 * Check if a date is in the past
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)

    return checkDate < today
}
