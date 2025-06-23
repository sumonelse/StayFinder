import PropTypes from "prop-types"
import { useState, useEffect } from "react"
import { FaChevronRight } from "react-icons/fa"
import {
    parseDescriptionSections,
    getSectionIcon,
} from "../../utils/descriptionParser"

/**
 * Component for displaying property description with section headers
 * in the main property detail page
 */
const PropertyDescription = ({ description, onReadMore, maxLength = 300 }) => {
    const [sections, setSections] = useState([])
    const [isTruncated, setIsTruncated] = useState(false)
    const [truncatedDescription, setTruncatedDescription] = useState("")

    useEffect(() => {
        if (!description) return

        // Parse the description into sections
        const parsedSections = parseDescriptionSections(description)
        setSections(parsedSections)

        // Check if we need to truncate
        if (description.length > maxLength) {
            setIsTruncated(true)

            // Create a truncated version
            if (parsedSections.length === 1 && !parsedSections[0].title) {
                // Simple truncation for descriptions without sections
                setTruncatedDescription(
                    description.substring(0, maxLength) + "..."
                )
            } else {
                // For sectioned descriptions, we'll include at least the first section
                // and truncate within it if needed
                let result = ""
                let totalLength = 0
                let includedSections = 0

                for (const section of parsedSections) {
                    const sectionText = section.title
                        ? `## ${section.title}\n${section.content}`
                        : section.content

                    if (totalLength + sectionText.length <= maxLength) {
                        // Can include the whole section
                        result += (result ? "\n\n" : "") + sectionText
                        totalLength += sectionText.length + (result ? 2 : 0) // Account for newlines
                        includedSections++
                    } else if (includedSections === 0) {
                        // At least include part of the first section
                        const remainingLength = maxLength - totalLength
                        result +=
                            sectionText.substring(0, remainingLength) + "..."
                        break
                    } else {
                        // Can't fit more sections
                        break
                    }
                }

                // If we have more sections than we could include, add an indicator
                if (includedSections < parsedSections.length) {
                    result += "\n\n..."
                }

                setTruncatedDescription(result)
            }
        } else {
            setIsTruncated(false)
            setTruncatedDescription(description)
        }
    }, [description, maxLength])

    // We're now using the shared getSectionIcon function from descriptionParser.js

    // If no description, don't render anything
    if (!description) return null

    // For simple descriptions without sections
    if (sections.length === 1 && !sections[0].title) {
        return (
            <div className="text-secondary-700 space-y-4 leading-relaxed">
                <p>{isTruncated ? truncatedDescription : description}</p>
                {isTruncated && (
                    <button
                        onClick={onReadMore}
                        className="mt-2 text-primary-600 hover:text-primary-800 font-medium flex items-center transition-all duration-300 hover:translate-x-1"
                    >
                        Read more
                        <FaChevronRight
                            className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
                            size={12}
                        />
                    </button>
                )}
            </div>
        )
    }

    // For descriptions with sections
    return (
        <div className="text-secondary-700 space-y-6 leading-relaxed">
            {/* Display parsed sections */}
            {parseDescriptionSections(
                isTruncated ? truncatedDescription : description
            ).map((section, index) => {
                const Icon = getSectionIcon(section.title)

                return (
                    <div key={index} className="mb-4">
                        {section.title ? (
                            <>
                                <div className="flex items-center mb-2">
                                    <div className="bg-primary-50 p-1.5 rounded-full mr-2 text-primary-600">
                                        <Icon size={14} />
                                    </div>
                                    <h4 className="text-lg font-medium text-secondary-800">
                                        {section.title}
                                    </h4>
                                </div>
                                <div className="pl-8 text-secondary-700">
                                    {section.content}
                                </div>
                            </>
                        ) : (
                            <div>{section.content}</div>
                        )}
                    </div>
                )
            })}

            {/* Read more button */}
            {isTruncated && (
                <button
                    onClick={onReadMore}
                    className="mt-2 text-primary-600 hover:text-primary-800 font-medium flex items-center transition-all duration-300 hover:translate-x-1"
                >
                    Read more
                    <FaChevronRight
                        className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
                        size={12}
                    />
                </button>
            )}
        </div>
    )
}

PropertyDescription.propTypes = {
    description: PropTypes.string,
    onReadMore: PropTypes.func.isRequired,
    maxLength: PropTypes.number,
}

export default PropertyDescription
