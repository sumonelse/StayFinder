import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import PropTypes from "prop-types"
import {
    FaStar,
    FaHeart,
    FaRegHeart,
    FaBed,
    FaBath,
    FaUsers,
    FaAngleRight,
    FaCheck,
    FaRegCalendarAlt,
    FaMapMarkerAlt,
    FaArrowLeft,
    FaArrowRight,
    FaShare,
} from "react-icons/fa"
import {
    MdVerified,
    MdLocationOn,
    MdHome,
    MdApartment,
    MdHotel,
    MdVilla,
} from "react-icons/md"
import { useAuth } from "../../context/AuthContext"
import { Card, Badge } from "../ui"
import { formatPrice } from "../../utils/currency"
import AvailabilityIndicator from "../property/AvailabilityIndicator"

/**
 * Enhanced Property card component with modern styling and animations
 * Supports both grid and list view modes with improved UX and accessibility
 */
const PropertyCard = ({
    property,
    onToggleFavorite,
    viewMode = "grid",
    isLoading = false,
}) => {
    const { user, isAuthenticated } = useAuth()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Check if property is in user's favorites
    // Ensure user has a favorites array
    const favorites = user?.favorites || []

    const isInFavorites = favorites.some(
        (favId) => String(favId) === String(property._id)
    )

    const isFavorite = property.isFavorite || isInFavorites

    // Reset image index when property changes
    useEffect(() => {
        setCurrentImageIndex(0)
        setImageError(false)
    }, [property._id])

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

    // Handle image navigation
    const handleNextImage = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (property.images && property.images.length > 1) {
            setCurrentImageIndex((prev) =>
                prev === property.images.length - 1 ? 0 : prev + 1
            )
        }
    }

    const handlePrevImage = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (property.images && property.images.length > 1) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? property.images.length - 1 : prev - 1
            )
        }
    }

    // Get property type icon
    const getPropertyTypeIcon = () => {
        const type = property.propertyType?.toLowerCase() || ""
        if (type.includes("apartment")) return <MdApartment size={14} />
        if (type.includes("hotel") || type.includes("room"))
            return <MdHotel size={14} />
        if (type.includes("villa") || type.includes("cottage"))
            return <MdVilla size={14} />
        return <MdHome size={14} />
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

    // Handle image error
    const handleImageError = () => {
        setImageError(true)
    }

    // Share property
    const handleShare = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (navigator.share) {
            navigator
                .share({
                    title: property.title,
                    text: `Check out this property: ${property.title}`,
                    url: window.location.origin + `/properties/${property._id}`,
                })
                .catch((err) => console.log("Error sharing", err))
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard
                .writeText(
                    window.location.origin + `/properties/${property._id}`
                )
                .then(() => {
                    alert("Link copied to clipboard!")
                })
        }
    }

    // Skeleton loading state
    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="overflow-hidden h-full transition-all duration-300">
                    {/* Image placeholder */}
                    <div className="relative aspect-[1/1] overflow-hidden rounded-xl bg-secondary-200"></div>

                    {/* Content placeholders */}
                    <div className="pt-3">
                        <div className="flex justify-between items-start">
                            <div className="w-2/3">
                                <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                                <div className="h-5 bg-secondary-200 rounded w-4/5"></div>
                            </div>
                            <div className="h-4 w-8 bg-secondary-200 rounded-full"></div>
                        </div>

                        <div className="mt-2">
                            <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                        </div>

                        <div className="mt-3">
                            <div className="h-6 bg-secondary-200 rounded w-1/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Grid View Card - Enhanced Airbnb Style
    if (viewMode === "grid") {
        return (
            <Link
                to={`/properties/${property._id}`}
                className="group block h-full"
                aria-label={`View details for ${property.title}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="overflow-hidden h-full transition-all duration-300 bg-white rounded-xl shadow-sm hover:shadow-md">
                    {/* Property Image Carousel - Enhanced */}
                    <div className="relative aspect-[1/1] overflow-hidden rounded-t-xl">
                        {/* Main Image with fallback */}
                        {!imageError ? (
                            <img
                                src={
                                    property.images?.[currentImageIndex]
                                        ? typeof property.images[
                                              currentImageIndex
                                          ] === "object"
                                            ? property.images[currentImageIndex]
                                                  .url
                                            : property.images[currentImageIndex]
                                        : "https://via.placeholder.com/400x300?text=No+Image"
                                }
                                alt={`${property.title} - Image ${
                                    currentImageIndex + 1
                                }`}
                                className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
                                loading="lazy"
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="w-full h-full bg-secondary-100 flex items-center justify-center">
                                <span className="text-secondary-400">
                                    No Image Available
                                </span>
                            </div>
                        )}

                        {/* Image Navigation Arrows - Only show on hover and if multiple images */}
                        {property.images &&
                            property.images.length > 1 &&
                            isHovered &&
                            !imageError && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition-colors z-10"
                                        aria-label="Previous image"
                                    >
                                        <FaArrowLeft
                                            size={12}
                                            className="text-secondary-800"
                                        />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition-colors z-10"
                                        aria-label="Next image"
                                    >
                                        <FaArrowRight
                                            size={12}
                                            className="text-secondary-800"
                                        />
                                    </button>
                                </>
                            )}

                        {/* Image Navigation Dots */}
                        {property.images &&
                            property.images.length > 1 &&
                            !imageError && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                    {Array.from({
                                        length: Math.min(
                                            5,
                                            property.images.length
                                        ),
                                    }).map((_, i) => (
                                        <span
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                i === currentImageIndex
                                                    ? "bg-white w-2.5"
                                                    : "bg-white/60"
                                            }`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setCurrentImageIndex(i)
                                            }}
                                            aria-label={`View image ${i + 1}`}
                                        ></span>
                                    ))}
                                </div>
                            )}

                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex space-x-2 z-10">
                            {/* Share Button */}
                            <button
                                onClick={handleShare}
                                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                                aria-label="Share property"
                            >
                                <FaShare
                                    className="text-secondary-600"
                                    size={14}
                                />
                            </button>

                            {/* Favorite Button */}
                            {isAuthenticated && (
                                <button
                                    onClick={handleFavoriteClick}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                                    aria-label={
                                        isFavorite
                                            ? "Remove from favorites"
                                            : "Add to favorites"
                                    }
                                >
                                    {isFavorite ? (
                                        <FaHeart
                                            className="text-red-500"
                                            size={16}
                                        />
                                    ) : (
                                        <FaRegHeart
                                            className="text-secondary-600"
                                            size={16}
                                        />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Property Type & Superhost Badge */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {/* Property Type Badge */}
                            {property.propertyType && (
                                <div className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center shadow-sm">
                                    {getPropertyTypeIcon()}
                                    <span className="ml-1">
                                        {property.propertyType}
                                    </span>
                                </div>
                            )}

                            {/* Superhost Badge - If property is verified */}
                            {property.isVerified && (
                                <div className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center shadow-sm">
                                    <MdVerified
                                        className="text-black mr-1"
                                        size={12}
                                    />
                                    <span>Superhost</span>
                                </div>
                            )}
                        </div>

                        {/* Distance info if available */}
                        {property.distance && (
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full shadow-sm">
                                <span className="font-medium">
                                    {property.distance} away
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Property Details - Enhanced */}
                    <div className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                {/* Location */}
                                <div className="flex items-center text-secondary-800 mb-1">
                                    <FaMapMarkerAlt
                                        className="text-secondary-500 mr-1"
                                        size={12}
                                    />
                                    <span className="text-sm font-medium line-clamp-1">
                                        {property.address?.city},{" "}
                                        {property.address?.country}
                                    </span>
                                </div>

                                {/* Property Title */}
                                <h3 className="text-base font-medium text-secondary-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                    {property.title}
                                </h3>
                            </div>

                            {/* Rating */}
                            {property.avgRating > 0 && (
                                <div className="flex items-center bg-secondary-50 px-2 py-1 rounded-full">
                                    <FaStar
                                        className="text-yellow-500 mr-1"
                                        size={12}
                                    />
                                    <span className="font-medium text-secondary-900 text-sm">
                                        {property.avgRating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Property Features */}
                        <div className="mt-2 text-secondary-600 text-sm">
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

                        {/* Amenities Preview */}
                        {randomAmenities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-x-2 text-xs text-secondary-500">
                                {randomAmenities.map((amenity, index) => (
                                    <span
                                        key={index}
                                        className="flex items-center"
                                    >
                                        {index > 0 && (
                                            <span className="mr-2">·</span>
                                        )}
                                        <FaCheck className="mr-1" size={10} />
                                        {amenity}
                                    </span>
                                ))}
                                {property.amenities &&
                                    property.amenities.length > 2 && (
                                        <span className="flex items-center">
                                            <span className="mr-2">·</span>+
                                            {property.amenities.length - 2} more
                                        </span>
                                    )}
                            </div>
                        )}

                        {/* Price */}
                        <div className="mt-3">
                            <div className="flex items-baseline">
                                <span className="font-semibold text-secondary-900">
                                    {formatPrice(property.price)}
                                </span>
                                <span className="text-secondary-600 ml-1 text-sm">
                                    /{" "}
                                    {property.pricePeriod === "night" ||
                                    property.pricePeriod === "nightly"
                                        ? "night"
                                        : property.pricePeriod || "night"}
                                </span>
                            </div>
                        </div>

                        {/* Availability Status */}
                        {property.availability && (
                            <div className="mt-2">
                                <AvailabilityIndicator
                                    availability={property.availability}
                                    compact={true}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        )
    }

    // List View Card - Enhanced Airbnb Style
    return (
        <Link
            to={`/properties/${property._id}`}
            className="group block"
            aria-label={`View details for ${property.title}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="overflow-hidden bg-white border border-secondary-100 rounded-xl shadow-sm my-4 transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col md:flex-row">
                    {/* Property Image - Enhanced */}
                    <div className="relative md:w-1/3 aspect-[4/3] md:aspect-square overflow-hidden md:rounded-l-xl">
                        {/* Main Image with fallback */}
                        {!imageError ? (
                            <img
                                src={
                                    property.images?.[currentImageIndex]
                                        ? typeof property.images[
                                              currentImageIndex
                                          ] === "object"
                                            ? property.images[currentImageIndex]
                                                  .url
                                            : property.images[currentImageIndex]
                                        : "https://via.placeholder.com/400x300?text=No+Image"
                                }
                                alt={`${property.title} - Image ${
                                    currentImageIndex + 1
                                }`}
                                className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
                                loading="lazy"
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="w-full h-full bg-secondary-100 flex items-center justify-center">
                                <span className="text-secondary-400">
                                    No Image Available
                                </span>
                            </div>
                        )}

                        {/* Image Navigation Arrows - Only show on hover and if multiple images */}
                        {property.images &&
                            property.images.length > 1 &&
                            isHovered &&
                            !imageError && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition-colors z-10"
                                        aria-label="Previous image"
                                    >
                                        <FaArrowLeft
                                            size={12}
                                            className="text-secondary-800"
                                        />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition-colors z-10"
                                        aria-label="Next image"
                                    >
                                        <FaArrowRight
                                            size={12}
                                            className="text-secondary-800"
                                        />
                                    </button>
                                </>
                            )}

                        {/* Image Navigation Dots */}
                        {property.images &&
                            property.images.length > 1 &&
                            !imageError && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                    {Array.from({
                                        length: Math.min(
                                            5,
                                            property.images.length
                                        ),
                                    }).map((_, i) => (
                                        <span
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                i === currentImageIndex
                                                    ? "bg-white w-2.5"
                                                    : "bg-white/60"
                                            }`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setCurrentImageIndex(i)
                                            }}
                                            aria-label={`View image ${i + 1}`}
                                        ></span>
                                    ))}
                                </div>
                            )}

                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex space-x-2 z-10">
                            {/* Share Button */}
                            <button
                                onClick={handleShare}
                                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                                aria-label="Share property"
                            >
                                <FaShare
                                    className="text-secondary-600"
                                    size={14}
                                />
                            </button>

                            {/* Favorite Button */}
                            {isAuthenticated && (
                                <button
                                    onClick={handleFavoriteClick}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                                    aria-label={
                                        isFavorite
                                            ? "Remove from favorites"
                                            : "Add to favorites"
                                    }
                                >
                                    {isFavorite ? (
                                        <FaHeart
                                            className="text-red-500"
                                            size={16}
                                        />
                                    ) : (
                                        <FaRegHeart
                                            className="text-secondary-600"
                                            size={16}
                                        />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Property Type & Superhost Badge */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {/* Property Type Badge */}
                            {property.propertyType && (
                                <div className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center shadow-sm">
                                    {getPropertyTypeIcon()}
                                    <span className="ml-1">
                                        {property.propertyType}
                                    </span>
                                </div>
                            )}

                            {/* Superhost Badge - If property is verified */}
                            {property.isVerified && (
                                <div className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center shadow-sm">
                                    <MdVerified
                                        className="text-black mr-1"
                                        size={12}
                                    />
                                    <span>Superhost</span>
                                </div>
                            )}
                        </div>

                        {/* Distance info if available */}
                        {property.distance && (
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full shadow-sm">
                                <span className="font-medium">
                                    {property.distance} away
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Property Details - Enhanced */}
                    <div className="md:w-2/3 flex flex-col p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                {/* Location */}
                                <div className="flex items-center text-secondary-800 mb-1">
                                    <FaMapMarkerAlt
                                        className="text-secondary-500 mr-1"
                                        size={12}
                                    />
                                    <span className="text-sm font-medium line-clamp-1">
                                        {property.address?.city},{" "}
                                        {property.address?.country}
                                    </span>
                                </div>

                                {/* Property Title */}
                                <h3 className="text-xl font-medium text-secondary-900 mb-1 group-hover:text-primary-600 transition-colors">
                                    {property.title}
                                </h3>

                                {/* Separator Line */}
                                <div className="w-16 h-0.5 bg-secondary-200 my-2 rounded-full"></div>

                                {/* Property Features */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-secondary-600 text-sm mt-2">
                                    <div className="flex items-center">
                                        <FaBed className="mr-1.5" size={14} />
                                        <span>
                                            {property.bedrooms}{" "}
                                            {property.bedrooms === 1
                                                ? "bed"
                                                : "beds"}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <FaBath className="mr-1.5" size={14} />
                                        <span>
                                            {property.bathrooms}{" "}
                                            {property.bathrooms === 1
                                                ? "bath"
                                                : "baths"}
                                        </span>
                                    </div>

                                    {property.maxGuests && (
                                        <div className="flex items-center">
                                            <FaUsers
                                                className="mr-1.5"
                                                size={14}
                                            />
                                            <span>
                                                {property.maxGuests}{" "}
                                                {property.maxGuests === 1
                                                    ? "guest"
                                                    : "guests"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rating */}
                            {property.avgRating > 0 && (
                                <div className="flex items-center bg-secondary-50 px-2 py-1 rounded-full">
                                    <FaStar
                                        className="text-yellow-500 mr-1"
                                        size={14}
                                    />
                                    <span className="font-medium text-secondary-900">
                                        {property.avgRating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-secondary-600 text-sm line-clamp-2 mt-3">
                            {property.description ||
                                "Experience this beautiful property in a prime location with all the amenities you need for a comfortable stay."}
                        </p>

                        {/* Amenities Preview */}
                        {property.amenities &&
                            property.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                                    {property.amenities
                                        .slice(0, 4)
                                        .map((amenity, index) => (
                                            <span
                                                key={index}
                                                className="text-secondary-600 text-sm flex items-center"
                                            >
                                                <FaCheck
                                                    className="text-green-500 mr-1.5"
                                                    size={12}
                                                />
                                                {amenity}
                                            </span>
                                        ))}
                                    {property.amenities.length > 4 && (
                                        <span className="text-secondary-600 text-sm">
                                            +{property.amenities.length - 4}{" "}
                                            more
                                        </span>
                                    )}
                                </div>
                            )}

                        {/* Bottom Section with Price and Availability */}
                        <div className="mt-auto pt-4 flex flex-wrap items-center justify-between">
                            {/* Price */}
                            <div className="flex items-baseline">
                                <span className="font-semibold text-secondary-900 text-xl">
                                    {formatPrice(property.price)}
                                </span>
                                <span className="text-secondary-600 ml-1 text-sm">
                                    /{" "}
                                    {property.pricePeriod === "night" ||
                                    property.pricePeriod === "nightly"
                                        ? "night"
                                        : property.pricePeriod || "night"}
                                </span>
                            </div>

                            {/* Availability Status */}
                            {property.availability && (
                                <div>
                                    <AvailabilityIndicator
                                        availability={property.availability}
                                        compact={true}
                                    />
                                </div>
                            )}

                            {/* Creation Date */}
                            {property.createdAt && (
                                <div className="text-xs text-secondary-500 flex items-center mt-2 md:mt-0">
                                    <FaRegCalendarAlt
                                        className="mr-1"
                                        size={12}
                                    />
                                    Listed on {getPropertyDate()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

PropertyCard.propTypes = {
    property: PropTypes.object.isRequired,
    onToggleFavorite: PropTypes.func,
    viewMode: PropTypes.oneOf(["grid", "list"]),
    isLoading: PropTypes.bool,
}

export default PropertyCard
