import React from "react"
import PropTypes from "prop-types"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"

/**
 * Pagination component for navigating through pages
 *
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Function to call when page changes
 * @param {number} props.siblingCount - Number of page buttons to show on each side of current page
 * @param {string} props.className - Additional CSS classes
 */
const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    className = "",
}) => {
    // Don't render pagination if there's only one page
    if (totalPages <= 1) return null

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = []

        // Always show first page
        pageNumbers.push(1)

        // Calculate range around current page
        const leftSibling = Math.max(2, currentPage - siblingCount)
        const rightSibling = Math.min(
            totalPages - 1,
            currentPage + siblingCount
        )

        // Add ellipsis if needed before current page range
        if (leftSibling > 2) {
            pageNumbers.push("...")
        }

        // Add page numbers around current page
        for (let i = leftSibling; i <= rightSibling; i++) {
            if (i !== 1 && i !== totalPages) {
                pageNumbers.push(i)
            }
        }

        // Add ellipsis if needed after current page range
        if (rightSibling < totalPages - 1) {
            pageNumbers.push("...")
        }

        // Always show last page if more than one page
        if (totalPages > 1) {
            pageNumbers.push(totalPages)
        }

        return pageNumbers
    }

    const pageNumbers = getPageNumbers()

    return (
        <nav
            className={`flex justify-center ${className}`}
            aria-label="Pagination"
        >
            <ul className="inline-flex items-center -space-x-px">
                {/* Previous button */}
                <li>
                    <button
                        onClick={() =>
                            currentPage > 1 && onPageChange(currentPage - 1)
                        }
                        disabled={currentPage === 1}
                        className={`px-3 py-2 ml-0 leading-tight rounded-l-lg border ${
                            currentPage === 1
                                ? "bg-secondary-100 text-secondary-400 cursor-not-allowed"
                                : "bg-white text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700"
                        } border-secondary-300`}
                        aria-label="Previous page"
                    >
                        <FaChevronLeft className="w-4 h-4" />
                    </button>
                </li>

                {/* Page numbers */}
                {pageNumbers.map((pageNumber, index) => (
                    <li key={`${pageNumber}-${index}`}>
                        {pageNumber === "..." ? (
                            <span className="px-3 py-2 leading-tight border border-secondary-300 bg-white text-secondary-500">
                                ...
                            </span>
                        ) : (
                            <button
                                onClick={() =>
                                    pageNumber !== currentPage &&
                                    onPageChange(pageNumber)
                                }
                                className={`px-3 py-2 leading-tight border ${
                                    pageNumber === currentPage
                                        ? "bg-secondary-50 text-secondary-600 border-secondary-300 z-10"
                                        : "bg-white text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700 border-secondary-300"
                                }`}
                                aria-current={
                                    pageNumber === currentPage
                                        ? "page"
                                        : undefined
                                }
                                aria-label={`Page ${pageNumber}`}
                            >
                                {pageNumber}
                            </button>
                        )}
                    </li>
                ))}

                {/* Next button */}
                <li>
                    <button
                        onClick={() =>
                            currentPage < totalPages &&
                            onPageChange(currentPage + 1)
                        }
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 leading-tight rounded-r-lg border ${
                            currentPage === totalPages
                                ? "bg-secondary-100 text-secondary-400 cursor-not-allowed"
                                : "bg-white text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700"
                        } border-secondary-300`}
                        aria-label="Next page"
                    >
                        <FaChevronRight className="w-4 h-4" />
                    </button>
                </li>
            </ul>
        </nav>
    )
}

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    siblingCount: PropTypes.number,
    className: PropTypes.string,
}

export default Pagination
