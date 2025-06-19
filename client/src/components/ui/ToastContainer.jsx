import React, { useState, useEffect, useCallback } from "react"
import ReactDOM from "react-dom"
import Toast from "./Toast"

/**
 * ToastContainer component to manage multiple toast notifications
 */
const ToastContainer = () => {
    const [toasts, setToasts] = useState([])

    // Remove a toast by ID
    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, [])

    // Add a new toast
    const addToast = useCallback(({ type, message, duration }) => {
        const id = `toast-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`
        const newToast = { id, type, message, duration }

        setToasts((prevToasts) => [...prevToasts, newToast])

        return id
    }, [])

    // Expose methods globally
    useEffect(() => {
        window.toast = {
            success: (message, duration = 5000) =>
                addToast({ type: "success", message, duration }),
            error: (message, duration = 5000) =>
                addToast({ type: "error", message, duration }),
            warning: (message, duration = 5000) =>
                addToast({ type: "warning", message, duration }),
            info: (message, duration = 5000) =>
                addToast({ type: "info", message, duration }),
            dismiss: (id) => {
                if (id) {
                    removeToast(id)
                } else {
                    setToasts([])
                }
            },
        }

        return () => {
            delete window.toast
        }
    }, [addToast, removeToast])

    // Create portal for toast container
    return ReactDOM.createPortal(
        <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col items-end space-y-3 max-h-screen overflow-hidden pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto w-full max-w-sm"
                >
                    <Toast
                        id={toast.id}
                        type={toast.type}
                        message={toast.message}
                        duration={toast.duration}
                        onClose={removeToast}
                    />
                </div>
            ))}
        </div>,
        document.body
    )
}

export default ToastContainer
