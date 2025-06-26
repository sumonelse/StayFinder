import React from "react"
import Spinner from "./Spinner"

/**
 * Loading fallback component for lazy-loaded routes
 * Displays a centered spinner with optional text
 */
const LoadingFallback = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
            <Spinner size="lg" className="text-primary-600" />
            <p className="mt-4 text-gray-600 animate-pulse">Loading...</p>
        </div>
    )
}

export default LoadingFallback
