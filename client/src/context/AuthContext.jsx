import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/api"

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
                const token = localStorage.getItem("token")
                if (token) {
                    const userData = await authService.getCurrentUser()
                    setUser(userData)
                    setIsAuthenticated(true)
                }
            } catch (err) {
                console.error("Auth check failed:", err)
                localStorage.removeItem("token")
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
            localStorage.setItem("token", token)
            setUser(user)
            setIsAuthenticated(true)
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
            localStorage.setItem("token", token)
            setUser(user)
            setIsAuthenticated(true)
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
        localStorage.removeItem("token")
        setUser(null)
        setIsAuthenticated(false)
    }

    // Update user profile
    const updateProfile = async (userData) => {
        setIsLoading(true)
        setError(null)
        try {
            const updatedUser = await authService.updateProfile(userData)
            setUser({ ...user, ...updatedUser })
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
            const updatedUser = await authService.addToFavorites(propertyId)
            setUser({ ...user, favorites: updatedUser.favorites })
            return updatedUser
        } catch (err) {
            setError(err.message || "Failed to add to favorites")
            throw err
        }
    }

    // Remove property from favorites
    const removeFromFavorites = async (propertyId) => {
        try {
            const updatedUser = await authService.removeFromFavorites(
                propertyId
            )
            setUser({ ...user, favorites: updatedUser.favorites })
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
