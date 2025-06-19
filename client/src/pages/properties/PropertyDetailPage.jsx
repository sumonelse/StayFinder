import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
    FaStar,
    FaMapMarkerAlt,
    FaUser,
    FaBed,
    FaBath,
    FaUsers,
    FaCalendarAlt,
    FaHeart,
    FaRegHeart,
    FaArrowLeft,
    FaWifi,
    FaSwimmingPool,
    FaParking,
    FaSnowflake,
    FaCoffee,
    FaTv,
    FaCheck,
    FaShare,
    FaExclamationCircle,
    FaShieldAlt,
} from "react-icons/fa"
import { propertyService, reviewService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import ImageGallery from "../../components/property/ImageGallery"
import ShareModal from "../../components/property/ShareModal"

/**
 * Enhanced Property detail page component
 * Displays detailed information about a property with modern UI and improved user experience
 */
const PropertyDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated, addToFavorites, removeFromFavorites } =
        useAuth()
    const [showAllAmenities, setShowAllAmenities] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Get amenity icon
    const getAmenityIcon = (amenity) => {
        const amenityLower = amenity.toLowerCase()
        if (amenityLower.includes("wifi")) return <FaWifi />
        if (amenityLower.includes("pool")) return <FaSwimmingPool />
        if (amenityLower.includes("parking")) return <FaParking />
        if (amenityLower.includes("air") || amenityLower.includes("ac"))
            return <FaSnowflake />
        if (
            amenityLower.includes("coffee") ||
            amenityLower.includes("breakfast")
        )
            return <FaCoffee />
        if (amenityLower.includes("tv") || amenityLower.includes("television"))
            return <FaTv />
        return <FaCheck />
    }

    // Fetch property details
    const {
        data: property,
        isLoading: propertyLoading,
        isError: propertyError,
    } = useQuery({
        queryKey: ["property", id],
        queryFn: () => propertyService.getPropertyById(id),
    })

    // Fetch property reviews
    const {
        data: reviewsData,
        isLoading: reviewsLoading,
        isError: reviewsError,
    } = useQuery({
        queryKey: ["propertyReviews", id],
        queryFn: () => reviewService.getPropertyReviews(id, { limit: 5 }),
        enabled: !!id,
    })

    // Check if property is in user's favorites
    const isFavorite = user?.favorites?.includes(id)

    // Handle favorite toggle
    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: `/properties/${id}` } })
            return
        }

        try {
            if (isFavorite) {
                await removeFromFavorites(id)
            } else {
                await addToFavorites(id)
            }
        } catch (err) {
            console.error("Error toggling favorite:", err)
        }
    }

    // Format price with currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(price)
    }

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    // Loading state
    if (propertyLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="flex items-center mb-8">
                        <div className="h-10 w-10 bg-secondary-200 rounded-full mr-4"></div>
                        <div className="h-8 bg-secondary-200 rounded-xl w-1/3"></div>
                    </div>

                    <div className="h-[500px] bg-secondary-200 rounded-2xl mb-8"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="h-10 bg-secondary-200 rounded-xl w-2/3 mb-6"></div>
                            <div className="h-4 bg-secondary-200 rounded-lg w-full mb-4"></div>
                            <div className="h-4 bg-secondary-200 rounded-lg w-full mb-4"></div>
                            <div className="h-4 bg-secondary-200 rounded-lg w-3/4 mb-8"></div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-24 bg-secondary-200 rounded-xl"
                                    ></div>
                                ))}
                            </div>

                            <div className="h-8 bg-secondary-200 rounded-xl w-1/4 mb-4"></div>
                            <div className="h-32 bg-secondary-200 rounded-xl mb-8"></div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="h-[400px] bg-secondary-200 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (propertyError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 text-red-700 p-6 rounded-xl mb-8 flex items-center">
                    <div className="bg-red-200 p-3 rounded-full mr-4">
                        <FaExclamationCircle
                            className="text-red-600"
                            size={24}
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">
                            Error loading property
                        </h3>
                        <p>
                            We couldn't load the property details. Please try
                            again later.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-primary flex items-center"
                >
                    <FaArrowLeft className="mr-2" />
                    <span>Go back</span>
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back button and title */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <div className="animate-fadeIn">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-primary-600 hover:text-primary-800 mb-3 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        <span className="font-medium">Back to search</span>
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-3">
                        {property.title}
                    </h1>

                    {/* Location and quick info */}
                    <div className="flex flex-wrap items-center text-secondary-700 mb-2">
                        <div className="flex items-center mr-4">
                            <FaMapMarkerAlt className="text-primary-500 mr-2" />
                            <span>
                                {property.address.city},{" "}
                                {property.address.state},{" "}
                                {property.address.country}
                            </span>
                        </div>

                        {property.avgRating > 0 && (
                            <div className="flex items-center mr-4">
                                <FaStar className="text-yellow-500 mr-1" />
                                <span className="font-medium">
                                    {property.avgRating.toFixed(1)}
                                </span>
                                <span className="text-secondary-600 ml-1">
                                    ({property.reviewCount} reviews)
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center mt-3 md:mt-0 space-x-2 animate-fadeIn animation-delay-200">
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center bg-white px-3 py-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors shadow-sm"
                        aria-label="Share property"
                    >
                        <FaShare className="text-secondary-600 mr-2" />
                        <span>Share</span>
                    </button>

                    <button
                        onClick={handleToggleFavorite}
                        className={`flex items-center px-3 py-2 rounded-lg border transition-all shadow-sm ${
                            isFavorite
                                ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                : "bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50"
                        }`}
                    >
                        {isFavorite ? (
                            <>
                                <FaHeart className="text-red-500 mr-2" />
                                <span>Saved</span>
                            </>
                        ) : (
                            <>
                                <FaRegHeart className="text-secondary-600 mr-2" />
                                <span>Save</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Property images */}
            <ImageGallery
                images={property?.images || []}
                alt={property?.title || "Property"}
            />

            {/* Share modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title={property?.title || "Property"}
                url={window.location.href}
            />

            {/* Property details and booking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Property details */}
                <div className="lg:col-span-2 animate-fadeIn animation-delay-200">
                    {/* Property highlights */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl border border-secondary-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <FaUsers
                                className="text-primary-500 mb-2"
                                size={20}
                            />
                            <span className="text-secondary-600 text-sm">
                                Guests
                            </span>
                            <span className="font-semibold text-secondary-900">
                                {property.maxGuests}
                            </span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-secondary-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <FaBed
                                className="text-primary-500 mb-2"
                                size={20}
                            />
                            <span className="text-secondary-600 text-sm">
                                Bedrooms
                            </span>
                            <span className="font-semibold text-secondary-900">
                                {property.bedrooms}
                            </span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-secondary-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <FaBath
                                className="text-primary-500 mb-2"
                                size={20}
                            />
                            <span className="text-secondary-600 text-sm">
                                Bathrooms
                            </span>
                            <span className="font-semibold text-secondary-900">
                                {property.bathrooms}
                            </span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-secondary-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <FaUser
                                className="text-primary-500 mb-2"
                                size={20}
                            />
                            <span className="text-secondary-600 text-sm">
                                Host
                            </span>
                            <span className="font-semibold text-secondary-900">
                                {property.host?.name?.split(" ")[0] || "Host"}
                            </span>
                        </div>
                    </div>

                    {/* Property description */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-secondary-900">
                            About this place
                        </h2>
                        <div className="text-secondary-700 space-y-4">
                            <p>{property.description}</p>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-secondary-900">
                            What this place offers
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                            {(showAllAmenities
                                ? property.amenities
                                : property.amenities.slice(0, 8)
                            ).map((amenity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center text-secondary-700"
                                >
                                    <span className="mr-3 text-primary-500">
                                        {getAmenityIcon(amenity)}
                                    </span>
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>

                        {property.amenities.length > 8 && (
                            <button
                                onClick={() =>
                                    setShowAllAmenities(!showAllAmenities)
                                }
                                className="mt-4 text-primary-600 hover:text-primary-800 font-medium flex items-center"
                            >
                                <span>
                                    {showAllAmenities
                                        ? "Show less"
                                        : `Show all ${property.amenities.length} amenities`}
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Location */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-secondary-900">
                            Location
                        </h2>
                        <div className="bg-secondary-100 rounded-xl h-[300px] flex items-center justify-center">
                            <div className="text-center text-secondary-600">
                                <FaMapMarkerAlt
                                    className="mx-auto mb-2 text-primary-500"
                                    size={24}
                                />
                                <p>
                                    {property.address.street},{" "}
                                    {property.address.city},{" "}
                                    {property.address.state},{" "}
                                    {property.address.zipCode},{" "}
                                    {property.address.country}
                                </p>
                                <p className="mt-2 text-sm">
                                    Exact location provided after booking
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold text-secondary-900">
                                <span className="flex items-center">
                                    <FaStar className="text-yellow-500 mr-2" />
                                    {property.avgRating
                                        ? `${property.avgRating.toFixed(1)} · ${
                                              property.reviewCount
                                          } reviews`
                                        : "No reviews yet"}
                                </span>
                            </h2>
                            {property.reviewCount > 0 && (
                                <Link
                                    to={`/properties/${id}/reviews`}
                                    className="text-primary-600 hover:text-primary-800 font-medium"
                                >
                                    See all reviews
                                </Link>
                            )}
                        </div>

                        {reviewsLoading ? (
                            <div className="animate-pulse space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex">
                                        <div className="h-10 w-10 bg-secondary-200 rounded-full mr-4"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-secondary-200 rounded w-1/4 mb-2"></div>
                                            <div className="h-4 bg-secondary-200 rounded w-full"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : reviewsError ? (
                            <div className="text-secondary-600">
                                Failed to load reviews.
                            </div>
                        ) : reviewsData?.reviews?.length > 0 ? (
                            <div className="space-y-6">
                                {reviewsData.reviews.map((review) => (
                                    <div
                                        key={review._id}
                                        className="animate-fadeIn"
                                    >
                                        <div className="flex items-start mb-2">
                                            <div className="mr-3">
                                                {review.user?.profilePicture ? (
                                                    <img
                                                        src={
                                                            review.user
                                                                .profilePicture
                                                        }
                                                        alt={review.user.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                                                        <span className="font-medium">
                                                            {review.user?.name
                                                                ?.charAt(0)
                                                                .toUpperCase() ||
                                                                "G"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-secondary-900">
                                                    {review.user?.name ||
                                                        "Guest"}
                                                </div>
                                                <div className="text-secondary-500 text-sm">
                                                    {formatDate(
                                                        review.createdAt
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center mb-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={
                                                            i < review.rating
                                                                ? "text-yellow-500"
                                                                : "text-secondary-300"
                                                        }
                                                        size={14}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-secondary-700">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-secondary-600">
                                No reviews yet. Be the first to leave a review!
                            </div>
                        )}
                    </div>

                    {/* Host information */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-secondary-900">
                            Hosted by {property.host?.name || "Host"}
                        </h2>
                        <div className="flex items-start">
                            <div className="mr-4">
                                {property.host?.profilePicture ? (
                                    <img
                                        src={property.host.profilePicture}
                                        alt={property.host.name}
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-16 w-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                                        <span className="font-medium text-xl">
                                            {property.host?.name
                                                ?.charAt(0)
                                                .toUpperCase() || "H"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="text-secondary-700 mb-2">
                                    <span className="font-medium">
                                        Member since:{" "}
                                    </span>
                                    {property.host?.createdAt
                                        ? formatDate(property.host.createdAt)
                                        : "N/A"}
                                </div>
                                <Link
                                    to={`/users/${property.host?._id}`}
                                    className="text-primary-600 hover:text-primary-800 font-medium"
                                >
                                    View profile
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* House rules */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-secondary-900">
                            House rules
                        </h2>
                        <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center text-secondary-700">
                                    <FaCalendarAlt className="text-primary-500 mr-3" />
                                    <div>
                                        <div className="font-medium">
                                            Check-in
                                        </div>
                                        <div>After 3:00 PM</div>
                                    </div>
                                </div>
                                <div className="flex items-center text-secondary-700">
                                    <FaCalendarAlt className="text-primary-500 mr-3" />
                                    <div>
                                        <div className="font-medium">
                                            Checkout
                                        </div>
                                        <div>Before 11:00 AM</div>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4 border-secondary-100" />

                            <div className="text-secondary-700">
                                <h3 className="font-medium mb-2">
                                    Additional rules
                                </h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>No smoking</li>
                                    <li>No parties or events</li>
                                    <li>Pets allowed (with restrictions)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation policy */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-secondary-900">
                            Cancellation policy
                        </h2>
                        <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm">
                            <p className="text-secondary-700 mb-4">
                                Free cancellation for 48 hours. After that,
                                cancel before check-in and get a 50% refund,
                                minus the service fee.
                            </p>
                            <div className="flex items-center text-secondary-700">
                                <FaShieldAlt className="text-primary-500 mr-2" />
                                <span>
                                    Review the host's full cancellation policy
                                    which applies even if you cancel for illness
                                    or disruptions caused by COVID-19.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column - Booking card */}
                <div className="lg:col-span-1 animate-fadeIn animation-delay-300">
                    <div className="sticky top-8">
                        <div className="bg-white rounded-xl shadow-md border border-secondary-100 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-baseline justify-between mb-4">
                                    <div>
                                        <span className="text-2xl font-bold text-secondary-900">
                                            {formatPrice(property.price)}
                                        </span>
                                        <span className="text-secondary-600">
                                            {" "}
                                            / night
                                        </span>
                                    </div>
                                    {property.avgRating > 0 && (
                                        <div className="flex items-center">
                                            <FaStar className="text-yellow-500 mr-1" />
                                            <span className="font-medium">
                                                {property.avgRating.toFixed(1)}
                                            </span>
                                            <span className="text-secondary-600 ml-1">
                                                ({property.reviewCount})
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    to={`/bookings/new?propertyId=${id}`}
                                    className="btn btn-primary w-full mb-4"
                                >
                                    Book now
                                </Link>

                                <div className="text-center text-secondary-600 text-sm mb-4">
                                    You won't be charged yet
                                </div>

                                <div className="space-y-3 text-secondary-700">
                                    <div className="flex justify-between">
                                        <span>
                                            {formatPrice(property.price)} x 5
                                            nights
                                        </span>
                                        <span>
                                            {formatPrice(property.price * 5)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Cleaning fee</span>
                                        <span>
                                            {formatPrice(
                                                property.cleaningFee || 0
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Service fee</span>
                                        <span>
                                            {formatPrice(
                                                property.serviceFee ||
                                                    Math.round(
                                                        property.price *
                                                            5 *
                                                            0.12
                                                    )
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <hr className="my-4 border-secondary-100" />

                                <div className="flex justify-between font-semibold text-secondary-900">
                                    <span>Total</span>
                                    <span>
                                        {formatPrice(
                                            property.price * 5 +
                                                (property.cleaningFee || 0) +
                                                (property.serviceFee ||
                                                    Math.round(
                                                        property.price *
                                                            5 *
                                                            0.12
                                                    ))
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 bg-white rounded-xl shadow-sm border border-secondary-100 p-4">
                            <div className="flex items-center text-secondary-700">
                                <FaShieldAlt className="text-primary-500 mr-3" />
                                <span className="text-sm">
                                    To protect your payment, never transfer
                                    money or communicate outside of the
                                    StayFinder website or app.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PropertyDetailPage
