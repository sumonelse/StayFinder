import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 * Can also check for specific roles
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    // Show loading state while checking authentication
    if (isLoading) {
        return <div className="flex justify-center p-8">Loading...</div>
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return (
            <Navigate to="/login" state={{ from: location.pathname }} replace />
        )
    }

    // Check for required role if specified
    if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
        return <Navigate to="/" replace />
    }

    // Render the protected component
    return children
}

export default ProtectedRoute
