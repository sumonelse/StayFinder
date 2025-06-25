import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import {
    FaCheckCircle,
    FaExclamationCircle,
    FaInfoCircle,
    FaTimes,
} from "react-icons/fa"
import { MdWarning } from "react-icons/md"

/**
 * Toast notification component
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the toast
 * @param {string} [props.type='info'] - Toast type (success, error, warning, info)
 * @param {string} props.message - Toast message
 * @param {number} [props.duration=5000] - Duration in milliseconds before auto-dismiss
 * @param {Function} props.onClose - Function to call when toast is closed
 */
const Toast = ({ id, type = "info", message, duration = 5000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true)
    const [progress, setProgress] = useState(100)
    const [isPaused, setIsPaused] = useState(false)

    // Auto-dismiss timer
    useEffect(() => {
        if (!isVisible || isPaused) return

        const startTime = Date.now()
        const endTime = startTime + duration

        const timer = setInterval(() => {
            const now = Date.now()
            const remaining = endTime - now
            const newProgress = (remaining / duration) * 100

            if (remaining <= 0) {
                clearInterval(timer)
                handleClose()
            } else {
                setProgress(newProgress)
            }
        }, 16) // ~60fps

        return () => clearInterval(timer)
    }, [isVisible, isPaused, duration])

    // Handle close animation
    const handleClose = () => {
        setIsVisible(false)
        setTimeout(() => {
            onClose(id)
        }, 300) // Wait for animation to complete
    }

    // Get icon based on type
    const getIcon = () => {
        switch (type) {
            case "success":
                return <FaCheckCircle className="text-success-500" size={20} />
            case "error":
                return (
                    <FaExclamationCircle
                        className="text-danger-500"
                        size={20}
                    />
                )
            case "warning":
                return <MdWarning className="text-warning-500" size={20} />
            case "info":
            default:
                return <FaInfoCircle className="text-primary-500" size={20} />
        }
    }

    // Get background color based on type
    const getBgColor = () => {
        switch (type) {
            case "success":
                return "bg-success-50 border-success-100"
            case "error":
                return "bg-danger-50 border-danger-100"
            case "warning":
                return "bg-warning-50 border-warning-100"
            case "info":
            default:
                return "bg-secondary-50 border-secondary-100"
        }
    }

    return (
        <div
            className={`max-w-md w-full rounded-lg shadow-lg border overflow-hidden transition-all duration-300 ${getBgColor()} ${
                isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
            }`}
            role="alert"
            aria-live="assertive"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="p-4 flex items-start">
                <div className="flex-shrink-0 mr-3">{getIcon()}</div>
                <div className="flex-1 pt-0.5">
                    <p className="text-sm text-secondary-800">{message}</p>
                </div>
                <button
                    className="ml-4 text-secondary-400 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-1"
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    <FaTimes size={16} />
                </button>
            </div>

            {/* Progress bar */}
            <div
                className={`h-1 ${
                    type === "success"
                        ? "bg-success-500"
                        : type === "error"
                        ? "bg-danger-500"
                        : type === "warning"
                        ? "bg-warning-500"
                        : "bg-primary-500"
                } transition-all duration-100 ease-linear`}
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}

Toast.propTypes = {
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["success", "error", "warning", "info"]),
    message: PropTypes.string.isRequired,
    duration: PropTypes.number,
    onClose: PropTypes.func.isRequired,
}

export default Toast
