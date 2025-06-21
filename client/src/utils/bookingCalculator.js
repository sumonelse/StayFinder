/**
 * Utility functions for calculating booking prices
 */

/**
 * Calculate the number of nights between two dates
 * @param {Date|string} checkInDate - Check-in date
 * @param {Date|string} checkOutDate - Check-out date
 * @returns {number} Number of nights
 */
export const calculateNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 0

    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)

    // Calculate the difference in milliseconds
    const diffTime = Math.abs(end - start)

    // Convert to days and round up
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calculate the subtotal price based on property price, period, and nights
 * @param {number} price - Property price
 * @param {string} pricePeriod - Price period (night, week, month)
 * @param {number} nights - Number of nights
 * @returns {number} Subtotal price
 */
export const calculateSubtotal = (price, pricePeriod, nights) => {
    if (!price || !nights) return 0

    switch (pricePeriod) {
        case "week":
            return price * Math.ceil(nights / 7)
        case "month":
            return price * Math.ceil(nights / 30)
        case "night":
        default:
            return price * nights
    }
}

/**
 * Calculate service fee based on subtotal
 * @param {number} subtotal - Subtotal price
 * @param {number} customServiceFee - Custom service fee (if provided)
 * @returns {number} Service fee
 */
export const calculateServiceFee = (subtotal, customServiceFee) => {
    if (customServiceFee !== undefined && customServiceFee !== null) {
        return customServiceFee
    }

    // Default service fee is 12% of subtotal
    return Math.round(subtotal * 0.12)
}

/**
 * Calculate total booking price
 * @param {Object} property - Property object with price, pricePeriod, cleaningFee, serviceFee
 * @param {Date|string} checkInDate - Check-in date
 * @param {Date|string} checkOutDate - Check-out date
 * @returns {Object} Booking price details
 */
export const calculateBookingPrice = (property, checkInDate, checkOutDate) => {
    if (!property || !checkInDate || !checkOutDate) {
        return {
            nights: 0,
            subtotal: 0,
            cleaningFee: 0,
            serviceFee: 0,
            total: 0,
        }
    }

    const nights = calculateNights(checkInDate, checkOutDate)
    const subtotal = calculateSubtotal(
        property.price,
        property.pricePeriod,
        nights
    )
    const cleaningFee = property.cleaningFee || 0
    const serviceFee = calculateServiceFee(subtotal, property.serviceFee)
    const total = subtotal + cleaningFee + serviceFee

    return {
        nights,
        subtotal,
        cleaningFee,
        serviceFee,
        total,
        pricePerNight: property.price,
        pricePeriod: property.pricePeriod,
    }
}
