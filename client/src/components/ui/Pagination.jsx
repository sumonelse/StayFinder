import React from "react"
import PropTypes from "prop-types"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"

/**
 * Pagination component for navigating through pages
 * Redesigned with Airbnb-style grey/black color scheme
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
            <div className="flex items-center space-x-2">
                {/* Previous button */}
                <button
                    onClick={() =>
                        currentPage > 1 && onPageChange(currentPage - 1)
                    }
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border ${
                        currentPage === 1
                            ? "bg-secondary-50 text-secondary-400 cursor-not-allowed"
                            : "bg-white text-secondary-700 hover:bg-secondary-50"
                    } border-secondary-200 font-medium text-sm transition-colors`}
                    aria-label="Previous page"
                >
                    <div className="flex items-center">
                        <FaChevronLeft className="w-3 h-3 mr-1" />
                        <span>Previous</span>
                    </div>
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                    {pageNumbers.map((pageNumber, index) => (
                        <div key={`${pageNumber}-${index}`}>
                            {pageNumber === "..." ? (
                                <span className="px-2 py-2 text-secondary-500">
                                    ...
                                </span>
                            ) : (
                                <button
                                    onClick={() =>
                                        pageNumber !== currentPage &&
                                        onPageChange(pageNumber)
                                    }
                                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                        pageNumber === currentPage
                                            ? "bg-secondary-900 text-white"
                                            : "bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-200"
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
                        </div>
                    ))}
                </div>

                {/* Next button */}
                <button
                    onClick={() =>
                        currentPage < totalPages &&
                        onPageChange(currentPage + 1)
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border ${
                        currentPage === totalPages
                            ? "bg-secondary-50 text-secondary-400 cursor-not-allowed"
                            : "bg-white text-secondary-700 hover:bg-secondary-50"
                    } border-secondary-200 font-medium text-sm transition-colors`}
                    aria-label="Next page"
                >
                    <div className="flex items-center">
                        <span>Next</span>
                        <FaChevronRight className="w-3 h-3 ml-1" />
                    </div>
                </button>
            </div>
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
