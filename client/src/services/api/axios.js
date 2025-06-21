import axios from "axios"
import { API_URL } from "../../constants/api"

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
    (config) => {
        // Get encrypted token from localStorage
        const encryptedToken = localStorage.getItem("stayfinder_token")
        if (encryptedToken) {
            try {
                // Decrypt token
                const token = JSON.parse(atob(encryptedToken))
                config.headers.Authorization = `Bearer ${token}`
            } catch (error) {
                console.error("Error decrypting token:", error)
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Something went wrong"

        // Handle token expiration
        if (error.response?.status === 401) {
            // Clear all auth data using the utility function
            localStorage.removeItem("stayfinder_token")
            localStorage.removeItem("stayfinder_user")
            window.location.href = "/login"
        }

        return Promise.reject(new Error(errorMessage))
    }
)

export default api
