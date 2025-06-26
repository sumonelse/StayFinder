import React from "react"

/**
 * Skeleton loading component for booking cards
 * Displays a placeholder UI while booking data is loading
 */
const BookingCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border border-gray-100">
            <div className="p-5">
                {/* Header with status */}
                <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>

                {/* Property info */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Image placeholder */}
                    <div className="h-32 w-full md:w-48 bg-gray-200 rounded-lg"></div>

                    <div className="flex-1">
                        {/* Property title */}
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>

                        {/* Location */}
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>

                        {/* Dates */}
                        <div className="flex gap-2 items-center mb-2">
                            <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>

                        {/* Guests */}
                        <div className="flex gap-2 items-center">
                            <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                </div>

                {/* Price and actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="flex gap-2">
                        <div className="h-9 bg-gray-200 rounded w-24"></div>
                        <div className="h-9 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingCardSkeleton
