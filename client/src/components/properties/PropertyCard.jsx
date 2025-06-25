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

    // Grid View Card - Airbnb Style
    if (viewMode === "grid") {
        return (
            <Link
                to={`/properties/${property._id}`}
                className="group block"
                aria-label={`View details for ${property.title}`}
            >
                <div className="overflow-hidden h-full transition-all duration-300">
                    {/* Property Image Carousel - Airbnb Style */}
                    <div className="relative aspect-[1/1] overflow-hidden rounded-xl">
                        {/* Main Image */}
                        <img
                            src={
                                property.images?.[0]
                                    ? typeof property.images[0] === "object"
                                        ? property.images[0].url
                                        : property.images[0]
                                    : "https://via.placeholder.com/400x300?text=No+Image"
                            }
                            alt={property.title}
                            className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
                            loading="lazy"
                        />

                        {/* Image Navigation Dots */}
                        {property.images && property.images.length > 1 && (
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                {Array.from({
                                    length: Math.min(5, property.images.length),
                                }).map((_, i) => (
                                    <span
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            i === 0 ? "bg-white" : "bg-white/60"
                                        }`}
                                    ></span>
                                ))}
                            </div>
                        )}

                        {/* Favorite Button - Airbnb Style */}
                        {isAuthenticated && (
                            <button
                                onClick={handleFavoriteClick}
                                className="absolute top-3 right-3 p-2 rounded-full z-10 focus:outline-none transition-transform hover:scale-110"
                                aria-label={
                                    isFavorite
                                        ? "Remove from favorites"
                                        : "Add to favorites"
                                }
                            >
                                {isFavorite ? (
                                    <FaHeart className="text-red-500 text-xl drop-shadow-sm" />
                                ) : (
                                    <FaRegHeart className="text-white text-xl drop-shadow-sm" />
                                )}
                            </button>
                        )}

                        {/* Superhost Badge - If property is verified */}
                        {property.isVerified && (
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center shadow-sm">
                                <MdVerified
                                    className="text-black mr-1"
                                    size={12}
                                />
                                <span>Superhost</span>
                            </div>
                        )}
                    </div>

                    {/* Property Details - Airbnb Style */}
                    <div className="pt-3">
                        <div className="flex justify-between items-start">
                            <div>
                                {/* Location */}
                                <div className="flex items-center text-gray-800 mb-1">
                                    <span className="text-sm font-medium line-clamp-1">
                                        {property.address?.city},{" "}
                                        {property.address?.country}
                                    </span>
                                </div>

                                {/* Property Title */}
                                <h3 className="text-base text-gray-500 line-clamp-1">
                                    {property.title}
                                </h3>
                            </div>

                            {/* Rating */}
                            {property.avgRating > 0 && (
                                <div className="flex items-center">
                                    <FaStar
                                        className="text-black mr-1"
                                        size={12}
                                    />
                                    <span className="font-medium text-gray-900">
                                        {property.avgRating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Property Features - Airbnb Style */}
                        <div className="mt-1 text-gray-500 text-sm">
                            <span>
                                {property.bedrooms}{" "}
                                {property.bedrooms === 1 ? "bed" : "beds"}
                            </span>
                            <span className="mx-1">·</span>
                            <span>
                                {property.bathrooms}{" "}
                                {property.bathrooms === 1 ? "bath" : "baths"}
                            </span>
                            {property.maxGuests && (
                                <>
                                    <span className="mx-1">·</span>
                                    <span>
                                        {property.maxGuests}{" "}
                                        {property.maxGuests === 1
                                            ? "guest"
                                            : "guests"}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Price - Airbnb Style */}
                        <div className="mt-2">
                            <div className="flex items-baseline">
                                <span className="font-semibold text-gray-900">
                                    {formatPrice(property.price)}
                                </span>
                                <span className="text-gray-600 ml-1 text-sm">
                                    /{" "}
                                    {property.pricePeriod === "night" ||
                                    property.pricePeriod === "nightly"
                                        ? "night"
                                        : property.pricePeriod || "night"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        )
    }

    // List View Card - Airbnb Style
    return (
        <Link
            to={`/properties/${property._id}`}
            className="group block"
            aria-label={`View details for ${property.title}`}
        >
            <div className="overflow-hidden bg-white border-b border-gray-100 py-6 transition-all duration-300 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Property Image - Airbnb Style */}
                    <div className="relative md:w-1/3 aspect-[4/3] md:aspect-square overflow-hidden rounded-xl">
                        {/* Main Image */}
                        <img
                            src={
                                property.images?.[0]
                                    ? typeof property.images[0] === "object"
                                        ? property.images[0].url
                                        : property.images[0]
                                    : "https://via.placeholder.com/400x300?text=No+Image"
                            }
                            alt={property.title}
                            className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
                            loading="lazy"
                        />

                        {/* Image Navigation Dots */}
                        {property.images && property.images.length > 1 && (
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                {Array.from({
                                    length: Math.min(5, property.images.length),
                                }).map((_, i) => (
                                    <span
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            i === 0 ? "bg-white" : "bg-white/60"
                                        }`}
                                    ></span>
                                ))}
                            </div>
                        )}

                        {/* Favorite Button - Airbnb Style */}
                        {isAuthenticated && (
                            <button
                                onClick={handleFavoriteClick}
                                className="absolute top-3 right-3 p-2 rounded-full z-10 focus:outline-none transition-transform hover:scale-110"
                                aria-label={
                                    isFavorite
                                        ? "Remove from favorites"
                                        : "Add to favorites"
                                }
                            >
                                {isFavorite ? (
                                    <FaHeart className="text-red-500 text-xl drop-shadow-sm" />
                                ) : (
                                    <FaRegHeart className="text-white text-xl drop-shadow-sm" />
                                )}
                            </button>
                        )}

                        {/* Superhost Badge - If property is verified */}
                        {property.isVerified && (
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center shadow-sm">
                                <MdVerified
                                    className="text-black mr-1"
                                    size={12}
                                />
                                <span>Superhost</span>
                            </div>
                        )}
                    </div>

                    {/* Property Details - Airbnb Style */}
                    <div className="md:w-2/3 flex flex-col">
                        <div className="flex justify-between items-start">
                            <div>
                                {/* Location */}
                                <div className="flex items-center text-gray-800 mb-1">
                                    <span className="text-sm font-medium line-clamp-1">
                                        {property.address?.city},{" "}
                                        {property.address?.country}
                                    </span>
                                </div>

                                {/* Property Title */}
                                <h3 className="text-xl font-medium text-gray-900 mb-1">
                                    {property.title}
                                </h3>

                                {/* Separator Line */}
                                <div className="w-12 h-px bg-gray-200 my-2"></div>

                                {/* Property Features - Airbnb Style */}
                                <div className="text-gray-500 text-sm">
                                    <span>
                                        {property.bedrooms}{" "}
                                        {property.bedrooms === 1
                                            ? "bed"
                                            : "beds"}
                                    </span>
                                    <span className="mx-1">·</span>
                                    <span>
                                        {property.bathrooms}{" "}
                                        {property.bathrooms === 1
                                            ? "bath"
                                            : "baths"}
                                    </span>
                                    {property.maxGuests && (
                                        <>
                                            <span className="mx-1">·</span>
                                            <span>
                                                {property.maxGuests}{" "}
                                                {property.maxGuests === 1
                                                    ? "guest"
                                                    : "guests"}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Rating */}
                            {property.avgRating > 0 && (
                                <div className="flex items-center">
                                    <FaStar
                                        className="text-black mr-1"
                                        size={14}
                                    />
                                    <span className="font-medium text-gray-900">
                                        {property.avgRating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mt-3">
                            {property.description ||
                                "Experience this beautiful property in a prime location with all the amenities you need for a comfortable stay."}
                        </p>

                        {/* Amenities Preview */}
                        {randomAmenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {randomAmenities.map((amenity, index) => (
                                    <span
                                        key={index}
                                        className="text-gray-600 text-sm"
                                    >
                                        {index > 0 && (
                                            <span className="mr-2">·</span>
                                        )}
                                        {amenity}
                                    </span>
                                ))}
                                {property.amenities &&
                                    property.amenities.length > 2 && (
                                        <span className="text-gray-600 text-sm">
                                            <span className="mr-2">·</span>+
                                            {property.amenities.length - 2} more
                                        </span>
                                    )}
                            </div>
                        )}

                        {/* Price - Airbnb Style */}
                        <div className="mt-auto pt-3">
                            <div className="flex items-baseline">
                                <span className="font-semibold text-gray-900">
                                    {formatPrice(property.price)}
                                </span>
                                <span className="text-gray-600 ml-1 text-sm">
                                    /{" "}
                                    {property.pricePeriod === "night" ||
                                    property.pricePeriod === "nightly"
                                        ? "night"
                                        : property.pricePeriod || "night"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default PropertyCard
