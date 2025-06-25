import { useState } from "react"
import {
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaCalendarAlt,
    FaEye,
    FaBell,
    FaEnvelope,
    FaShieldAlt,
} from "react-icons/fa"

/**
 * Enhanced Availability Indicator Component
 * Shows property availability status with detailed information and actions
 */
const AvailabilityIndicator = ({
    property,
    variant = "default",
    showActions = true,
    className = "",
}) => {
    const [showDetails, setShowDetails] = useState(false)

    // Get property availability status
    const getAvailabilityStatus = () => {
        if (!property) {
            return {
                status: "loading",
                label: "Loading...",
                description: "Checking property status...",
                color: "secondary",
                icon: FaClock,
                canBook: false,
            }
        }

        if (!property.isApproved) {
            return {
                status: "pending",
                label: "Under Review",
                description: "This property is being reviewed by our team",
                detailedDescription:
                    "Our quality assurance team reviews all properties to ensure they meet our standards. This process typically takes 1-3 business days.",
                color: "yellow",
                icon: FaClock,
                canBook: false,
                estimatedApproval: "1-3 business days",
                submittedDate: property.createdAt,
            }
        }

        if (property.rejectionReason) {
            return {
                status: "rejected",
                label: "Not Approved",
                description: "This property was not approved for listing",
                detailedDescription: property.rejectionReason,
                color: "red",
                icon: FaExclamationTriangle,
                canBook: false,
            }
        }

        if (!property.isAvailable) {
            return {
                status: "unavailable",
                label: "Unavailable",
                description:
                    "This property is currently not available for booking",
                detailedDescription:
                    "The host has temporarily disabled bookings. This could be due to maintenance, personal use, or other reasons.",
                color: "red",
                icon: FaTimesCircle,
                canBook: false,
            }
        }

        return {
            status: "available",
            label: "Available",
            description: "This property is ready for booking",
            detailedDescription:
                "This property has been verified and is available for immediate booking.",
            color: "green",
            icon: FaCheckCircle,
            canBook: true,
        }
    }

    const availabilityInfo = getAvailabilityStatus()

    // Render compact version
    if (variant === "compact") {
        return (
            <div className={`inline-flex items-center ${className}`}>
                <availabilityInfo.icon
                    className={`mr-2 ${
                        availabilityInfo.color === "green"
                            ? "text-green-600"
                            : availabilityInfo.color === "yellow"
                            ? "text-yellow-600"
                            : availabilityInfo.color === "red"
                            ? "text-red-600"
                            : "text-secondary-600"
                    }`}
                    size={14}
                />
                <span
                    className={`text-sm font-medium ${
                        availabilityInfo.color === "green"
                            ? "text-green-800"
                            : availabilityInfo.color === "yellow"
                            ? "text-yellow-800"
                            : availabilityInfo.color === "red"
                            ? "text-red-800"
                            : "text-secondary-800"
                    }`}
                >
                    {availabilityInfo.label}
                </span>
            </div>
        )
    }

    // Render badge version
    if (variant === "badge") {
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    availabilityInfo.color === "green"
                        ? "bg-green-100 text-green-800"
                        : availabilityInfo.color === "yellow"
                        ? "bg-yellow-100 text-yellow-800"
                        : availabilityInfo.color === "red"
                        ? "bg-red-100 text-red-800"
                        : "bg-secondary-100 text-secondary-800"
                } ${className}`}
            >
                <availabilityInfo.icon className="mr-1" size={10} />
                {availabilityInfo.label}
            </span>
        )
    }

    // Render detailed version (default)
    return (
        <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
            <div
                className={`p-4 border-l-4 ${
                    availabilityInfo.color === "green"
                        ? "border-green-400 bg-green-50"
                        : availabilityInfo.color === "yellow"
                        ? "border-yellow-400 bg-yellow-50"
                        : availabilityInfo.color === "red"
                        ? "border-red-400 bg-red-50"
                        : "border-secondary-400 bg-secondary-50"
                }`}
            >
                <div className="flex items-start">
                    <div
                        className={`p-2 rounded-full mr-3 ${
                            availabilityInfo.color === "green"
                                ? "bg-green-100 text-green-600"
                                : availabilityInfo.color === "yellow"
                                ? "bg-yellow-100 text-yellow-600"
                                : availabilityInfo.color === "red"
                                ? "bg-red-100 text-red-600"
                                : "bg-secondary-100 text-secondary-600"
                        }`}
                    >
                        <availabilityInfo.icon size={20} />
                    </div>

                    <div className="flex-1">
                        <h3
                            className={`font-semibold text-lg ${
                                availabilityInfo.color === "green"
                                    ? "text-green-900"
                                    : availabilityInfo.color === "yellow"
                                    ? "text-yellow-900"
                                    : availabilityInfo.color === "red"
                                    ? "text-red-900"
                                    : "text-secondary-900"
                            }`}
                        >
                            {availabilityInfo.label}
                        </h3>

                        <p
                            className={`text-sm mt-1 ${
                                availabilityInfo.color === "green"
                                    ? "text-green-800"
                                    : availabilityInfo.color === "yellow"
                                    ? "text-yellow-800"
                                    : availabilityInfo.color === "red"
                                    ? "text-red-800"
                                    : "text-secondary-800"
                            }`}
                        >
                            {availabilityInfo.description}
                        </p>

                        {/* Additional details for pending status */}
                        {availabilityInfo.status === "pending" && (
                            <div className="mt-3 space-y-2 text-xs">
                                <div className="flex items-center text-yellow-700">
                                    <FaCalendarAlt className="mr-1" size={10} />
                                    <span>
                                        Submitted:{" "}
                                        {new Date(
                                            availabilityInfo.submittedDate
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center text-yellow-700">
                                    <FaShieldAlt className="mr-1" size={10} />
                                    <span>
                                        Estimated approval:{" "}
                                        {availabilityInfo.estimatedApproval}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Show more details button */}
                        {availabilityInfo.detailedDescription && (
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className={`mt-2 text-xs font-medium flex items-center ${
                                    availabilityInfo.color === "green"
                                        ? "text-green-700 hover:text-green-800"
                                        : availabilityInfo.color === "yellow"
                                        ? "text-yellow-700 hover:text-yellow-800"
                                        : availabilityInfo.color === "red"
                                        ? "text-red-700 hover:text-red-800"
                                        : "text-secondary-700 hover:text-secondary-800"
                                }`}
                            >
                                <FaInfoCircle className="mr-1" size={10} />
                                {showDetails ? "Less details" : "More details"}
                            </button>
                        )}

                        {/* Detailed description */}
                        {showDetails &&
                            availabilityInfo.detailedDescription && (
                                <div
                                    className={`mt-3 p-3 rounded-lg bg-white/70 border ${
                                        availabilityInfo.color === "green"
                                            ? "border-green-200"
                                            : availabilityInfo.color ===
                                              "yellow"
                                            ? "border-yellow-200"
                                            : availabilityInfo.color === "red"
                                            ? "border-red-200"
                                            : "border-secondary-200"
                                    }`}
                                >
                                    <p
                                        className={`text-xs ${
                                            availabilityInfo.color === "green"
                                                ? "text-green-800"
                                                : availabilityInfo.color ===
                                                  "yellow"
                                                ? "text-yellow-800"
                                                : availabilityInfo.color ===
                                                  "red"
                                                ? "text-red-800"
                                                : "text-secondary-800"
                                        }`}
                                    >
                                        {availabilityInfo.detailedDescription}
                                    </p>
                                </div>
                            )}

                        {/* Action buttons */}
                        {showActions && !availabilityInfo.canBook && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {availabilityInfo.status === "pending" && (
                                    <button className="inline-flex items-center px-3 py-1.5 bg-white border border-yellow-300 rounded-md text-yellow-700 hover:bg-yellow-50 transition-colors text-xs font-medium">
                                        <FaBell className="mr-1" size={10} />
                                        Notify when approved
                                    </button>
                                )}

                                {availabilityInfo.status === "unavailable" && (
                                    <button className="inline-flex items-center px-3 py-1.5 bg-white border border-red-300 rounded-md text-red-700 hover:bg-red-50 transition-colors text-xs font-medium">
                                        <FaEnvelope
                                            className="mr-1"
                                            size={10}
                                        />
                                        Contact host
                                    </button>
                                )}

                                <button className="inline-flex items-center px-3 py-1.5 bg-white border border-secondary-300 rounded-md text-secondary-700 hover:bg-secondary-50 transition-colors text-xs font-medium">
                                    <FaEye className="mr-1" size={10} />
                                    View similar properties
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AvailabilityIndicator
