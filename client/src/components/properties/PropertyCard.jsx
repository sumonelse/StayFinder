import { Link } from "react-router-dom"
import {
    FaStar,
    FaMapMarkerAlt,
    FaHeart,
    FaRegHeart,
    FaBed,
    FaBath,
    FaUsers,
    FaAngleRight,
    FaCheck,
    FaRegCalendarAlt,
} from "react-icons/fa"
import { MdVerified, MdLocationOn } from "react-icons/md"
import { useAuth } from "../../context/AuthContext"
import { Card, Badge } from "../ui"

/**
 * Enhanced Property card component with modern styling and animations
 * Supports both grid and list view modes
 */
const PropertyCard = ({ property, onToggleFavorite, viewMode = "grid" }) => {
    const { user, isAuthenticated } = useAuth()

    // Check if property is in user's favorites
    const isFavorite = user?.favorites?.includes(property._id)

    // Format price with currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(price)
    }

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
                    className="overflow-hidden h-full bg-white border border-gray-100 hover:border-primary-200 transition-all duration-300"
                >
                    {/* Property Image */}
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
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                        />

                        {/* Favorite Button */}
                        {isAuthenticated && (
                            <button
                                onClick={handleFavoriteClick}
                                className="absolute top-4 right-4 bg-white/90 p-2.5 rounded-full shadow-md hover:bg-white transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

                        {/* Property Type Badge */}
                        <Badge
                            variant="secondary"
                            className="absolute top-4 left-4 bg-secondary-900/80 backdrop-blur-sm text-white text-xs uppercase tracking-wider py-1.5 px-3 font-medium"
                        >
                            {property.type}
                        </Badge>

                        {/* Price Badge */}
                        <div className="absolute bottom-4 left-4 bg-primary-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium">
                            {formatPrice(property.price)}
                            <span className="text-sm font-normal ml-1 text-white/80">
                                /{" "}
                                {property.pricePeriod === "night" ||
                                property.pricePeriod === "nightly"
                                    ? "night"
                                    : property.pricePeriod || "month"}
                            </span>
                        </div>

                        {/* Rating */}
                        {property.avgRating > 0 && (
                            <div className="absolute bottom-4 right-4 flex items-center bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                                <FaStar className="text-warning-500 mr-1.5" />
                                <span className="font-medium text-secondary-800">
                                    {property.avgRating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-semibold text-secondary-900 line-clamp-1 group-hover:text-primary-600 transition-colors pr-2">
                                {property.title}
                            </h3>

                            {/* Verified Badge - if property is verified */}
                            {property.isVerified && (
                                <div className="tooltip">
                                    <MdVerified className="text-primary-500 text-lg flex-shrink-0" />
                                    <span className="tooltip-text -mt-8 ml-2">
                                        Verified Property
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-secondary-600 mb-4">
                            <MdLocationOn className="mr-2 text-primary-500 flex-shrink-0" />
                            <span className="text-sm line-clamp-1">
                                {property.address?.city},{" "}
                                {property.address?.country}
                            </span>
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

                        {/* Property Features */}
                        <div className="flex items-center justify-between border-t border-secondary-100 pt-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-secondary-600">
                                    <FaBed className="text-primary-500 mr-1.5" />
                                    <span className="text-sm">
                                        {property.bedrooms}
                                    </span>
                                </div>

                                <div className="flex items-center text-secondary-600">
                                    <FaBath className="text-primary-500 mr-1.5" />
                                    <span className="text-sm">
                                        {property.bathrooms}
                                    </span>
                                </div>

                                <div className="flex items-center text-secondary-600">
                                    <FaUsers className="text-primary-500 mr-1.5" />
                                    <span className="text-sm">
                                        {property.maxGuests}
                                    </span>
                                </div>
                            </div>

                            <span className="text-primary-600 font-medium text-sm flex items-center">
                                Details <FaAngleRight className="ml-1" />
                            </span>
                        </div>
                    </div>

                    {/* View Details Button - Visible on Hover - Optimized to prevent flickering */}
                    <div className="absolute inset-0 bg-primary-900/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none">
                        <span className="bg-white text-primary-600 font-medium py-3 px-6 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
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
                className="overflow-hidden bg-white border border-gray-100 hover:border-primary-200 transition-all duration-300"
            >
                <div className="flex flex-col md:flex-row">
                    {/* Property Image */}
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
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                        />

                        {/* Favorite Button */}
                        {isAuthenticated && (
                            <button
                                onClick={handleFavoriteClick}
                                className="absolute top-4 right-4 bg-white/90 p-2.5 rounded-full shadow-md hover:bg-white transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

                        {/* Property Type Badge */}
                        <Badge
                            variant="secondary"
                            className="absolute top-4 left-4 bg-secondary-900/80 backdrop-blur-sm text-white text-xs uppercase tracking-wider py-1.5 px-3 font-medium"
                        >
                            {property.type}
                        </Badge>
                    </div>

                    {/* Property Details */}
                    <div className="p-6 md:w-2/3 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-semibold text-secondary-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                        {property.title}
                                    </h3>
                                    {property.isVerified && (
                                        <MdVerified className="text-primary-500 text-lg flex-shrink-0" />
                                    )}
                                </div>

                                {/* Location */}
                                <div className="flex items-center text-secondary-600 mt-1">
                                    <MdLocationOn className="mr-1.5 text-primary-500 flex-shrink-0" />
                                    <span className="text-sm line-clamp-1">
                                        {property.address?.city},{" "}
                                        {property.address?.country}
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="bg-primary-600/90 text-white px-4 py-2 rounded-lg font-medium">
                                {formatPrice(property.price)}
                                <span className="text-sm font-normal ml-1 text-white/80">
                                    /{" "}
                                    {property.pricePeriod === "night" ||
                                    property.pricePeriod === "nightly"
                                        ? "night"
                                        : property.pricePeriod || "month"}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 mt-2">
                            {property.description ||
                                "Beautiful property with modern amenities and convenient location."}
                        </p>

                        {/* Amenities and Features */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center text-secondary-600">
                                <FaBed className="text-primary-500 mr-1.5" />
                                <span className="text-sm">
                                    {property.bedrooms}{" "}
                                    {property.bedrooms === 1
                                        ? "Bedroom"
                                        : "Bedrooms"}
                                </span>
                            </div>

                            <div className="flex items-center text-secondary-600">
                                <FaBath className="text-primary-500 mr-1.5" />
                                <span className="text-sm">
                                    {property.bathrooms}{" "}
                                    {property.bathrooms === 1
                                        ? "Bathroom"
                                        : "Bathrooms"}
                                </span>
                            </div>

                            <div className="flex items-center text-secondary-600">
                                <FaUsers className="text-primary-500 mr-1.5" />
                                <span className="text-sm">
                                    {property.maxGuests}{" "}
                                    {property.maxGuests === 1
                                        ? "Guest"
                                        : "Guests"}
                                </span>
                            </div>

                            {property.avgRating > 0 && (
                                <div className="flex items-center text-secondary-600">
                                    <FaStar className="text-warning-500 mr-1.5" />
                                    <span className="text-sm font-medium">
                                        {property.avgRating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Bottom Section */}
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
                                <span className="text-primary-600 font-medium text-sm flex items-center">
                                    View Details{" "}
                                    <FaAngleRight className="ml-1" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}

export default PropertyCard
