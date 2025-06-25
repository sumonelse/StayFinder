import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
    FaStar,
    FaMapMarkerAlt,
    FaBed,
    FaBath,
    FaUsers,
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
    FaLock,
    FaTag,
    FaFlag,
    FaCamera,
    FaMedal,
    FaUserCheck,
    FaGlobe,
    FaLanguage,
    FaShieldAlt,
    FaCalendarAlt,
    FaChevronRight,
    FaEllipsisH,
    FaTimesCircle,
    FaCheckCircle,
    FaClock,
} from "react-icons/fa"
import {
    propertyService,
    reviewService,
    bookingService,
} from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import ImageGallery from "../../components/property/ImageGallery"
import ShareModal from "../../components/property/ShareModal"
import AvailabilityCalendar from "../../components/property/AvailabilityCalendar"
import LocationMap from "../../components/property/LocationMap"
import PriceBreakdownModal from "../../components/property/PriceBreakdownModal"
import AmenitiesModal from "../../components/property/AmenitiesModal"
import RulesModal from "../../components/property/RulesModal"
import ReportModal from "../../components/property/ReportModal"
import DescriptionModal from "../../components/property/DescriptionModal"
import { formatPrice } from "../../utils/currency"
import {
    calculateBookingPrice,
    calculateNights,
} from "../../utils/bookingCalculator"

/**
 * Enhanced Airbnb-style Property Detail Page
 */
const PropertyDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated, addToFavorites, removeFromFavorites } =
        useAuth()

    // Modal states
    const [showShareModal, setShowShareModal] = useState(false)
    const [showPriceBreakdownModal, setShowPriceBreakdownModal] =
        useState(false)
    const [showAmenitiesModal, setShowAmenitiesModal] = useState(false)
    const [showRulesModal, setShowRulesModal] = useState(false)
    const [showDescriptionModal, setShowDescriptionModal] = useState(false)
    const [showReportModal, setShowReportModal] = useState(false)

    // Booking states
    const [selectedDates, setSelectedDates] = useState({
        startDate: "",
        endDate: "",
    })
    const [guestCount, setGuestCount] = useState(1)
    const [bookingPriceDetails, setBookingPriceDetails] = useState(null)

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
    const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
        queryKey: ["propertyReviews", id],
        queryFn: () => reviewService.getPropertyReviews(id, { limit: 6 }),
        enabled: !!id,
    })

    // Check if user has booking
    const [userHasBooking, setUserHasBooking] = useState(false)
    const { data: userBookingsData } = useQuery({
        queryKey: ["userBookingsForProperty", id, user?._id],
        queryFn: async () => {
            const result = await bookingService.getUserBookings()
            return result.bookings || []
        },
        enabled: !!id && isAuthenticated,
    })

    useEffect(() => {
        if (!userBookingsData || !Array.isArray(userBookingsData)) return

        const hasBookingForProperty = userBookingsData.some(
            (booking) =>
                booking.property &&
                booking.property._id &&
                booking.property._id.toString() === id.toString() &&
                (booking.status === "confirmed" ||
                    booking.status === "completed")
        )
        setUserHasBooking(hasBookingForProperty)
    }, [userBookingsData, id])

    // Calculate booking price when dates change
    useEffect(() => {
        if (selectedDates.startDate && selectedDates.endDate && property) {
            const priceDetails = calculateBookingPrice(
                property,
                selectedDates.startDate,
                selectedDates.endDate
            )
            setBookingPriceDetails(priceDetails)
        }
    }, [selectedDates, property])

    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Get amenity icon
    const getAmenityIcon = (amenity) => {
        const amenityLower = amenity.toLowerCase()
        if (amenityLower.includes("wifi")) return <FaWifi size={20} />
        if (amenityLower.includes("pool")) return <FaSwimmingPool size={20} />
        if (amenityLower.includes("parking")) return <FaParking size={20} />
        if (amenityLower.includes("air") || amenityLower.includes("ac"))
            return <FaSnowflake size={20} />
        if (
            amenityLower.includes("coffee") ||
            amenityLower.includes("breakfast")
        )
            return <FaCoffee size={20} />
        if (amenityLower.includes("tv") || amenityLower.includes("television"))
            return <FaTv size={20} />
        return <FaCheck size={20} />
    }

    // Check if property is in favorites
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

    // Handle booking
    const handleBooking = () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: `/properties/${id}` } })
            return
        }

        if (!selectedDates.startDate || !selectedDates.endDate) {
            alert("Please select check-in and check-out dates")
            return
        }

        // Navigate to booking page with selected dates
        navigate(`/properties/${id}/book`, {
            state: {
                startDate: selectedDates.startDate,
                endDate: selectedDates.endDate,
                guests: guestCount,
                priceDetails: bookingPriceDetails,
            },
        })
    }

    // Loading state
    if (propertyLoading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        {/* Header skeleton */}
                        <div className="h-6 bg-secondary-200 rounded w-20 mb-6"></div>
                        <div className="h-8 bg-secondary-200 rounded w-2/3 mb-4"></div>
                        <div className="h-4 bg-secondary-200 rounded w-1/2 mb-8"></div>

                        {/* Image skeleton */}
                        <div className="h-96 bg-secondary-200 rounded-xl mb-8"></div>

                        {/* Content skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="h-32 bg-secondary-200 rounded"></div>
                                <div className="h-48 bg-secondary-200 rounded"></div>
                                <div className="h-64 bg-secondary-200 rounded"></div>
                            </div>
                            <div className="h-96 bg-secondary-200 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (propertyError) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Property not found
                    </h3>
                    <p className="text-gray-600 mb-4">
                        The property you're looking for doesn't exist or has
                        been removed.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-secondary-50"
                    >
                        <FaArrowLeft className="mr-2" size={14} />
                        Go back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="py-6">
                    {/* Title and Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 leading-tight">
                                {property.title}
                            </h1>

                            {/* Location and Rating */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center">
                                    <FaStar
                                        className="text-black mr-1"
                                        size={12}
                                    />
                                    <span className="font-medium text-black">
                                        {property.avgRating > 0
                                            ? property.avgRating.toFixed(1)
                                            : "New"}
                                    </span>
                                    {property.reviewCount > 0 && (
                                        <>
                                            <span className="mx-1">·</span>
                                            <button
                                                className="underline hover:no-underline"
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            "reviews"
                                                        )
                                                        ?.scrollIntoView({
                                                            behavior: "smooth",
                                                        })
                                                }
                                            >
                                                {property.reviewCount} review
                                                {property.reviewCount !== 1
                                                    ? "s"
                                                    : ""}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <span className="mx-1">·</span>
                                    <FaMapMarkerAlt
                                        className="mr-1"
                                        size={12}
                                    />
                                    <button
                                        className="underline hover:no-underline"
                                        onClick={() =>
                                            document
                                                .getElementById("location")
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                })
                                        }
                                    >
                                        {property.address.city},{" "}
                                        {property.address.state},{" "}
                                        {property.address.country}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-4 lg:mt-0">
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-secondary-50 transition-colors"
                            >
                                <FaShare className="mr-2" size={14} />
                                Share
                            </button>

                            <button
                                onClick={handleToggleFavorite}
                                className={`flex items-center px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
                                    isFavorite
                                        ? "text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
                                        : "text-gray-700 bg-white border-gray-300 hover:bg-secondary-50"
                                }`}
                            >
                                {isFavorite ? (
                                    <FaHeart
                                        className="mr-2 text-red-500"
                                        size={14}
                                    />
                                ) : (
                                    <FaRegHeart className="mr-2" size={14} />
                                )}
                                {isFavorite ? "Saved" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="mb-6">
                    <div className="relative">
                        <ImageGallery
                            images={property?.images || []}
                            alt={property?.title || "Property"}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pb-12">
                    {/* Left Column - Property Details */}
                    <div className="lg:col-span-2">
                        {/* Host Information */}
                        <div className="pb-8 border-b border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h2 className="text-xl font-semibold text-gray-900 mr-3">
                                            {property.type} hosted by{" "}
                                            {property.host?.name || "Host"}
                                        </h2>
                                        {/* Host verification badges */}
                                        <div className="flex items-center space-x-2">
                                            <div className="bg-secondary-100 px-2 py-1 rounded-full flex items-center">
                                                <FaShieldAlt
                                                    className="text-gray-600 mr-1"
                                                    size={10}
                                                />
                                                <span className="text-xs text-gray-600">
                                                    Verified
                                                </span>
                                            </div>
                                            <div className="bg-secondary-100 px-2 py-1 rounded-full flex items-center">
                                                <FaMedal
                                                    className="text-gray-600 mr-1"
                                                    size={10}
                                                />
                                                <span className="text-xs text-gray-600">
                                                    Superhost
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-600 text-sm space-x-2 mb-3">
                                        <span>
                                            {property.maxGuests} guest
                                            {property.maxGuests !== 1
                                                ? "s"
                                                : ""}
                                        </span>
                                        <span>·</span>
                                        <span>
                                            {property.bedrooms} bedroom
                                            {property.bedrooms !== 1 ? "s" : ""}
                                        </span>
                                        <span>·</span>
                                        <span>
                                            {property.bathrooms} bathroom
                                            {property.bathrooms !== 1
                                                ? "s"
                                                : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-600 text-sm space-x-4">
                                        <div className="flex items-center">
                                            <FaStar
                                                className="text-black mr-1"
                                                size={12}
                                            />
                                            <span className="font-medium text-black">
                                                4.9
                                            </span>
                                            <span className="ml-1">
                                                Host rating
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <FaCalendarAlt
                                                className="text-gray-500 mr-1"
                                                size={12}
                                            />
                                            <span>Hosting for 3 years</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 ml-6">
                                    <div className="relative">
                                        {property.host?.profilePicture ? (
                                            <img
                                                src={
                                                    property.host.profilePicture
                                                }
                                                alt={property.host.name}
                                                className="h-16 w-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 bg-secondary-200 rounded-full flex items-center justify-center">
                                                <span className="text-gray-600 font-medium text-xl">
                                                    {property.host?.name
                                                        ?.charAt(0)
                                                        .toUpperCase() || "H"}
                                                </span>
                                            </div>
                                        )}
                                        {/* Online indicator */}
                                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-400 border-2 border-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Host Button */}
                            <div className="mt-6">
                                <button className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-secondary-50 transition-colors font-medium">
                                    Contact Host
                                </button>
                            </div>
                        </div>

                        {/* Property Highlights */}
                        <div className="py-8 border-b border-gray-200">
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <FaLock
                                            className="text-gray-700 mt-1"
                                            size={20}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            Self check-in
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Check yourself in with the keypad.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <FaMapMarkerAlt
                                            className="text-gray-700 mt-1"
                                            size={20}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            Great location
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            90% of recent guests gave the
                                            location a 5-star rating.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <FaMedal
                                            className="text-gray-700 mt-1"
                                            size={20}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            Great check-in experience
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            100% of recent guests gave the
                                            check-in process a 5-star rating.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="py-8 border-b border-gray-200">
                            <div className="space-y-4">
                                <p className="text-gray-900 leading-relaxed">
                                    {property.description?.length > 300
                                        ? `${property.description.substring(
                                              0,
                                              300
                                          )}...`
                                        : property.description}
                                </p>
                                {property.description?.length > 300 && (
                                    <button
                                        onClick={() =>
                                            setShowDescriptionModal(true)
                                        }
                                        className="text-black font-medium underline hover:no-underline"
                                    >
                                        Show more
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="py-8 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                What this place offers
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {property.amenities
                                    ?.slice(0, 8)
                                    .map((amenity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                                        >
                                            <div className="text-gray-700 flex-shrink-0">
                                                {getAmenityIcon(amenity)}
                                            </div>
                                            <span className="text-gray-900 text-sm font-medium truncate">
                                                {amenity}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                            {property.amenities?.length > 0 && (
                                <button
                                    onClick={() => setShowAmenitiesModal(true)}
                                    className="mt-6 px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-secondary-50 transition-colors font-medium"
                                >
                                    {property.amenities.length > 8
                                        ? `Show all ${property.amenities.length} amenities`
                                        : `Show ${property.amenities.length} amenities`}
                                </button>
                            )}
                        </div>

                        {/* Reviews */}
                        <div
                            id="reviews"
                            className="py-8 border-b border-gray-200"
                        >
                            <div className="flex items-center mb-8">
                                <FaStar className="text-black mr-2" size={20} />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {property.avgRating > 0
                                        ? property.avgRating.toFixed(1)
                                        : "New"}{" "}
                                    · {property.reviewCount} review
                                    {property.reviewCount !== 1 ? "s" : ""}
                                </h2>
                            </div>

                            {/* Rating Categories */}
                            {property.reviewCount > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">
                                            Cleanliness
                                        </span>
                                        <div className="flex items-center">
                                            <div className="w-24 h-1 bg-secondary-200 rounded-full mr-2">
                                                <div className="w-5/6 h-1 bg-black rounded-full"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                4.8
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">
                                            Communication
                                        </span>
                                        <div className="flex items-center">
                                            <div className="w-24 h-1 bg-secondary-200 rounded-full mr-2">
                                                <div className="w-full h-1 bg-black rounded-full"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                5.0
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">
                                            Check-in
                                        </span>
                                        <div className="flex items-center">
                                            <div className="w-24 h-1 bg-secondary-200 rounded-full mr-2">
                                                <div className="w-11/12 h-1 bg-black rounded-full"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                4.9
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">
                                            Accuracy
                                        </span>
                                        <div className="flex items-center">
                                            <div className="w-24 h-1 bg-secondary-200 rounded-full mr-2">
                                                <div className="w-5/6 h-1 bg-black rounded-full"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                4.7
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">
                                            Location
                                        </span>
                                        <div className="flex items-center">
                                            <div className="w-24 h-1 bg-secondary-200 rounded-full mr-2">
                                                <div className="w-11/12 h-1 bg-black rounded-full"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                4.9
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">
                                            Value
                                        </span>
                                        <div className="flex items-center">
                                            <div className="w-24 h-1 bg-secondary-200 rounded-full mr-2">
                                                <div className="w-4/5 h-1 bg-black rounded-full"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                4.6
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reviewsData?.reviews?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reviewsData.reviews
                                        .slice(0, 6)
                                        .map((review) => (
                                            <div
                                                key={review._id}
                                                className="space-y-3"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 bg-secondary-200 rounded-full flex items-center justify-center">
                                                        <span className="text-gray-600 font-medium">
                                                            {review.user?.name
                                                                ?.charAt(0)
                                                                .toUpperCase() ||
                                                                "U"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {review.user
                                                                ?.name ||
                                                                "Anonymous"}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(
                                                                review.createdAt
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    month: "long",
                                                                    year: "numeric",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-900 text-sm leading-relaxed">
                                                    {review.comment?.length >
                                                    150
                                                        ? `${review.comment.substring(
                                                              0,
                                                              150
                                                          )}...`
                                                        : review.comment}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">
                                    No reviews yet. Be the first to review this
                                    property!
                                </p>
                            )}

                            {reviewsData?.reviews?.length > 6 && (
                                <button className="mt-6 px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-secondary-50 transition-colors font-medium">
                                    Show all {property.reviewCount} reviews
                                </button>
                            )}
                        </div>

                        {/* Things to know */}
                        <div className="py-8 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Things to know
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* House rules */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">
                                        House rules
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>Check-in: 3:00 PM - 9:00 PM</p>
                                        <p>Checkout: 11:00 AM</p>
                                        <p>8 guests maximum</p>
                                        <button
                                            onClick={() =>
                                                setShowRulesModal(true)
                                            }
                                            className="text-black underline hover:no-underline font-medium"
                                        >
                                            Show more
                                        </button>
                                    </div>
                                </div>

                                {/* Safety & property */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">
                                        Safety & property
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>Carbon monoxide alarm</p>
                                        <p>Smoke alarm</p>
                                        <p>Security camera/recording device</p>
                                        <button className="text-black underline hover:no-underline font-medium">
                                            Show more
                                        </button>
                                    </div>
                                </div>

                                {/* Cancellation policy */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">
                                        Cancellation policy
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>Free cancellation for 48 hours</p>
                                        <button className="text-black underline hover:no-underline font-medium">
                                            Show more
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div id="location" className="py-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Where you'll be
                            </h2>

                            {userHasBooking ? (
                                <div>
                                    <LocationMap
                                        coordinates={
                                            property.location?.coordinates
                                        }
                                        title={property.title}
                                        height="400px"
                                    />
                                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-start">
                                            <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-green-800">
                                                    Exact location shown
                                                </p>
                                                <p className="text-green-700 text-sm">
                                                    {property.address.street},{" "}
                                                    {property.address.city},{" "}
                                                    {property.address.state}{" "}
                                                    {property.address.zipCode},{" "}
                                                    {property.address.country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-secondary-50 rounded-xl h-96 flex items-center justify-center">
                                    <div className="text-center text-gray-700 p-6">
                                        <FaMapMarkerAlt
                                            className="mx-auto mb-4 text-gray-400"
                                            size={32}
                                        />
                                        <p className="text-lg font-medium mb-2">
                                            {property.address.city},{" "}
                                            {property.address.state},{" "}
                                            {property.address.country}
                                        </p>
                                        <p className="mb-4 text-gray-600">
                                            Exact location provided after
                                            booking confirmation
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="bg-white border border-gray-300 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                                {/* Price and Rating */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-baseline">
                                        <span className="text-2xl font-semibold text-gray-900">
                                            {formatPrice(property.price)}
                                        </span>
                                        <span className="text-gray-600 ml-1 text-base">
                                            / night
                                        </span>
                                    </div>
                                    {property.avgRating > 0 && (
                                        <div className="flex items-center bg-secondary-50 px-2 py-1 rounded-lg">
                                            <FaStar
                                                className="text-black mr-1"
                                                size={12}
                                            />
                                            <span className="font-medium text-black text-sm">
                                                {property.avgRating.toFixed(1)}
                                            </span>
                                            <span className="text-gray-600 ml-1 text-sm">
                                                ({property.reviewCount})
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Special Offer Banner */}
                                {property.discount && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center">
                                        <FaTag
                                            className="text-red-500 mr-2"
                                            size={14}
                                        />
                                        <span className="text-red-800 text-sm font-medium">
                                            {property.discount}% off today only!
                                        </span>
                                    </div>
                                )}

                                {/* Booking Form */}
                                <div className="space-y-4">
                                    {/* Date Selection */}
                                    <div className="border border-gray-300 rounded-lg">
                                        <AvailabilityCalendar
                                            propertyId={id}
                                            initialStartDate={
                                                selectedDates.startDate
                                            }
                                            initialEndDate={
                                                selectedDates.endDate
                                            }
                                            onDateSelect={(dates) =>
                                                setSelectedDates(dates)
                                            }
                                        />
                                    </div>

                                    {/* Guest Selection */}
                                    <div className="border border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Guests
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Max {property.maxGuests}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() =>
                                                        setGuestCount(
                                                            Math.max(
                                                                1,
                                                                guestCount - 1
                                                            )
                                                        )
                                                    }
                                                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                                        guestCount <= 1
                                                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                                            : "border-gray-400 text-gray-700 hover:border-gray-600 hover:scale-110"
                                                    }`}
                                                    disabled={guestCount <= 1}
                                                >
                                                    −
                                                </button>
                                                <span className="font-medium text-gray-900 w-8 text-center text-lg">
                                                    {guestCount}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setGuestCount(
                                                            Math.min(
                                                                property.maxGuests,
                                                                guestCount + 1
                                                            )
                                                        )
                                                    }
                                                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                                        guestCount >=
                                                        property.maxGuests
                                                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                                            : "border-gray-400 text-gray-700 hover:border-gray-600 hover:scale-110"
                                                    }`}
                                                    disabled={
                                                        guestCount >=
                                                        property.maxGuests
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking Button */}
                                    {property.isApproved &&
                                    property.isAvailable ? (
                                        <button
                                            onClick={handleBooking}
                                            className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-4 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-red-600 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                                        >
                                            Reserve
                                        </button>
                                    ) : (
                                        <div className="w-full bg-secondary-100 text-gray-500 py-4 rounded-lg font-semibold text-lg text-center border border-gray-200">
                                            {!property.isApproved
                                                ? "Under Review"
                                                : "Not Available"}
                                        </div>
                                    )}

                                    <p className="text-center text-sm text-gray-600 font-medium">
                                        You won't be charged yet
                                    </p>

                                    {/* Price Summary */}
                                    {selectedDates.startDate &&
                                        selectedDates.endDate &&
                                        bookingPriceDetails && (
                                            <div className="pt-4 border-t border-gray-200">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium text-base text-gray-900">
                                                            Total
                                                        </span>
                                                        <p className="text-sm text-gray-600">
                                                            {calculateNights(
                                                                selectedDates.startDate,
                                                                selectedDates.endDate
                                                            )}{" "}
                                                            {calculateNights(
                                                                selectedDates.startDate,
                                                                selectedDates.endDate
                                                            ) === 1
                                                                ? "night"
                                                                : "nights"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-semibold text-lg text-gray-900">
                                                            {formatPrice(
                                                                bookingPriceDetails.total
                                                            )}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                setShowPriceBreakdownModal(
                                                                    true
                                                                )
                                                            }
                                                            className="block text-sm text-primary-600 hover:text-primary-700 underline mt-1"
                                                        >
                                                            See breakdown
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Report listing */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                                >
                                    <FaFlag className="inline mr-1" size={12} />
                                    Report this listing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title={property?.title || "Property"}
                url={window.location.href}
            />

            <AmenitiesModal
                isOpen={showAmenitiesModal}
                onClose={() => setShowAmenitiesModal(false)}
                amenities={property?.amenities || []}
                getAmenityIcon={getAmenityIcon}
            />

            <RulesModal
                isOpen={showRulesModal}
                onClose={() => setShowRulesModal(false)}
                rules={property?.houseRules || []}
            />

            <DescriptionModal
                isOpen={showDescriptionModal}
                onClose={() => setShowDescriptionModal(false)}
                title={property?.title || ""}
                description={property?.description || ""}
            />

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                propertyId={id}
            />

            <PriceBreakdownModal
                isOpen={showPriceBreakdownModal}
                onClose={() => setShowPriceBreakdownModal(false)}
                bookingPrice={bookingPriceDetails}
            />

            {/* Mobile Floating Booking Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50 backdrop-blur-sm bg-white/95">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-baseline">
                            <span className="text-lg font-semibold text-gray-900">
                                {formatPrice(property.price)}
                            </span>
                            <span className="text-gray-600 ml-1 text-sm">
                                night
                            </span>
                        </div>
                        {property.avgRating > 0 && (
                            <div className="flex items-center mt-1">
                                <FaStar className="text-black mr-1" size={10} />
                                <span className="text-xs font-medium text-black">
                                    {property.avgRating.toFixed(1)}
                                </span>
                                <span className="text-gray-600 ml-1 text-xs">
                                    ({property.reviewCount})
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleBooking}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            property.isApproved && property.isAvailable
                                ? "bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 transform hover:scale-[1.02]"
                                : "bg-secondary-100 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!property.isApproved || !property.isAvailable}
                    >
                        {property.isApproved && property.isAvailable
                            ? "Reserve"
                            : "Not Available"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PropertyDetailPage
