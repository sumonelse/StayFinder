/**
 * Authentication utilities for secure token handling
 */

const TOKEN_KEY = "stayfinder_token"
const USER_KEY = "stayfinder_user"

/**
 * Encrypt data before storing (basic implementation)
 * In production, use a proper encryption library
 */
const encrypt = (data) => {
    try {
        return btoa(JSON.stringify(data))
    } catch (error) {
        console.error("Error encrypting data:", error)
        return null
    }
}

/**
 * Decrypt data after retrieving
 */
const decrypt = (encryptedData) => {
    try {
        return JSON.parse(atob(encryptedData))
    } catch (error) {
        console.error("Error decrypting data:", error)
        return null
    }
}

/**
 * Store authentication token securely
 */
export const setAuthToken = (token) => {
    if (token) {
        const encryptedToken = encrypt(token)
        localStorage.setItem(TOKEN_KEY, encryptedToken)
    } else {
        localStorage.removeItem(TOKEN_KEY)
    }
}

/**
 * Get authentication token
 */
export const getAuthToken = () => {
    const encryptedToken = localStorage.getItem(TOKEN_KEY)
    if (encryptedToken) {
        return decrypt(encryptedToken)
    }
    return null
}

/**
 * Store user data
 */
export const setUserData = (userData) => {
    if (userData) {
        // Ensure favorites is an array
        if (!userData.favorites) {
            userData = { ...userData, favorites: [] }
        } else if (!Array.isArray(userData.favorites)) {
            userData = { ...userData, favorites: [] }
        }

        const encryptedData = encrypt(userData)
        localStorage.setItem(USER_KEY, encryptedData)
    } else {
        localStorage.removeItem(USER_KEY)
    }
}

/**
 * Get user data
 */
export const getUserData = () => {
    const encryptedData = localStorage.getItem(USER_KEY)
    if (encryptedData) {
        const userData = decrypt(encryptedData)

        // Ensure favorites is an array
        if (userData && !userData.favorites) {
            userData.favorites = []
        } else if (userData && !Array.isArray(userData.favorites)) {
            userData.favorites = []
        }

        return userData
    }
    return null
}

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
    if (!token) return true

    try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const currentTime = Date.now() / 1000
        return payload.exp < currentTime
    } catch {
        return true
    }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    const token = getAuthToken()
    return token && !isTokenExpired(token)
}

/**
 * Get token expiry time
 */
export const getTokenExpiry = (token) => {
    if (!token) return null

    try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        return new Date(payload.exp * 1000)
    } catch {
        return null
    }
}

/**
 * Auto-refresh token before expiry
 */
export const setupTokenRefresh = (refreshCallback) => {
    const token = getAuthToken()
    if (!token) return

    const expiry = getTokenExpiry(token)
    if (!expiry) return

    const now = new Date()
    const timeUntilExpiry = expiry.getTime() - now.getTime()

    // Refresh 5 minutes before expiry
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0)

    if (refreshTime > 0) {
        setTimeout(() => {
            if (refreshCallback) {
                refreshCallback()
            }
        }, refreshTime)
    }
}
