import { useState } from "react"
import PropTypes from "prop-types"
import {
    FaCheck,
    FaTimes,
    FaClock,
    FaSmokingBan,
    FaPaw,
    FaGlassMartiniAlt,
    FaMusic,
    FaUsers,
    FaChevronDown,
    FaChevronUp,
    FaInfoCircle,
    FaRegClock,
    FaRegCalendarAlt,
    FaRegMoon,
    FaRegBell,
    FaRegCommentDots,
} from "react-icons/fa"

/**
 * Enhanced component for displaying property rules with interactive elements
 */
const PropertyRules = ({
    rules = {},
    className = "",
    showAll = false,
    maxInitialRules = 4,
}) => {
    const [expanded, setExpanded] = useState(showAll)
    const [activeRule, setActiveRule] = useState(null)

    // Default rules if none provided
    const defaultRules = {
        checkIn: "3:00 PM - 8:00 PM",
        checkOut: "11:00 AM",
        smoking: false,
        pets: false,
        parties: false,
        events: false,
        quietHours: "10:00 PM - 7:00 AM",
        additionalRules: [],
    }

    // Handle case when rules is an array (for backward compatibility)
    let processedRules = rules
    if (Array.isArray(rules)) {
        processedRules = {
            ...defaultRules,
            additionalRules: rules.map((rule) => ({
                title: "House rule",
                description: rule,
            })),
        }
    }

    // Merge provided rules with defaults
    const propertyRules = { ...defaultRules, ...processedRules }

    // Helper function to toggle active rule
    const toggleActiveRule = (ruleId) => {
        if (activeRule === ruleId) {
            setActiveRule(null)
        } else {
            setActiveRule(ruleId)
        }
    }

    // Define standard rules with icons and descriptions
    const standardRules = [
        {
            id: "checkIn",
            label: "Check-in",
            value: propertyRules.checkIn,
            icon: <FaRegClock className="text-secondary-600" size={18} />,
            type: "text",
            description:
                "Please respect the check-in time to ensure the property is properly prepared for your arrival.",
        },
        {
            id: "checkOut",
            label: "Check-out",
            value: propertyRules.checkOut,
            icon: <FaRegCalendarAlt className="text-secondary-600" size={18} />,
            type: "text",
            description:
                "Please check out on time to allow the host to prepare the property for the next guests.",
        },
        {
            id: "smoking",
            label: "Smoking",
            value: propertyRules.smoking ? "Allowed" : "Not allowed",
            icon: (
                <FaSmokingBan
                    className={
                        propertyRules.smoking
                            ? "text-green-500"
                            : "text-red-500"
                    }
                    size={18}
                />
            ),
            type: "boolean",
            allowed: propertyRules.smoking,
            description: propertyRules.smoking
                ? "Smoking is permitted on this property. Please be considerate of other guests and dispose of cigarette butts properly."
                : "This is a non-smoking property. Smoking is not permitted anywhere on the premises.",
        },
        {
            id: "pets",
            label: "Pets",
            value: propertyRules.pets ? "Allowed" : "Not allowed",
            icon: (
                <FaPaw
                    className={
                        propertyRules.pets ? "text-green-500" : "text-red-500"
                    }
                    size={18}
                />
            ),
            type: "boolean",
            allowed: propertyRules.pets,
            description: propertyRules.pets
                ? "Pets are welcome at this property. Please clean up after your pets and ensure they don't disturb other guests."
                : "Pets are not allowed at this property. Service animals may be permitted as required by law.",
        },
        {
            id: "parties",
            label: "Parties",
            value: propertyRules.parties ? "Allowed" : "Not allowed",
            icon: (
                <FaGlassMartiniAlt
                    className={
                        propertyRules.parties
                            ? "text-green-500"
                            : "text-red-500"
                    }
                    size={18}
                />
            ),
            type: "boolean",
            allowed: propertyRules.parties,
            description: propertyRules.parties
                ? "Parties are permitted at this property. Please be respectful of neighbors and local noise ordinances."
                : "Parties are not permitted at this property to ensure a peaceful environment for all guests and neighbors.",
        },
        {
            id: "events",
            label: "Events",
            value: propertyRules.events ? "Allowed" : "Not allowed",
            icon: (
                <FaUsers
                    className={
                        propertyRules.events ? "text-green-500" : "text-red-500"
                    }
                    size={18}
                />
            ),
            type: "boolean",
            allowed: propertyRules.events,
            description: propertyRules.events
                ? "Events are permitted at this property. Please discuss details with the host in advance."
                : "Events are not permitted at this property without prior approval from the host.",
        },
        {
            id: "quietHours",
            label: "Quiet hours",
            value: propertyRules.quietHours,
            icon: <FaRegMoon className="text-secondary-600" size={18} />,
            type: "text",
            description:
                "Please respect quiet hours to ensure all guests can enjoy a peaceful stay.",
        },
    ]

    // Additional custom rules
    const additionalRules = propertyRules.additionalRules.map(
        (rule, index) => ({
            id: `additional-${index}`,
            label: rule.title || "House rule",
            value: rule.description,
            icon: <FaRegCommentDots className="text-secondary-600" size={18} />,
            type: "text",
            description: rule.description,
        })
    )

    // Combine all rules
    const allRules = [...standardRules, ...additionalRules]

    // Determine which rules to show based on expanded state
    const visibleRules = expanded
        ? allRules
        : allRules.slice(0, maxInitialRules)

    return (
        <div className={`${className}`}>
            {!className.includes("text-sm") && (
                <h3 className="text-xl font-semibold mb-4">House Rules</h3>
            )}

            <div className="space-y-4">
                {visibleRules.map((rule) => (
                    <div
                        key={rule.id}
                        className={`rounded-lg transition-all duration-200 ${
                            activeRule === rule.id
                                ? "bg-secondary-50 border border-secondary-200"
                                : ""
                        }`}
                    >
                        <div
                            className="flex items-start p-2 cursor-pointer"
                            onClick={() => toggleActiveRule(rule.id)}
                        >
                            <div className="mt-0.5 mr-3 flex-shrink-0">
                                {rule.icon}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-secondary-900">
                                        {rule.label}
                                    </h4>
                                    {rule.description && (
                                        <FaInfoCircle
                                            className={`text-secondary-400 transition-colors duration-200 ${
                                                activeRule === rule.id
                                                    ? "text-secondary-600"
                                                    : ""
                                            }`}
                                            size={14}
                                        />
                                    )}
                                </div>
                                {rule.type === "boolean" ? (
                                    <div className="flex items-center mt-1">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                rule.allowed
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {rule.allowed ? (
                                                <FaCheck
                                                    className="mr-1"
                                                    size={10}
                                                />
                                            ) : (
                                                <FaTimes
                                                    className="mr-1"
                                                    size={10}
                                                />
                                            )}
                                            {rule.value}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-secondary-700">
                                        {rule.value}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Expandable description */}
                        {activeRule === rule.id && rule.description && (
                            <div className="px-2 pb-3 pl-9 text-sm text-secondary-600 animate-fadeIn">
                                {rule.description}
                            </div>
                        )}
                    </div>
                ))}

                {allRules.length > maxInitialRules && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center text-black hover:text-secondary-700 font-medium mt-2 transition-colors duration-200 underline"
                    >
                        {expanded ? (
                            <>
                                <FaChevronUp className="mr-1" />
                                Show less
                            </>
                        ) : (
                            <>
                                <FaChevronDown className="mr-1" />
                                Show all {allRules.length} rules
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

PropertyRules.propTypes = {
    rules: PropTypes.shape({
        checkIn: PropTypes.string,
        checkOut: PropTypes.string,
        smoking: PropTypes.bool,
        pets: PropTypes.bool,
        parties: PropTypes.bool,
        events: PropTypes.bool,
        quietHours: PropTypes.string,
        additionalRules: PropTypes.arrayOf(
            PropTypes.shape({
                title: PropTypes.string,
                description: PropTypes.string,
            })
        ),
    }),
    className: PropTypes.string,
    showAll: PropTypes.bool,
    maxInitialRules: PropTypes.number,
}

export default PropertyRules
