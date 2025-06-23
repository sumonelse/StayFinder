import {
    FaInfoCircle,
    FaHome,
    FaMapMarkerAlt,
    FaKey,
    FaRegLightbulb,
    FaWalking,
    FaUtensils,
} from "react-icons/fa"

/**
 * Utility functions for parsing and formatting property descriptions
 */

/**
 * Parse a description string and extract sections with headers
 * @param {string} description - The property description text
 * @returns {Array} - Array of section objects with title and content
 */
export const parseDescriptionSections = (description) => {
    if (!description) return []

    // Split the description by section headers (## Header)
    const sectionRegex = /^##\s+(.+)$/gm
    const sections = []

    // Check if there are any section headers
    if (!description.match(sectionRegex)) {
        // If no sections, return the whole description as one section
        return [
            {
                title: null,
                content: description.trim(),
            },
        ]
    }

    // Split the description into sections
    const parts = description.split(sectionRegex)

    // The first part (index 0) is content before any section header
    // If it's not empty, add it as an untitled section
    if (parts[0].trim()) {
        sections.push({
            title: null,
            content: parts[0].trim(),
        })
    }

    // Process the rest of the parts (alternating titles and contents)
    for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i]
        const content = parts[i + 1] || ""

        sections.push({
            title: title.trim(),
            content: content.trim(),
        })
    }

    return sections
}

/**
 * Format a description with section headers for display
 * @param {string} description - The property description text
 * @returns {string} - Formatted HTML string
 */
export const formatDescriptionWithSections = (description) => {
    if (!description) return ""

    const sections = parseDescriptionSections(description)

    // If only one section with no title, return the content as is
    if (sections.length === 1 && !sections[0].title) {
        return sections[0].content
    }

    // Format sections with headers
    return sections
        .map((section) => {
            if (!section.title) {
                return `<div class="mb-4">${section.content}</div>`
            }
            return `
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-secondary-800 mb-2">${section.title}</h3>
        <div class="text-secondary-700">${section.content}</div>
      </div>
    `
        })
        .join("")
}

/**
 * Get an appropriate icon component for a section based on its title
 * @param {string} title - The section title
 * @returns {Function} - React icon component
 */
export const getSectionIcon = (title) => {
    if (!title) return FaInfoCircle

    const titleLower = title.toLowerCase()
    if (
        titleLower.includes("space") ||
        titleLower.includes("property") ||
        titleLower.includes("home")
    )
        return FaHome
    if (
        titleLower.includes("location") ||
        titleLower.includes("neighborhood") ||
        titleLower.includes("area")
    )
        return FaMapMarkerAlt
    if (titleLower.includes("access") || titleLower.includes("check"))
        return FaKey
    if (titleLower.includes("amenities") || titleLower.includes("features"))
        return FaRegLightbulb
    if (titleLower.includes("nearby") || titleLower.includes("around"))
        return FaWalking
    if (
        titleLower.includes("food") ||
        titleLower.includes("dining") ||
        titleLower.includes("restaurants")
    )
        return FaUtensils

    return FaInfoCircle
}
