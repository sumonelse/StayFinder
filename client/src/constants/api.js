/**
 * API URL for backend services
 * Uses environment variable in production or defaults to localhost in development
 */
export const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
