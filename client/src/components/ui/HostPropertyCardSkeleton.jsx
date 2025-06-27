import React from "react"

/**
 * Skeleton loading component for host property cards
 * Displays a placeholder UI while property data is loading
 */
const HostPropertyCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border border-secondary-100">
            <div className="flex flex-col md:flex-row">
                {/* Image placeholder */}
                <div className="h-48 md:h-auto md:w-1/3 bg-secondary-200"></div>

                {/* Content area */}
                <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                        {/* Title placeholder */}
                        <div className="h-6 bg-secondary-200 rounded w-2/3 mb-2"></div>

                        {/* Status badge placeholder */}
                        <div className="h-6 bg-secondary-200 rounded-full w-20"></div>
                    </div>

                    {/* Location placeholder */}
                    <div className="h-4 bg-secondary-200 rounded w-1/2 mb-4"></div>

                    {/* Stats placeholders */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="h-4 bg-secondary-200 rounded"></div>
                        <div className="h-4 bg-secondary-200 rounded"></div>
                        <div className="h-4 bg-secondary-200 rounded"></div>
                    </div>

                    {/* Price placeholder */}
                    <div className="h-5 bg-secondary-200 rounded w-1/4 mb-4"></div>

                    {/* Actions placeholder */}
                    <div className="flex justify-end gap-2 mt-2">
                        <div className="h-9 w-9 bg-secondary-200 rounded-full"></div>
                        <div className="h-9 w-9 bg-secondary-200 rounded-full"></div>
                        <div className="h-9 w-9 bg-secondary-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HostPropertyCardSkeleton
