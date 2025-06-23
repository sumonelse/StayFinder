import { useState } from "react"
import { Link } from "react-router-dom"
import {
    FaStar,
    FaMapMarkerAlt,
    FaBed,
    FaBath,
    FaUsers,
    FaHeart,
    FaRegHeart,
    FaWifi,
    FaParking,
    FaSwimmingPool,
    FaSnowflake,
    FaEye,
    FaShare,
} from "react-icons/fa"
import { formatPrice } from "../../utils/currency"
import { useAuth } from "../../context/AuthContext"
import PropertyStatus from "./PropertyStatus"

/**
 * Enhanced Property Card Component with Status Indicators
 */
const PropertyCard = ({ property, className = "" }) => {
    const { user, isAuthenticated, addToFavorites, removeFromFavorites } =
        useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [imageError, setImageError] = useState(false)

    const handleFavoriteToggle = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) return

        setIsLoading(true)
        try {
            const isFavorite = user?.favorites?.includes(property._id)
            if (isFavorite) {
                await removeFromFavorites(property._id)
            } else {
                await addToFavorites(property._id)
            }
        } catch (error) {
            console.error("Error toggling favorite:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getAmenityIcon = (amenity) => {
        const amenityLower = amenity.toLowerCase()
        if (amenityLower.includes("wifi")) return <FaWifi />
        if (amenityLower.includes("pool")) return <FaSwimmingPool />
        if (amenityLower.includes("parking")) return <FaParking />
        if (amenityLower.includes("air") || amenityLower.includes("ac"))
            return <FaSnowflake />
        return null
    }

    const isFavorite = user?.favorites?.includes(property._id)

    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group ${className}`}
        >
            <Link to={`/properties/${property._id}`} className="block">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                    {property.images?.length > 0 && !imageError ? (
                        <img
                            src={property.images[0].url}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                        </div>
                    )}

                    {/* Overlay with status and actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                            <PropertyStatus
                                property={property}
                                showInline={true}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex space-x-2">
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    // Handle share functionality
                                }}
                                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <FaShare className="text-gray-600" size={14} />
                            </button>

                            {isAuthenticated && (
                                <button
                                    onClick={handleFavoriteToggle}
                                    disabled={isLoading}
                                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                                >
                                    {isFavorite ? (
                                        <FaHeart
                                            className="text-red-500"
                                            size={14}
                                        />
                                    ) : (
                                        <FaRegHeart
                                            className="text-gray-600"
                                            size={14}
                                        />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* View Details Button */}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center">
                                <FaEye className="mr-1" size={12} />
                                View Details
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4">
                    {/* Title and Rating */}
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                            {property.title}
                        </h3>
                        {property.avgRating > 0 && (
                            <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full ml-2">
                                <FaStar
                                    className="text-yellow-500 mr-1"
                                    size={12}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {property.avgRating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 mb-3">
                        <FaMapMarkerAlt className="mr-1" size={12} />
                        <span className="text-sm">
                            {property.address.city}, {property.address.state}
                        </span>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                            <FaUsers className="mr-1" size={12} />
                            <span>{property.maxGuests} guests</span>
                        </div>
                        <div className="flex items-center">
                            <FaBed className="mr-1" size={12} />
                            <span>{property.bedrooms} bed</span>
                        </div>
                        <div className="flex items-center">
                            <FaBath className="mr-1" size={12} />
                            <span>{property.bathrooms} bath</span>
                        </div>
                    </div>

                    {/* Key Amenities */}
                    {property.amenities?.length > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                            {property.amenities
                                .slice(0, 4)
                                .map((amenity, index) => {
                                    const icon = getAmenityIcon(amenity)
                                    return icon ? (
                                        <div
                                            key={index}
                                            className="p-1 bg-gray-100 rounded text-gray-600"
                                            title={amenity}
                                        >
                                            {icon}
                                        </div>
                                    ) : null
                                })}
                            {property.amenities.length > 4 && (
                                <span className="text-xs text-gray-500">
                                    +{property.amenities.length - 4} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xl font-bold text-gray-900">
                                {formatPrice(property.price)}
                            </span>
                            <span className="text-gray-600 text-sm ml-1">
                                / night
                            </span>
                        </div>

                        {/* Booking Status Indicator */}
                        {!property.isApproved || !property.isAvailable ? (
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {!property.isApproved
                                    ? "Under Review"
                                    : "Unavailable"}
                            </div>
                        ) : (
                            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                Available
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default PropertyCard
