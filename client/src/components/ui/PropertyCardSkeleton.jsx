import React from "react"

/**
 * Skeleton loading component for property cards
 * Displays a placeholder UI while property data is loading
 */
const PropertyCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            {/* Image placeholder */}
            <div className="h-48 bg-gray-200"></div>

            {/* Content area */}
            <div className="p-4">
                {/* Title placeholder */}
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>

                {/* Location placeholder */}
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>

                {/* Features placeholder */}
                <div className="flex gap-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>

                {/* Price placeholder */}
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    )
}

export default PropertyCardSkeleton
