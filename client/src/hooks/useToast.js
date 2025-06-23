import { useState, useCallback } from "react"

/**
 * Custom hook for managing toast notifications
 */
export const useToast = () => {
    const [toasts, setToasts] = useState([])

    // Add a new toast
    const addToast = useCallback((message, type = "info", duration = 5000) => {
        const id = `toast-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`
        const newToast = {
            id,
            message,
            type,
            duration,
            timestamp: Date.now(),
        }

        setToasts((prevToasts) => [...prevToasts, newToast])

        // Auto-remove toast after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }, [])

    // Remove a specific toast
    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, [])

    // Clear all toasts
    const clearToasts = useCallback(() => {
        setToasts([])
    }, [])

    // Convenience methods for different toast types
    const success = useCallback(
        (message, duration) => addToast(message, "success", duration),
        [addToast]
    )
    const error = useCallback(
        (message, duration) => addToast(message, "error", duration),
        [addToast]
    )
    const warning = useCallback(
        (message, duration) => addToast(message, "warning", duration),
        [addToast]
    )
    const info = useCallback(
        (message, duration) => addToast(message, "info", duration),
        [addToast]
    )

    return {
        toasts,
        addToast,
        removeToast,
        clearToasts,
        success,
        error,
        warning,
        info,
    }
}
