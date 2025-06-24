import { Link } from "react-router-dom"
import {
    FaStar,
    FaHeart,
    FaRegHeart,
    FaBed,
    FaBath,
    FaUsers,
    FaAngleRight,
    FaCheck,
    FaClock,
    FaTimesCircle,
    FaCheckCircle,
    FaExclamationTriangle,
    FaRegCalendarAlt,
} from "react-icons/fa"
import { MdVerified, MdLocationOn } from "react-icons/md"
import { useAuth } from "../../context/AuthContext"
import { Card, Badge } from "../ui"
import { formatPrice } from "../../utils/currency"
import AvailabilityIndicator from "../property/AvailabilityIndicator"

/**
 * Enhanced Property card component with modern styling and animations
 * Supports both grid and list view modes
 */
const PropertyCard = ({ property, onToggleFavorite, viewMode = "grid" }) => {
    const { user, isAuthenticated } = useAuth()

    // Check if property is in user's favorites
    const isFavorite = user?.favorites?.includes(property._id)

    // Handle favorite toggle with improved event handling
    const handleFavoriteClick = (e) => {
        e.preventDefault()
        e.stopPropagation()

        // Add a small delay to ensure the event doesn't propagate
        setTimeout(() => {
            if (isAuthenticated && onToggleFavorite) {
                onToggleFavorite(property._id)
            }
        }, 10)
    }

    // Get random amenities for display
    const getRandomAmenities = () => {
        const allAmenities = property.amenities || []
        if (allAmenities.length <= 2) return allAmenities

        // Shuffle and get first 2
        return [...allAmenities].sort(() => 0.5 - Math.random()).slice(0, 2)
    }

    const randomAmenities = getRandomAmenities()

    // Get property creation date
    const getPropertyDate = () => {
        if (!property.createdAt) return ""
        const date = new Date(property.createdAt)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    // Grid View Card
    if (viewMode === "grid") {
        return (
            <Link
                to={`/properties/${property._id}`}
                className="group block"
                aria-label={`View details for ${property.title}`}
            >
                <Card
                    interactive
                    hoverable
                    className="overflow-hidden h-full bg-white border border-gray-100 hover:border-primary-200 transition-all duration-300 hover:shadow-xl"
                >
                    {/* Property Image - Enhanced with better transitions */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                            src={
                                property.images?.[0]
                                    ? typeof property.images[0] === "object"
                                        ? property.images[0].url
                                        : property.images[0]
                                    : "https://via.placeholder.com/400x300?text=No+Image"
                            }
                            alt={property.title}
                            className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-105"
                            loading="lazy"
                        />

                        {/* Favorite Button - Enhanced with better styling and interaction */}
                        {isAuthenticated && (
                            <button
                                onClick={handleFavoriteClick}
                                className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow-md hover:bg-white transition-all z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100 hover:border-primary-200 hover:scale-110"
                                aria-label={
                                    isFavorite
                                        ? "Remove from favorites"
                                        : "Add to favorites"
                                }
                            >
                                {isFavorite ? (
                                    <FaHeart className="text-primary-500 text-lg" />
                                ) : (
                                    <FaRegHeart className="text-secondary-400 text-lg group-hover:text-primary-500 transition-colors" />
                                )}
                            </button>
                        )}

                        {/* Property Type Badge - Enhanced with better styling */}
                        <Badge
                            variant="secondary"
                            className="absolute top-4 left-4 bg-secondary-900 text-white text-xs uppercase tracking-wider py-1.5 px-3 font-medium shadow-md border border-secondary-800"
                        >
                            {property.type}
                        </Badge>

                        {/* Price Badge - Enhanced with better styling */}
                        <div className="absolute bottom-4 left-4 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium shadow-md border border-primary-500">
                            {formatPrice(property.price)}
                            <span className="text-sm font-normal ml-1 text-white/90">
                                /{" "}
                                {property.pricePeriod === "night" ||
                                property.pricePeriod === "nightly"
                                    ? "night"
                                    : property.pricePeriod || "night"}
                            </span>
                        </div>

                        {/* Rating - Enhanced with better styling */}
                        {property.avgRating > 0 && (
                            <div className="absolute bottom-4 right-4 flex items-center bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-100">
                                <FaStar className="text-warning-500 mr-1.5" />
                                <span className="font-medium text-secondary-800">
                                    {property.avgRating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Property Details - Enhanced with better spacing and transitions */}
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-semibold text-secondary-900 line-clamp-1 group-hover:text-primary-600 transition-colors pr-2 tracking-tight">
                                {property.title}
                            </h3>

                            {/* Verified Badge - if property is verified */}
                            {property.isVerified && (
                                <div className="tooltip">
                                    <MdVerified className="text-primary-500 text-lg flex-shrink-0 animate-pulse-slow" />
                                    <span className="tooltip-text -mt-8 ml-2">
                                        Verified Property
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Location - Enhanced with better styling */}
                        <div className="flex items-center text-secondary-600 mb-4 bg-gray-50 px-3 py-1.5 rounded-lg -mx-1">
                            <MdLocationOn className="mr-2 text-primary-500 flex-shrink-0" />
                            <span className="text-sm line-clamp-1 font-medium">
                                {property.address?.city},{" "}
                                {property.address?.country}
                            </span>
                        </div>

                        {/* Availability Status */}
                        <div className="mb-4">
                            <AvailabilityIndicator
                                property={property}
                                variant="badge"
                                showActions={false}
                                className="shadow-sm"
                            />
                        </div>

                        {/* Amenities Preview */}
                        {randomAmenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {randomAmenities.map((amenity, index) => (
                                    <Badge
                                        key={index}
                                        variant="primary"
                                        className="flex items-center text-xs"
                                        icon={<FaCheck size={10} />}
                                    >
                                        {amenity}
                                    </Badge>
                                ))}
                                {property.amenities &&
                                    property.amenities.length > 2 && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            +{property.amenities.length - 2}{" "}
                                            more
                                        </Badge>
                                    )}
                            </div>
                        )}

                        {/* Property Features - Enhanced with better styling and visual appeal */}
                        <div className="flex items-center justify-between border-t border-secondary-100 pt-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-secondary-700 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                    <FaBed className="text-primary-500 mr-1.5" />
                                    <span className="text-sm font-medium">
                                        {property.bedrooms}
                                    </span>
                                </div>

                                <div className="flex items-center text-secondary-700 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                    <FaBath className="text-primary-500 mr-1.5" />
                                    <span className="text-sm font-medium">
                                        {property.bathrooms}
                                    </span>
                                </div>

                                <div className="flex items-center text-secondary-700 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                    <FaUsers className="text-primary-500 mr-1.5" />
                                    <span className="text-sm font-medium">
                                        {property.maxGuests}
                                    </span>
                                </div>
                            </div>

                            <span className="text-primary-600 font-medium text-sm flex items-center group-hover:text-primary-700 transition-colors">
                                Details{" "}
                                <FaAngleRight className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </div>
                    </div>

                    {/* View Details Button - Visible on Hover - Enhanced for smoother transition */}
                    <div className="absolute inset-0 bg-primary-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl pointer-events-none">
                        <span className="bg-white text-primary-600 font-medium py-3 px-6 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-primary-100">
                            View Property
                        </span>
                    </div>
                </Card>
            </Link>
        )
    }

    // List View Card
    return (
        <Link
            to={`/properties/${property._id}`}
            className="group block"
            aria-label={`View details for ${property.title}`}
        >
            <Card
                interactive
                hoverable
                className="overflow-hidden bg-white border border-gray-100 hover:border-primary-200 transition-all duration-300 hover:shadow-xl"
            >
                <div className="flex flex-col md:flex-row">
                    {/* Property Image - Enhanced with better transitions */}
                    <div className="relative md:w-1/3 aspect-[4/3] md:aspect-auto overflow-hidden">
                        <img
                            src={
                                property.images?.[0]
                                    ? typeof property.images[0] === "object"
                                        ? property.images[0].url
                                        : property.images[0]
                                    : "https://via.placeholder.com/400x300?text=No+Image"
                            }
                            alt={property.title}
                            className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-105"
                            loading="lazy"
                        />

                        {/* Favorite Button - Enhanced with better styling and interaction */}
                        {isAuthenticated && (
                            <button
                                onClick={handleFavoriteClick}
                                className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow-md hover:bg-white transition-all z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100 hover:border-primary-200 hover:scale-110"
                                aria-label={
                                    isFavorite
                                        ? "Remove from favorites"
                                        : "Add to favorites"
                                }
                            >
                                {isFavorite ? (
                                    <FaHeart className="text-primary-500 text-lg" />
                                ) : (
                                    <FaRegHeart className="text-secondary-400 text-lg group-hover:text-primary-500 transition-colors" />
                                )}
                            </button>
                        )}

                        {/* Property Type Badge - Enhanced with better styling */}
                        <Badge
                            variant="secondary"
                            className="absolute top-4 left-4 bg-secondary-900 text-white text-xs uppercase tracking-wider py-1.5 px-3 font-medium shadow-md border border-secondary-800"
                        >
                            {property.type}
                        </Badge>
                    </div>

                    {/* Property Details - Enhanced with better styling */}
                    <div className="p-6 md:w-2/3 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-semibold text-secondary-900 line-clamp-1 group-hover:text-primary-600 transition-colors tracking-tight">
                                        {property.title}
                                    </h3>
                                    {property.isVerified && (
                                        <MdVerified className="text-primary-500 text-lg flex-shrink-0 animate-pulse-slow" />
                                    )}
                                </div>

                                {/* Location - Enhanced with better styling */}
                                <div className="flex items-center text-secondary-600 mt-1 mb-2 bg-gray-50 px-2 py-1 rounded-lg inline-block">
                                    <MdLocationOn className="mr-1.5 text-primary-500 flex-shrink-0" />
                                    <span className="text-sm line-clamp-1 font-medium">
                                        {property.address?.city},{" "}
                                        {property.address?.country}
                                    </span>
                                </div>

                                {/* Availability Status */}
                                <AvailabilityIndicator
                                    property={property}
                                    variant="compact"
                                    showActions={false}
                                />
                            </div>

                            {/* Price - Enhanced with better styling */}
                            <div className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium shadow-md border border-primary-500">
                                {formatPrice(property.price)}
                                <span className="text-sm font-normal ml-1 text-white/90">
                                    /{" "}
                                    {property.pricePeriod === "night" ||
                                    property.pricePeriod === "nightly"
                                        ? "night"
                                        : property.pricePeriod || "night"}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 mt-2">
                            {property.description ||
                                "Beautiful property with modern amenities and convenient location."}
                        </p>

                        {/* Amenities and Features - Enhanced with better styling */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center text-secondary-700 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                <FaBed className="text-primary-500 mr-1.5" />
                                <span className="text-sm font-medium">
                                    {property.bedrooms}{" "}
                                    {property.bedrooms === 1
                                        ? "Bedroom"
                                        : "Bedrooms"}
                                </span>
                            </div>

                            <div className="flex items-center text-secondary-700 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                <FaBath className="text-primary-500 mr-1.5" />
                                <span className="text-sm font-medium">
                                    {property.bathrooms}{" "}
                                    {property.bathrooms === 1
                                        ? "Bathroom"
                                        : "Bathrooms"}
                                </span>
                            </div>

                            <div className="flex items-center text-secondary-700 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                <FaUsers className="text-primary-500 mr-1.5" />
                                <span className="text-sm font-medium">
                                    {property.maxGuests}{" "}
                                    {property.maxGuests === 1
                                        ? "Guest"
                                        : "Guests"}
                                </span>
                            </div>

                            {property.avgRating > 0 && (
                                <div className="flex items-center text-secondary-700 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                    <FaStar className="text-warning-500 mr-1.5" />
                                    <span className="text-sm font-medium">
                                        {property.avgRating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Bottom Section - Enhanced with better styling */}
                        <div className="mt-auto flex items-center justify-between border-t border-secondary-100 pt-4">
                            {/* Amenities Preview */}
                            <div className="flex flex-wrap gap-2">
                                {randomAmenities.map((amenity, index) => (
                                    <Badge
                                        key={index}
                                        variant="primary"
                                        className="flex items-center text-xs"
                                        icon={<FaCheck size={10} />}
                                    >
                                        {amenity}
                                    </Badge>
                                ))}
                                {property.amenities &&
                                    property.amenities.length > 2 && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            +{property.amenities.length - 2}{" "}
                                            more
                                        </Badge>
                                    )}
                            </div>

                            <div className="flex items-center gap-4">
                                {property.createdAt && (
                                    <div className="flex items-center text-secondary-500 text-xs">
                                        <FaRegCalendarAlt className="mr-1.5" />
                                        <span>{getPropertyDate()}</span>
                                    </div>
                                )}
                                <span className="text-primary-600 font-medium text-sm flex items-center group-hover:text-primary-700 transition-colors">
                                    View Details{" "}
                                    <FaAngleRight className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Details Button - Visible on Hover - Enhanced for smoother transition */}
                <div className="absolute inset-0 bg-primary-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl pointer-events-none">
                    <span className="bg-white text-primary-600 font-medium py-3 px-6 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-primary-100">
                        View Property
                    </span>
                </div>
            </Card>
        </Link>
    )
}

export default PropertyCard