import { useState } from "react"
import {
    FaClock,
    FaTimesCircle,
    FaCheckCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaEnvelope,
    FaBell,
    FaEye,
    FaCalendarAlt,
    FaShieldAlt,
} from "react-icons/fa"

/**
 * Enhanced Property Status Component
 * Shows detailed status information with better UX
 */
const PropertyStatus = ({
    property,
    showBanner = true,
    showInline = false,
}) => {
    const [showNotifyModal, setShowNotifyModal] = useState(false)
    const [email, setEmail] = useState("")
    const [isSubscribed, setIsSubscribed] = useState(false)

    // Get property status information
    const getPropertyStatus = () => {
        if (!property)
            return { canBook: false, status: "loading", message: "Loading..." }

        if (!property.isApproved) {
            return {
                canBook: false,
                status: "pending",
                title: "Property Under Review",
                message:
                    "This property is currently being reviewed by our team and is not available for booking yet.",
                detailedMessage:
                    "Our team reviews all properties to ensure they meet our quality and safety standards. This usually takes 1-3 business days.",
                icon: FaClock,
                color: "yellow",
                bgColor: "bg-yellow-50",
                borderColor: "border-yellow-200",
                textColor: "text-yellow-800",
                iconColor: "text-yellow-600",
                actionable: true,
                actionText: "Get notified when available",
            }
        }

        if (!property.isAvailable) {
            return {
                canBook: false,
                status: "unavailable",
                title: "Property Currently Unavailable",
                message:
                    "This property is temporarily unavailable for booking.",
                detailedMessage:
                    "The host has temporarily disabled bookings for this property. This could be due to maintenance, personal use, or other reasons.",
                icon: FaTimesCircle,
                color: "red",
                bgColor: "bg-red-50",
                borderColor: "border-red-200",
                textColor: "text-red-800",
                iconColor: "text-red-600",
                actionable: true,
                actionText: "Contact host for details",
            }
        }

        if (property.rejectionReason) {
            return {
                canBook: false,
                status: "rejected",
                title: "Property Not Approved",
                message: "This property was not approved for booking.",
                detailedMessage: property.rejectionReason,
                icon: FaExclamationTriangle,
                color: "red",
                bgColor: "bg-red-50",
                borderColor: "border-red-200",
                textColor: "text-red-800",
                iconColor: "text-red-600",
                actionable: false,
            }
        }

        return {
            canBook: true,
            status: "available",
            title: "Property Available",
            message: "This property is available for booking.",
            icon: FaCheckCircle,
            color: "green",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            textColor: "text-green-800",
            iconColor: "text-green-600",
        }
    }

    const statusInfo = getPropertyStatus()

    // Handle notify me subscription
    const handleNotifyMe = async () => {
        try {
            // Here you would implement the actual notification subscription
            // For now, just simulate success
            setIsSubscribed(true)
            setShowNotifyModal(false)

            // Show success message (you could use a toast library)
            alert("✅ You'll be notified when this property becomes available!")
        } catch (error) {
            alert("❌ Failed to subscribe for notifications. Please try again.")
        }
    }

    // Inline status (for cards, lists, etc.)
    if (showInline) {
        if (statusInfo.canBook) return null

        return (
            <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    statusInfo.color === "yellow"
                        ? "bg-yellow-100 text-yellow-800"
                        : statusInfo.color === "red"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                }`}
            >
                <statusInfo.icon className="mr-1" size={10} />
                {statusInfo.status === "pending"
                    ? "Under Review"
                    : statusInfo.status === "unavailable"
                    ? "Unavailable"
                    : statusInfo.status === "rejected"
                    ? "Not Approved"
                    : "Unknown Status"}
            </div>
        )
    }

    // Banner status (for property detail page)
    if (showBanner && !statusInfo.canBook) {
        return (
            <>
                <div
                    className={`mb-6 p-6 rounded-xl border ${statusInfo.borderColor} ${statusInfo.bgColor} shadow-sm`}
                >
                    <div className="flex items-start space-x-4">
                        <div
                            className={`p-3 rounded-full ${statusInfo.bgColor} ${statusInfo.iconColor}`}
                        >
                            <statusInfo.icon size={24} />
                        </div>

                        <div className="flex-1">
                            <h3
                                className={`text-lg font-semibold mb-2 ${statusInfo.textColor}`}
                            >
                                {statusInfo.title}
                            </h3>

                            <p
                                className={`mb-3 ${statusInfo.textColor} opacity-90`}
                            >
                                {statusInfo.message}
                            </p>

                            {statusInfo.detailedMessage && (
                                <div
                                    className={`p-3 rounded-lg bg-white/50 border ${statusInfo.borderColor} mb-4`}
                                >
                                    <div className="flex items-start">
                                        <FaInfoCircle
                                            className={`mr-2 mt-0.5 ${statusInfo.iconColor} opacity-75`}
                                            size={14}
                                        />
                                        <p
                                            className={`text-sm ${statusInfo.textColor} opacity-80`}
                                        >
                                            {statusInfo.detailedMessage}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {statusInfo.actionable && (
                                <div className="flex flex-wrap gap-3">
                                    {statusInfo.status === "pending" && (
                                        <button
                                            onClick={() =>
                                                setShowNotifyModal(true)
                                            }
                                            className="inline-flex items-center px-4 py-2 bg-white border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors text-sm font-medium"
                                        >
                                            <FaBell
                                                className="mr-2"
                                                size={14}
                                            />
                                            {statusInfo.actionText}
                                        </button>
                                    )}

                                    {statusInfo.status === "unavailable" && (
                                        <button className="inline-flex items-center px-4 py-2 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors text-sm font-medium">
                                            <FaEnvelope
                                                className="mr-2"
                                                size={14}
                                            />
                                            {statusInfo.actionText}
                                        </button>
                                    )}

                                    <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                                        <FaEye className="mr-2" size={14} />
                                        View similar properties
                                    </button>
                                </div>
                            )}

                            {statusInfo.status === "pending" && (
                                <div className="mt-4 flex items-center space-x-4 text-sm">
                                    <div className="flex items-center text-yellow-700">
                                        <FaCalendarAlt
                                            className="mr-1"
                                            size={12}
                                        />
                                        <span>
                                            Submitted:{" "}
                                            {new Date(
                                                property.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-yellow-700">
                                        <FaShieldAlt
                                            className="mr-1"
                                            size={12}
                                        />
                                        <span>
                                            Review time: 1-3 business days
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notification Modal */}
                {showNotifyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Get Notified When Available
                            </h3>

                            <p className="text-gray-600 text-sm mb-4">
                                We'll send you an email as soon as this property
                                is approved and available for booking.
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowNotifyModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNotifyMe}
                                    disabled={!email}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Notify Me
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    return null
}

export default PropertyStatus
