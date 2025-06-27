import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    FaArrowLeft,
    FaEdit,
    FaTrash,
    FaCalendarAlt,
    FaStar,
    FaMapMarkerAlt,
    FaUsers,
    FaBed,
    FaBath,
    FaCheckCircle,
    FaToggleOn,
    FaToggleOff,
    FaSpinner,
    FaChartLine,
    FaMoneyBillWave,
    FaRegClock,
    FaCamera,
    FaExclamationCircle,
    FaEye,
    FaShareAlt,
    FaClipboardList,
    FaTag,
    FaPercentage,
    FaShieldAlt,
    FaHome,
    FaInfoCircle,
    FaRegCalendarAlt,
    FaRegCalendarCheck,
    FaRegBell,
    FaRegCreditCard,
    FaRegCommentDots,
    FaRegLightbulb,
    FaChevronRight,
} from "react-icons/fa"
import { propertyService, bookingService } from "../../services/api"
import { formatPrice } from "../../utils/currency"
import HostCalendarManager from "../../components/property/HostCalendarManager"

/**
 * Host property detail page component
 * Displays detailed information about a property for the host
 * Redesigned with Airbnb-like UI
 */
const HostPropertyDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [showAllImages, setShowAllImages] = useState(false)

    // Check if coming from successful property creation/update
    const showSuccessMessage = location.state?.success

    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Fetch property details
    const {
        data: property,
        isLoading: propertyLoading,
        isError: propertyError,
    } = useQuery({
        queryKey: ["property", id],
        queryFn: () => propertyService.getPropertyById(id),
    })

    // Fetch property bookings
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ["propertyBookings", id],
        queryFn: () => bookingService.getPropertyBookings(id, { limit: 5 }),
    })

    // Toggle property availability mutation
    const toggleAvailabilityMutation = useMutation({
        mutationFn: () => propertyService.toggleAvailability(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["property", id])
        },
    })

    // Delete property mutation
    const deletePropertyMutation = useMutation({
        mutationFn: () => propertyService.deleteProperty(id),
        onSuccess: () => {
            navigate("/host/properties", {
                state: { deleted: true },
            })
        },
    })

    // Handle toggle availability
    const handleToggleAvailability = () => {
        toggleAvailabilityMutation.mutate()
    }

    // Handle delete property
    const handleDeleteProperty = () => {
        deletePropertyMutation.mutate()
    }

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Handle image navigation
    const handleNextImage = () => {
        if (property?.images?.length > 0) {
            setActiveImageIndex((prev) =>
                prev === property.images.length - 1 ? 0 : prev + 1
            )
        }
    }

    const handlePrevImage = () => {
        if (property?.images?.length > 0) {
            setActiveImageIndex((prev) =>
                prev === 0 ? property.images.length - 1 : prev - 1
            )
        }
    }

    // Get image URL helper
    const getImageUrl = (image) => {
        return typeof image === "object" ? image.url : image
    }

    // Loading state
    if (propertyLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-secondary-200 rounded w-1/3 mb-6"></div>
                    <div className="h-96 bg-secondary-200 rounded mb-6"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/2 mb-8"></div>
                    <div className="h-24 bg-secondary-200 rounded mb-6"></div>
                </div>
            </div>
        )
    }

    // Error state
    if (propertyError) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
                    <FaExclamationCircle className="mr-2" />
                    <p>
                        Error loading property details. Please try again later.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Success message */}
            {showSuccessMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                    <FaCheckCircle className="mr-2" />
                    <span>
                        Property{" "}
                        {location.state.updated ? "updated" : "created"}{" "}
                        successfully!
                    </span>
                </div>
            )}

            {/* Back button and title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => navigate("/host/properties")}
                        className="flex items-center text-primary-600 hover:text-primary-800 mb-2"
                    >
                        <FaArrowLeft className="mr-2" />
                        <span>Back to properties</span>
                    </button>
                    <h1 className="text-3xl font-bold text-secondary-900 mb-1">
                        {property.title}
                    </h1>
                    <div className="flex items-center text-secondary-600 text-sm">
                        <FaMapMarkerAlt className="mr-1" />
                        <span>
                            {property.address.city},{" "}
                            {property.address.state || property.address.country}
                        </span>
                        <span className="mx-2">•</span>
                        <div className="flex items-center">
                            <FaStar className="text-yellow-500 mr-1" />
                            <span>
                                {property.avgRating
                                    ? `${property.avgRating.toFixed(1)} (${
                                          property.reviewCount
                                      } reviews)`
                                    : "New listing"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                    <Link
                        to={`/properties/${id}`}
                        className="inline-flex items-center bg-white border border-secondary-300 text-secondary-700 px-4 py-2 rounded-md font-medium hover:bg-secondary-50 transition-colors"
                    >
                        <FaEye className="mr-2" />
                        <span>View Listing</span>
                    </Link>
                    <Link
                        to={`/host/properties/${id}/edit`}
                        className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                    >
                        <FaEdit className="mr-2" />
                        <span>Edit</span>
                    </Link>
                </div>
            </div>

            {/* Property status banner */}
            <div
                className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
                    property.isAvailable
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                }`}
            >
                <div className="flex items-center">
                    <div
                        className={`p-2 rounded-full mr-3 ${
                            property.isAvailable ? "bg-green-100" : "bg-red-100"
                        }`}
                    >
                        {property.isAvailable ? (
                            <FaCheckCircle className="text-green-600" />
                        ) : (
                            <FaRegBell className="text-red-600" />
                        )}
                    </div>
                    <div>
                        <h3
                            className={`font-medium ${
                                property.isAvailable
                                    ? "text-green-800"
                                    : "text-red-800"
                            }`}
                        >
                            {property.isAvailable
                                ? "Your property is live and available for booking"
                                : "Your property is currently unavailable for booking"}
                        </h3>
                        <p className="text-sm text-secondary-600">
                            {property.isAvailable
                                ? "Guests can find and book your property"
                                : "Update availability to start receiving bookings"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleToggleAvailability}
                    disabled={toggleAvailabilityMutation.isPending}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        property.isAvailable
                            ? "bg-white text-red-600 border border-red-300 hover:bg-red-50"
                            : "bg-white text-green-600 border border-green-300 hover:bg-green-50"
                    } disabled:opacity-50`}
                >
                    {toggleAvailabilityMutation.isPending ? (
                        <span className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" />
                            Updating...
                        </span>
                    ) : property.isAvailable ? (
                        "Set as Unavailable"
                    ) : (
                        "Set as Available"
                    )}
                </button>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Property details */}
                <div className="lg:col-span-2">
                    {/* Property images */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                        {property.images.length > 0 ? (
                            <div className="relative">
                                {/* Main image */}
                                <div className="relative h-[450px] overflow-hidden">
                                    <img
                                        src={getImageUrl(
                                            property.images[activeImageIndex]
                                        )}
                                        alt={`${property.title} - Image ${
                                            activeImageIndex + 1
                                        }`}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Image navigation arrows */}
                                    {property.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePrevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-secondary-50 focus:outline-none"
                                                aria-label="Previous image"
                                            >
                                                <FaArrowLeft className="text-secondary-800" />
                                            </button>
                                            <button
                                                onClick={handleNextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-secondary-50 focus:outline-none"
                                                aria-label="Next image"
                                            >
                                                <FaArrowLeft className="text-secondary-800 transform rotate-180" />
                                            </button>
                                        </>
                                    )}

                                    {/* View all photos button */}
                                    <button
                                        onClick={() => setShowAllImages(true)}
                                        className="absolute bottom-4 right-4 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-md flex items-center text-sm font-medium hover:bg-opacity-100 transition-colors"
                                    >
                                        <FaCamera className="mr-2" />
                                        View all photos
                                    </button>
                                </div>

                                {/* Thumbnail navigation */}
                                {property.images.length > 1 && (
                                    <div className="flex overflow-x-auto p-4 space-x-2 scrollbar-hide">
                                        {property.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    setActiveImageIndex(index)
                                                }
                                                className={`flex-shrink-0 h-16 w-24 rounded-md overflow-hidden border-2 transition-all ${
                                                    activeImageIndex === index
                                                        ? "border-primary-600 opacity-100"
                                                        : "border-transparent opacity-70 hover:opacity-100"
                                                }`}
                                            >
                                                <img
                                                    src={getImageUrl(image)}
                                                    alt={`Thumbnail ${
                                                        index + 1
                                                    }`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-96 bg-secondary-100 flex flex-col items-center justify-center">
                                <FaCamera className="text-secondary-400 text-4xl mb-3" />
                                <span className="text-secondary-500 mb-2">
                                    No images available
                                </span>
                                <Link
                                    to={`/host/properties/${id}/edit`}
                                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                >
                                    Add photos to attract more guests
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Property details cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Property overview */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100">
                            <div className="flex items-center mb-4">
                                <div className="p-2 rounded-full bg-primary-50 mr-3">
                                    <FaHome className="text-primary-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-secondary-900">
                                    Property Overview
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <FaBed className="text-secondary-500 mr-2" />
                                        <div>
                                            <div className="font-medium">
                                                {property.bedrooms}
                                            </div>
                                            <div className="text-xs text-secondary-500">
                                                Bedrooms
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaBath className="text-secondary-500 mr-2" />
                                        <div>
                                            <div className="font-medium">
                                                {property.bathrooms}
                                            </div>
                                            <div className="text-xs text-secondary-500">
                                                Bathrooms
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaUsers className="text-secondary-500 mr-2" />
                                        <div>
                                            <div className="font-medium">
                                                {property.maxGuests}
                                            </div>
                                            <div className="text-xs text-secondary-500">
                                                Max Guests
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaMapMarkerAlt className="text-secondary-500 mr-2" />
                                        <div>
                                            <div className="font-medium truncate max-w-[120px]">
                                                {property.address.city}
                                            </div>
                                            <div className="text-xs text-secondary-500">
                                                Location
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-secondary-100">
                                    <h3 className="font-medium mb-2 text-secondary-900">
                                        Description
                                    </h3>
                                    <p className="text-secondary-700 text-sm line-clamp-4">
                                        {property.description}
                                    </p>
                                    <button
                                        className="text-primary-600 hover:text-primary-800 text-sm font-medium mt-2"
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    "full-description"
                                                )
                                                .scrollIntoView({
                                                    behavior: "smooth",
                                                })
                                        }
                                    >
                                        Read more
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Pricing information */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100">
                            <div className="flex items-center mb-4">
                                <div className="p-2 rounded-full bg-green-50 mr-3">
                                    <FaTag className="text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-secondary-900">
                                    Pricing
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
                                    <div>
                                        <div className="font-medium text-secondary-900">
                                            Base Price
                                        </div>
                                        <div className="text-xs text-secondary-500">
                                            Per{" "}
                                            {property.pricePeriod === "nightly"
                                                ? "night"
                                                : property.pricePeriod}
                                        </div>
                                    </div>
                                    <div className="text-xl font-semibold text-secondary-900">
                                        {formatPrice(property.price)}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <div className="text-secondary-700">
                                        Cleaning Fee
                                    </div>
                                    <div className="font-medium">
                                        {formatPrice(property.cleaningFee || 0)}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <div className="text-secondary-700">
                                        Service Fee
                                    </div>
                                    <div className="font-medium">
                                        {formatPrice(property.serviceFee || 0)}
                                    </div>
                                </div>

                                <div className="pt-3 mt-3 border-t border-secondary-100">
                                    <Link
                                        to={`/host/properties/${id}/edit`}
                                        className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                                    >
                                        <FaEdit className="mr-1" size={14} />
                                        Update pricing
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full description section */}
                    <div
                        id="full-description"
                        className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100 mb-8"
                    >
                        <div className="flex items-center mb-4">
                            <div className="p-2 rounded-full bg-secondary-50 mr-3">
                                <FaInfoCircle className="text-secondary-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-secondary-900">
                                About this property
                            </h2>
                        </div>

                        <div className="prose max-w-none text-secondary-700">
                            <p className="whitespace-pre-line">
                                {property.description}
                            </p>
                        </div>
                    </div>

                    {/* Amenities section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100 mb-8">
                        <div className="flex items-center mb-4">
                            <div className="p-2 rounded-full bg-blue-50 mr-3">
                                <FaCheckCircle className="text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-secondary-900">
                                Amenities
                            </h2>
                        </div>

                        {property.amenities.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {property.amenities.map((amenity) => (
                                    <div
                                        key={amenity}
                                        className="flex items-center p-3 bg-secondary-50 rounded-lg"
                                    >
                                        <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                                        <span className="text-secondary-800 capitalize">
                                            {amenity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-secondary-50 rounded-lg">
                                <p className="text-secondary-600 mb-2">
                                    No amenities listed yet
                                </p>
                                <Link
                                    to={`/host/properties/${id}/edit`}
                                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                >
                                    Add amenities to attract more guests
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent bookings */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <div className="p-2 rounded-full bg-purple-50 mr-3">
                                    <FaRegCalendarCheck className="text-purple-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-secondary-900">
                                    Recent Bookings
                                </h2>
                            </div>
                            <Link
                                to={`/host/bookings?propertyId=${id}`}
                                className="text-primary-600 hover:text-primary-800 flex items-center text-sm font-medium"
                            >
                                View all
                                <FaChevronRight className="ml-1" size={12} />
                            </Link>
                        </div>

                        {bookingsLoading ? (
                            <div className="animate-pulse space-y-4">
                                {[...Array(3)].map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-24 bg-secondary-100 rounded-lg"
                                    ></div>
                                ))}
                            </div>
                        ) : !bookingsData ||
                          !bookingsData.bookings ||
                          bookingsData.bookings.length === 0 ? (
                            <div className="text-center py-8 bg-secondary-50 rounded-lg">
                                <FaCalendarAlt className="text-secondary-400 text-3xl mx-auto mb-3" />
                                <p className="text-secondary-700 font-medium mb-2">
                                    No bookings yet for this property
                                </p>
                                <p className="text-secondary-600 text-sm max-w-md mx-auto mb-4">
                                    When guests book your property, their
                                    reservations will appear here.
                                </p>
                                <button
                                    onClick={() =>
                                        window.open(
                                            `/properties/${id}`,
                                            "_blank"
                                        )
                                    }
                                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                >
                                    View your public listing
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookingsData.bookings.map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-secondary-200 rounded-full flex items-center justify-center text-secondary-600 mr-3">
                                                    {booking.user.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-secondary-900">
                                                        {booking.user.name}
                                                    </div>
                                                    <div className="text-xs text-secondary-500">
                                                        Booked on{" "}
                                                        {formatDate(
                                                            booking.createdAt
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    booking.status ===
                                                    "confirmed"
                                                        ? "bg-green-100 text-green-800"
                                                        : booking.status ===
                                                          "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : booking.status ===
                                                          "cancelled"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-primary-100 text-primary-800"
                                                }`}
                                            >
                                                {booking.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    booking.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center text-sm text-secondary-700 mb-2">
                                            <div className="flex items-center mr-4">
                                                <FaRegCalendarAlt
                                                    className="text-secondary-500 mr-1"
                                                    size={14}
                                                />
                                                {formatDate(booking.startDate)}{" "}
                                                - {formatDate(booking.endDate)}
                                            </div>
                                            <div className="flex items-center">
                                                <FaUsers
                                                    className="text-secondary-500 mr-1"
                                                    size={14}
                                                />
                                                {booking.guests} guest
                                                {booking.guests !== 1
                                                    ? "s"
                                                    : ""}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-secondary-100">
                                            <Link
                                                to={`/host/bookings/${booking._id}`}
                                                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                            >
                                                View details
                                            </Link>
                                            <div className="font-medium text-secondary-900">
                                                {formatPrice(
                                                    booking.totalPrice
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Calendar Manager */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100 mb-8">
                        <div className="flex items-center mb-4">
                            <div className="p-2 rounded-full bg-orange-50 mr-3">
                                <FaCalendarAlt className="text-orange-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-secondary-900">
                                Availability Calendar
                            </h2>
                        </div>
                        <p className="text-secondary-600 mb-4">
                            Manage your property's availability and blocked
                            dates. Blocked dates won't be bookable by guests.
                        </p>
                        <HostCalendarManager propertyId={id} />
                    </div>
                </div>

                {/* Right column - Stats and actions */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        {/* Quick actions card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100">
                            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                <Link
                                    to={`/host/properties/${id}/edit`}
                                    className="flex items-center justify-between w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <span className="flex items-center">
                                        <FaEdit className="mr-2" />
                                        Edit Property
                                    </span>
                                    <FaChevronRight size={12} />
                                </Link>

                                <Link
                                    to={`/properties/${id}`}
                                    className="flex items-center justify-between w-full px-4 py-3 bg-white border border-secondary-300 text-secondary-800 rounded-lg hover:bg-secondary-50 transition-colors"
                                >
                                    <span className="flex items-center">
                                        <FaEye className="mr-2" />
                                        View Public Listing
                                    </span>
                                    <FaChevronRight size={12} />
                                </Link>

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center justify-between w-full px-4 py-3 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <span className="flex items-center">
                                        <FaTrash className="mr-2" />
                                        Delete Property
                                    </span>
                                    <FaChevronRight size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Property stats card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100">
                            <div className="flex items-center mb-4">
                                <div className="p-2 rounded-full bg-blue-50 mr-3">
                                    <FaChartLine className="text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-secondary-900">
                                    Performance Stats
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-secondary-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-secondary-700 text-sm">
                                            Total Revenue
                                        </span>
                                        <span className="text-green-600 font-medium">
                                            {formatPrice(
                                                bookingsData?.totalRevenue || 0
                                            )}
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    ((bookingsData?.totalRevenue ||
                                                        0) /
                                                        1000) *
                                                        100
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-secondary-50 p-4 rounded-lg">
                                        <div className="flex items-center mb-1">
                                            <FaRegCalendarCheck
                                                className="text-primary-600 mr-2"
                                                size={14}
                                            />
                                            <span className="text-secondary-700 text-sm">
                                                Bookings
                                            </span>
                                        </div>
                                        <div className="text-2xl font-semibold text-secondary-900">
                                            {bookingsData?.totalBookings || 0}
                                        </div>
                                    </div>

                                    <div className="bg-secondary-50 p-4 rounded-lg">
                                        <div className="flex items-center mb-1">
                                            <FaPercentage
                                                className="text-purple-600 mr-2"
                                                size={14}
                                            />
                                            <span className="text-secondary-700 text-sm">
                                                Occupancy
                                            </span>
                                        </div>
                                        <div className="text-2xl font-semibold text-secondary-900">
                                            {bookingsData?.occupancyRate
                                                ? `${bookingsData.occupancyRate.toFixed(
                                                      0
                                                  )}%`
                                                : "0%"}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                                        <span className="text-secondary-600">
                                            Listing created
                                        </span>
                                        <span className="font-medium text-secondary-900">
                                            {formatDate(property.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                                        <span className="text-secondary-600">
                                            Last updated
                                        </span>
                                        <span className="font-medium text-secondary-900">
                                            {formatDate(property.updatedAt)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-secondary-600">
                                            Status
                                        </span>
                                        <span
                                            className={`font-medium ${
                                                property.isAvailable
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {property.isAvailable
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips card */}
                        <div className="bg-primary-50 rounded-xl shadow-sm p-6 border border-primary-100">
                            <div className="flex items-center mb-4">
                                <div className="p-2 rounded-full bg-primary-100 mr-3">
                                    <FaRegLightbulb className="text-primary-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-primary-900">
                                    Hosting Tips
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <FaCheckCircle className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-primary-800">
                                        Add high-quality photos to showcase your
                                        property's best features
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <FaCheckCircle className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-primary-800">
                                        Keep your calendar up to date to avoid
                                        double bookings
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <FaCheckCircle className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-primary-800">
                                        Respond quickly to booking requests to
                                        improve your response rate
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <FaCheckCircle className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-primary-800">
                                        Consider seasonal pricing to maximize
                                        your earnings
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image gallery modal */}
            {showAllImages && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                    <div className="max-w-5xl w-full bg-white rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold">
                                All Photos
                            </h3>
                            <button
                                onClick={() => setShowAllImages(false)}
                                className="p-2 rounded-full hover:bg-secondary-100"
                            >
                                <FaTimesCircle className="text-secondary-700" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {property.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="aspect-w-16 aspect-h-12 rounded-lg overflow-hidden"
                                    >
                                        <img
                                            src={getImageUrl(image)}
                                            alt={`Property image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center mb-4">
                            <div className="p-2 rounded-full bg-red-100 mr-3">
                                <FaExclamationCircle className="text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-secondary-900">
                                Delete Property
                            </h2>
                        </div>
                        <p className="text-secondary-700 mb-6">
                            Are you sure you want to delete this property? This
                            action cannot be undone and will cancel all future
                            bookings.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProperty}
                                disabled={deletePropertyMutation.isLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 font-medium"
                            >
                                {deletePropertyMutation.isLoading ? (
                                    <span className="flex items-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        Deleting...
                                    </span>
                                ) : (
                                    "Delete Property"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HostPropertyDetailPage
