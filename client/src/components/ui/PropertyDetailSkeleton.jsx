import React from "react"

/**
 * Skeleton loading component for property detail page
 * Displays a placeholder UI while property details are loading
 */
const PropertyDetailSkeleton = () => {
    return (
        <div className="animate-pulse">
            {/* Header section */}
            <div className="mb-6">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>

                {/* Rating and location */}
                <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>

            {/* Image gallery placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="h-72 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>

            {/* Details section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Left column - details */}
                <div className="col-span-2">
                    <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>

                    <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>

                    <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                </div>

                {/* Right column - booking card */}
                <div className="col-span-1">
                    <div className="bg-gray-100 rounded-lg p-6">
                        <div className="h-7 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-5 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PropertyDetailSkeleton
