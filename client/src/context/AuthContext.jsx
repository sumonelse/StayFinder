import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/api"
import {
    setAuthToken,
    getAuthToken,
    setUserData,
    getUserData,
    clearAuthData,
    isAuthenticated as checkIsAuthenticated,
    setupTokenRefresh,
} from "../utils/auth"

// Create the auth context
const AuthContext = createContext(null)

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            setIsLoading(true)
            try {
                const token = getAuthToken()
                const userData = getUserData()

                console.log("Auth check - token:", token ? "exists" : "none")
                console.log("Auth check - userData:", userData)

                if (token && checkIsAuthenticated()) {
                    // Token exists and is valid
                    if (userData) {
                        console.log("Setting user from localStorage:", userData)
                        console.log(
                            "User favorites from localStorage:",
                            userData.favorites
                        )

                        // Ensure user has a favorites array
                        if (!userData.favorites) {
                            userData.favorites = []
                            console.log(
                                "Added missing favorites array to user data"
                            )
                        }

                        setUser(userData)
                        setIsAuthenticated(true)

                        // Setup automatic token refresh
                        setupTokenRefresh(async () => {
                            try {
                                const refreshedData =
                                    await authService.getCurrentUser()
                                console.log(
                                    "Refreshed user data:",
                                    refreshedData
                                )
                                console.log(
                                    "Refreshed favorites:",
                                    refreshedData.favorites
                                )
                                setUser(refreshedData)
                                // Also update localStorage
                                setUserData(refreshedData)
                            } catch (error) {
                                logout()
                            }
                        })
                    } else {
                        // Token exists but no user data, fetch from server
                        const freshUserData = await authService.getCurrentUser()
                        console.log(
                            "Fetched fresh user data from server:",
                            freshUserData
                        )
                        console.log(
                            "Fresh user favorites:",
                            freshUserData.favorites
                        )
                        setUser(freshUserData)
                        setUserData(freshUserData)
                        setIsAuthenticated(true)
                    }
                } else {
                    // No token or expired token
                    clearAuthData()
                    setUser(null)
                    setIsAuthenticated(false)
                }
            } catch (err) {
                clearAuthData()
                setUser(null)
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuthStatus()
    }, [])

    // Login function
    const login = async (email, password) => {
        setIsLoading(true)
        setError(null)
        try {
            const { user, token } = await authService.login(email, password)

            setAuthToken(token)
            setUserData(user)
            setUser(user)
            setIsAuthenticated(true)

            // Setup automatic token refresh
            setupTokenRefresh(async () => {
                try {
                    const refreshedData = await authService.getCurrentUser()
                    setUser(refreshedData)
                    setUserData(refreshedData)
                } catch (error) {
                    logout()
                }
            })
            return user
        } catch (err) {
            setError(err.message || "Login failed")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Register function
    const register = async (userData) => {
        setIsLoading(true)
        setError(null)
        try {
            const { user, token } = await authService.register(userData)

            setAuthToken(token)
            setUserData(user)
            setUser(user)
            setIsAuthenticated(true)

            // Setup automatic token refresh
            setupTokenRefresh(async () => {
                try {
                    const refreshedData = await authService.getCurrentUser()
                    setUser(refreshedData)
                    setUserData(refreshedData)
                } catch (error) {
                    logout()
                }
            })
            return user
        } catch (err) {
            setError(err.message || "Registration failed")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Logout function
    const logout = () => {
        clearAuthData()
        setUser(null)
        setIsAuthenticated(false)
        setError(null)
    }

    // Update user profile
    const updateProfile = async (userData) => {
        setIsLoading(true)
        setError(null)
        try {
            const updatedUser = await authService.updateProfile(userData)

            const newUserData = {
                ...user,
                ...updatedUser,
            }

            setUser(newUserData)
            setUserData(newUserData)
            return updatedUser
        } catch (err) {
            setError(err.message || "Profile update failed")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Add property to favorites
    const addToFavorites = async (propertyId) => {
        try {
            console.log("Adding to favorites:", propertyId)
            const updatedUser = await authService.addToFavorites(propertyId)
            console.log("Updated user from server:", updatedUser)
            const newUserData = { ...user, favorites: updatedUser.favorites }
            console.log("New user data:", newUserData)
            setUser(newUserData)
            // Also update the user data in localStorage
            setUserData(newUserData)
            return updatedUser
        } catch (err) {
            setError(err.message || "Failed to add to favorites")
            throw err
        }
    }

    // Remove property from favorites
    const removeFromFavorites = async (propertyId) => {
        try {
            console.log("Removing from favorites:", propertyId)
            const updatedUser = await authService.removeFromFavorites(
                propertyId
            )
            console.log("Updated user from server:", updatedUser)
            const newUserData = { ...user, favorites: updatedUser.favorites }
            console.log("New user data:", newUserData)
            setUser(newUserData)
            // Also update the user data in localStorage
            setUserData(newUserData)
            return updatedUser
        } catch (err) {
            setError(err.message || "Failed to remove from favorites")
            throw err
        }
    }

    // Get user favorites
    const getFavorites = async () => {
        try {
            return await authService.getFavorites()
        } catch (err) {
            setError(err.message || "Failed to get favorites")
            throw err
        }
    }

    // Context value
    const value = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        addToFavorites,
        removeFromFavorites,
        getFavorites,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
