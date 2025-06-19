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
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
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
            localStorage.removeItem("token")
            window.location.href = "/login"
        }

        return Promise.reject(new Error(errorMessage))
    }
)

export default api
