import PropTypes from "prop-types"
import { Modal } from "../ui"
import { FaHome, FaQuoteLeft } from "react-icons/fa"
import { useEffect, useState } from "react"
import {
    parseDescriptionSections,
    getSectionIcon,
} from "../../utils/descriptionParser"

/**
 * Enhanced modal component for displaying the full property description
 * with improved visual styling, animations, and section headers
 */
const DescriptionModal = ({ isOpen, onClose, description, title }) => {
    const [animateIn, setAnimateIn] = useState(false)
    const [sections, setSections] = useState([])

    // Control animation timing
    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure animation runs after modal is visible
            const timer = setTimeout(() => setAnimateIn(true), 50)
            return () => clearTimeout(timer)
        } else {
            setAnimateIn(false)
        }
    }, [isOpen])

    // Parse description into sections when it changes
    useEffect(() => {
        if (description) {
            setSections(parseDescriptionSections(description))
        }
    }, [description])

    if (!description) return null

    // We're now using the shared getSectionIcon function from descriptionParser.js

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="About this place"
            size="lg"
        >
            <div
                className={`space-y-6 transition-all duration-500 ease-in-out ${
                    animateIn
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                }`}
            >
                {/* Decorative pattern background */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full text-primary-500"
                    >
                        <pattern
                            id="pattern-circles"
                            x="0"
                            y="0"
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                            patternContentUnits="userSpaceOnUse"
                        >
                            <circle
                                id="pattern-circle"
                                cx="10"
                                cy="10"
                                r="2"
                                fill="currentColor"
                            ></circle>
                        </pattern>
                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            fill="url(#pattern-circles)"
                        ></rect>
                    </svg>
                </div>

                {/* Title with enhanced styling */}
                {title && (
                    <div
                        className={`transition-all duration-700 delay-100 ${
                            animateIn
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-4"
                        }`}
                    >
                        <h3 className="text-2xl font-semibold text-secondary-900 mb-2 flex items-center">
                            <FaHome className="mr-3 text-primary-500" />
                            {title}
                        </h3>
                        <div className="w-16 h-1 bg-primary-500 rounded-full mb-4"></div>
                    </div>
                )}

                {/* Description sections */}
                <div className="relative">
                    {sections.length === 1 && !sections[0].title ? (
                        // Single section without title - show with quote styling
                        <div className="relative">
                            <FaQuoteLeft
                                className="text-primary-200 absolute -top-4 -left-2 opacity-50"
                                size={30}
                            />

                            <div
                                className={`relative z-10 text-secondary-700 leading-relaxed whitespace-pre-line px-4 py-2 transition-all duration-700 delay-200 text-lg ${
                                    animateIn
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-4"
                                }`}
                            >
                                <p className="first-letter:text-2xl first-letter:font-medium first-letter:text-primary-600">
                                    {sections[0].content}
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Multiple sections with headers
                        <div className="space-y-8">
                            {sections.map((section, index) => {
                                const Icon = getSectionIcon(section.title)
                                const delay = 200 + index * 100

                                return (
                                    <div
                                        key={index}
                                        className={`transition-all duration-700 ${
                                            animateIn
                                                ? "opacity-100 translate-y-0"
                                                : "opacity-0 translate-y-4"
                                        }`}
                                        style={{
                                            transitionDelay: `${delay}ms`,
                                        }}
                                    >
                                        {section.title ? (
                                            // Section with header
                                            <div className="mb-3">
                                                <div className="flex items-center mb-2">
                                                    <div className="bg-primary-50 p-2 rounded-full mr-3 text-primary-600">
                                                        <Icon size={16} />
                                                    </div>
                                                    <h4 className="text-xl font-medium text-secondary-800">
                                                        {section.title}
                                                    </h4>
                                                </div>
                                                <div className="pl-10 text-secondary-700 leading-relaxed whitespace-pre-line">
                                                    {section.content}
                                                </div>
                                            </div>
                                        ) : (
                                            // Section without header
                                            <div className="text-secondary-700 leading-relaxed whitespace-pre-line">
                                                {section.content}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Subtle footer */}
                <div
                    className={`mt-8 pt-4 border-t border-secondary-100 text-secondary-400 text-sm italic text-right transition-all duration-700 delay-300 ${
                        animateIn ? "opacity-100" : "opacity-0"
                    }`}
                >
                    Hosted with ♥ on StayFinder
                </div>
            </div>
        </Modal>
    )
}

DescriptionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    description: PropTypes.string,
    title: PropTypes.string,
}

export default DescriptionModal
