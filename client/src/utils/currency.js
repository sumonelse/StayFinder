/**
 * Currency formatting utilities
 */

/**
 * Format price with Indian Rupee currency
 * @param {number} price - The price to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, options = {}) => {
    const defaultOptions = {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...options,
    }

    return new Intl.NumberFormat("en-IN", defaultOptions).format(price)
}

/**
 * Format price range for display
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {string} Formatted price range
 */
export const formatPriceRange = (minPrice, maxPrice) => {
    const min = minPrice ? formatPrice(minPrice) : "₹0"
    const max = maxPrice ? formatPrice(maxPrice) : "Any"
    return `${min} - ${max}`
}

/**
 * Get currency symbol
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = () => "₹"

/**
 * Get currency code
 * @returns {string} Currency code
 */
export const getCurrencyCode = () => "INR"

/**
 * Get locale for currency formatting
 * @returns {string} Locale string
 */
export const getCurrencyLocale = () => "en-IN"
