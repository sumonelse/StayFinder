import React from "react"
import PropTypes from "prop-types"
import {
    FaInfoCircle,
    FaCheckCircle,
    FaExclamationTriangle,
    FaExclamationCircle,
    FaTimes,
} from "react-icons/fa"

/**
 * Alert component for displaying messages
 *
 * @param {Object} props - Component props
 * @param {string} props.type - Type of alert (info, success, warning, error)
 * @param {string} props.title - Alert title
 * @param {string} props.message - Alert message
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {Function} props.onDismiss - Function to call when alert is dismissed
 * @param {string} props.className - Additional CSS classes
 */
const Alert = ({
    type = "info",
    title,
    message,
    dismissible = false,
    onDismiss,
    className = "",
}) => {
    // Alert styles based on type
    const styles = {
        info: {
            container: "bg-blue-50 border-blue-200 text-blue-800",
            icon: <FaInfoCircle className="text-blue-500" />,
        },
        success: {
            container: "bg-green-50 border-green-200 text-green-800",
            icon: <FaCheckCircle className="text-green-500" />,
        },
        warning: {
            container: "bg-yellow-50 border-yellow-200 text-yellow-800",
            icon: <FaExclamationTriangle className="text-yellow-500" />,
        },
        error: {
            container: "bg-red-50 border-red-200 text-red-800",
            icon: <FaExclamationCircle className="text-red-500" />,
        },
    }

    const style = styles[type] || styles.info

    return (
        <div
            className={`rounded-lg border p-4 mb-4 ${style.container} ${className}`}
            role="alert"
        >
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">{style.icon}</div>
                <div className="flex-1">
                    {title && <h3 className="font-medium mb-1">{title}</h3>}
                    {message && (
                        <div className="text-sm opacity-90">{message}</div>
                    )}
                </div>
                {dismissible && onDismiss && (
                    <button
                        type="button"
                        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-opacity-20 hover:bg-secondary-500 focus:outline-none"
                        onClick={onDismiss}
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                )}
            </div>
        </div>
    )
}

Alert.propTypes = {
    type: PropTypes.oneOf(["info", "success", "warning", "error"]),
    title: PropTypes.string,
    message: PropTypes.string,
    dismissible: PropTypes.bool,
    onDismiss: PropTypes.func,
    className: PropTypes.string,
}

export default Alert
