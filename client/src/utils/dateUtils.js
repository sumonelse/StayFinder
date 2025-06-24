/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format a date string or Date object to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @param {string} options.format - Format style ('short', 'medium', 'long', 'custom')
 * @param {Object} options.options - Custom formatting options for toLocaleDateString
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
    if (!date) return ""

    const { format = "medium", options: customOptions = {} } = options

    // Create a new date object and set time to noon to avoid timezone issues
    const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
    dateObj.setHours(12, 0, 0, 0)

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

            case "custom":
                return dateObj.toLocaleDateString("en-US", customOptions)

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
 * @param {string|Date} startDate - Check-in date
 * @param {string|Date} endDate - Check-out date
 * @returns {number} Number of nights between check-in and check-out
 */
export const getDaysBetweenDates = (startDate, endDate) => {
    if (!startDate || !endDate) return 0

    // Parse dates and ensure they're in the correct format (YYYY-MM-DD)
    let start, end

    if (typeof startDate === "string") {
        // If it's a string, parse it as YYYY-MM-DD
        const [startYear, startMonth, startDay] = startDate
            .split("-")
            .map(Number)
        start = new Date(startYear, startMonth - 1, startDay, 12, 0, 0, 0)
    } else {
        // If it's a Date object, create a new one at noon
        start = new Date(startDate)
        start.setHours(12, 0, 0, 0)
    }

    if (typeof endDate === "string") {
        // If it's a string, parse it as YYYY-MM-DD
        const [endYear, endMonth, endDay] = endDate.split("-").map(Number)
        end = new Date(endYear, endMonth - 1, endDay, 12, 0, 0, 0)
    } else {
        // If it's a Date object, create a new one at noon
        end = new Date(endDate)
        end.setHours(12, 0, 0, 0)
    }

    // Calculate the difference in milliseconds
    const diffTime = end.getTime() - start.getTime()

    // Convert to days (1 day = 24 * 60 * 60 * 1000 milliseconds)
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

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
