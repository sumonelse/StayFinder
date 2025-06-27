import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUsers,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaExclamationTriangle,
    FaPhone,
    FaEnvelope,
    FaBed,
    FaBath,
    FaHome,
    FaShieldAlt,
    FaInfoCircle,
    FaRegClock,
    FaRegCalendarCheck,
    FaRegCalendarTimes,
    FaRegStar,
    FaRegCommentDots,
    FaRegMoneyBillAlt,
    FaRegCreditCard,
    FaRegUser,
    FaRegBuilding,
    FaExclamationCircle,
    FaClipboardList,
    FaSuitcase,
    FaCheck,
    FaRegCircle,
    FaRoute,
    FaMapMarkedAlt,
    FaCar,
    FaTaxi,
    FaBus,
    FaLightbulb,
    FaPhoneAlt,
    FaUmbrellaBeach,
    FaFirstAid,
} from "react-icons/fa"
import { bookingService } from "../../services/api"
import { formatPrice } from "../../utils/currency"
import { calculateNights } from "../../utils/bookingCalculator"
import PropertyRules from "../../components/property/PropertyRules"
import LocationMap from "../../components/property/LocationMap"

/**
 * Enhanced Booking detail page component
 * Displays detailed information about a booking with a modern UI
 */
const BookingDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelReason, setCancelReason] = useState("")

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Check if coming from successful booking creation
    const showSuccessMessage = location.state?.success

    // Fetch booking details
    const {
        data: booking,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["booking", id],
        queryFn: () => bookingService.getBookingById(id),
    })

    // Cancel booking mutation
    const cancelBookingMutation = useMutation({
        mutationFn: () =>
            bookingService.updateBookingStatus(id, {
                status: "cancelled",
                reason: cancelReason,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries(["booking", id])
            queryClient.invalidateQueries(["userBookings"])
            setShowCancelModal(false)
        },
    })

    // Calculate number of nights
    const calculateNights = (startDate, endDate) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        return Math.round((end - start) / (1000 * 60 * 60 * 24))
    }

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <FaSpinner className="mr-2 animate-spin" size={14} />
                        Pending
                    </span>
                )
            case "confirmed":
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        <FaCheckCircle className="mr-2" size={14} />
                        Confirmed
                    </span>
                )
            case "cancelled":
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                        <FaTimesCircle className="mr-2" size={14} />
                        Cancelled
                    </span>
                )
            case "completed":
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <FaCheckCircle className="mr-2" size={14} />
                        Completed
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800 border border-secondary-200">
                        {status}
                    </span>
                )
        }
    }

    // Handle cancel booking
    const handleCancelBooking = () => {
        cancelBookingMutation.mutate()
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-secondary-50">
                <div className="container mx-auto px-4 py-6 md:py-8">
                    <div className="animate-pulse">
                        <div className="flex items-center mb-8">
                            <div className="h-10 w-10 bg-secondary-200 rounded-full mr-4"></div>
                            <div className="h-8 bg-secondary-200 rounded-xl w-1/3"></div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden mb-6">
                                    <div className="md:flex">
                                        <div className="md:w-2/5 h-64 md:h-auto bg-secondary-200"></div>
                                        <div className="p-6 md:p-8 md:w-3/5">
                                            <div className="h-6 bg-secondary-200 rounded-lg w-3/4 mb-4"></div>
                                            <div className="h-4 bg-secondary-200 rounded-lg w-1/2 mb-4"></div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="h-16 bg-secondary-200 rounded-xl"></div>
                                                <div className="h-16 bg-secondary-200 rounded-xl"></div>
                                                <div className="h-16 bg-secondary-200 rounded-xl"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-6 md:p-8 mb-6">
                                    <div className="h-6 bg-secondary-200 rounded-lg w-1/4 mb-8"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-6">
                                            <div className="h-20 bg-secondary-200 rounded-lg"></div>
                                            <div className="h-20 bg-secondary-200 rounded-lg"></div>
                                        </div>
                                        <div className="h-32 bg-secondary-200 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-6 mb-6">
                                    <div className="h-6 bg-secondary-200 rounded-lg w-1/2 mb-6"></div>
                                    <div className="space-y-4 mb-6">
                                        <div className="h-4 bg-secondary-200 rounded-lg"></div>
                                        <div className="h-4 bg-secondary-200 rounded-lg"></div>
                                        <div className="h-4 bg-secondary-200 rounded-lg"></div>
                                    </div>
                                    <div className="h-6 bg-secondary-200 rounded-lg w-1/2 mt-6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (isError) {
        return (
            <div className="min-h-screen bg-secondary-50">
                <div className="container mx-auto px-4 py-6 md:py-8">
                    <div className="bg-red-50 text-red-700 p-6 rounded-2xl mb-8 flex items-center border border-red-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                            <FaExclamationCircle
                                className="text-red-600"
                                size={20}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-800 mb-1">
                                Error loading booking
                            </h3>
                            <p className="text-sm">
                                We couldn't load the booking details:{" "}
                                {error?.message || "Please try again later."}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-secondary-800 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        <span>Go back</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="container mx-auto px-4 py-6 md:py-8">
                {/* Success message */}
                {showSuccessMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-2xl mb-8 flex items-start animate-fadeIn shadow-sm">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                            <FaCheckCircle
                                className="text-green-600"
                                size={20}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-800 mb-2">
                                Booking confirmed!
                            </h3>
                            <p className="text-green-700 text-sm leading-relaxed">
                                Your booking request has been sent to the host.
                                You'll receive a confirmation once it's
                                approved.
                            </p>
                        </div>
                    </div>
                )}

                {/* Back button and title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 animate-fadeIn">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-black">
                            Your reservation
                        </h1>
                    </div>
                    <div className="mt-4 md:mt-0">
                        {getStatusBadge(booking.status)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left column - Booking details */}
                    <div className="lg:col-span-2">
                        {/* Property details */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 border border-secondary-200 animate-fadeIn animation-delay-100">
                            <div className="md:flex">
                                {/* Property image */}
                                <div className="md:w-2/5 h-64 md:h-auto relative">
                                    <img
                                        src={
                                            booking.property.images[0].url ||
                                            "https://via.placeholder.com/300x200?text=No+Image"
                                        }
                                        alt={booking.property.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-black bg-opacity-70 text-white backdrop-blur-sm">
                                            <FaRegBuilding
                                                className="mr-1.5"
                                                size={10}
                                            />
                                            {booking.property.type
                                                .charAt(0)
                                                .toUpperCase() +
                                                booking.property.type.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Property info */}
                                <div className="p-6 md:p-8 md:w-3/5">
                                    <Link
                                        to={`/properties/${booking.property._id}`}
                                        className="text-xl font-semibold text-black hover:text-secondary-700 transition-colors block mb-2"
                                    >
                                        {booking.property.title}
                                    </Link>

                                    {/* Location */}
                                    <div className="flex items-center text-secondary-600 mb-4">
                                        <FaMapMarkerAlt
                                            className="mr-2 text-secondary-400"
                                            size={14}
                                        />
                                        <span className="text-sm">
                                            {booking.property.address.street},{" "}
                                            {booking.property.address.city},{" "}
                                            {booking.property.address.country}
                                        </span>
                                    </div>

                                    {/* Property details */}
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div className="flex flex-col items-center p-4 bg-secondary-50 rounded-xl">
                                            <FaHome
                                                className="text-secondary-600 mb-2"
                                                size={16}
                                            />
                                            <p className="text-secondary-500 text-xs mb-1">
                                                Type
                                            </p>
                                            <p className="font-medium text-black capitalize text-xs">
                                                {booking.property.type}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center p-4 bg-secondary-50 rounded-xl">
                                            <FaBed
                                                className="text-secondary-600 mb-2"
                                                size={16}
                                            />
                                            <p className="text-secondary-500 text-xs mb-1">
                                                Bedrooms
                                            </p>
                                            <p className="font-medium text-black text-xs">
                                                {booking.property.bedrooms}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center p-4 bg-secondary-50 rounded-xl">
                                            <FaBath
                                                className="text-secondary-600 mb-2"
                                                size={16}
                                            />
                                            <p className="text-secondary-500 text-xs mb-1">
                                                Bathrooms
                                            </p>
                                            <p className="font-medium text-black text-xs">
                                                {booking.property.bathrooms}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking information */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6 border border-secondary-200 animate-fadeIn animation-delay-200">
                            <h2 className="text-xl font-semibold mb-8 text-black">
                                Your stay
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-6">
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                                            <FaCalendarAlt className="text-white text-sm" />
                                        </div>
                                        <h3 className="text-lg font-medium text-black">
                                            Dates
                                        </h3>
                                    </div>
                                    <div className="flex flex-col space-y-3">
                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-secondary-100">
                                            <div className="flex items-center">
                                                <div className="bg-secondary-100 p-2 rounded-full mr-3">
                                                    <FaRegCalendarCheck className="text-secondary-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-secondary-600">
                                                        Check-in
                                                    </p>
                                                    <p className="font-medium text-secondary-900">
                                                        {(() => {
                                                            const date =
                                                                new Date(
                                                                    booking.checkInDate
                                                                )
                                                            date.setHours(
                                                                12,
                                                                0,
                                                                0,
                                                                0
                                                            )
                                                            return date.toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    weekday:
                                                                        "short",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                }
                                                            )
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-secondary-100 px-2 py-1 rounded text-secondary-700">
                                                From 3 PM
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-secondary-100">
                                            <div className="flex items-center">
                                                <div className="bg-secondary-100 p-2 rounded-full mr-3">
                                                    <FaRegCalendarTimes className="text-secondary-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-secondary-600">
                                                        Check-out
                                                    </p>
                                                    <p className="font-medium text-secondary-900">
                                                        {(() => {
                                                            const date =
                                                                new Date(
                                                                    booking.checkOutDate
                                                                )
                                                            date.setHours(
                                                                12,
                                                                0,
                                                                0,
                                                                0
                                                            )
                                                            return date.toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    weekday:
                                                                        "short",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                }
                                                            )
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-secondary-100 px-2 py-1 rounded text-secondary-700">
                                                By 11 AM
                                            </span>
                                        </div>

                                        <div className="text-center bg-secondary-50 py-2 px-4 rounded-lg border border-secondary-200">
                                            <span className="font-medium text-black">
                                                {calculateNights(
                                                    booking.checkInDate,
                                                    booking.checkOutDate
                                                )}{" "}
                                                nights
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-secondary-50 p-5 rounded-xl border border-secondary-200">
                                    <h3 className="font-medium text-black mb-3 flex items-center">
                                        <FaUsers className="text-secondary-600 mr-2" />
                                        Guest Information
                                    </h3>
                                    <div className="flex flex-col space-y-3">
                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-secondary-100">
                                            <div className="flex items-center">
                                                <div className="bg-secondary-100 p-2 rounded-full mr-3">
                                                    <FaRegUser className="text-secondary-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-secondary-600">
                                                        Number of guests
                                                    </p>
                                                    <p className="font-medium text-secondary-900">
                                                        {booking.numberOfGuests}{" "}
                                                        {booking.numberOfGuests ===
                                                        1
                                                            ? "guest"
                                                            : "guests"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-secondary-100">
                                            <p className="text-xs text-secondary-600 mb-1">
                                                Booking ID
                                            </p>
                                            <p className="font-mono text-sm text-secondary-900">
                                                {booking._id}
                                            </p>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-secondary-100">
                                            <p className="text-xs text-secondary-600 mb-1">
                                                Booked on
                                            </p>
                                            <p className="text-sm text-secondary-900">
                                                {(() => {
                                                    const date = new Date(
                                                        booking.createdAt
                                                    )
                                                    date.setHours(12, 0, 0, 0)
                                                    return date.toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Special requests */}
                            {booking.specialRequests && (
                                <div className="mb-8">
                                    <h3 className="font-medium text-black mb-3 flex items-center">
                                        <FaRegCommentDots className="text-secondary-600 mr-2" />
                                        Special Requests
                                    </h3>
                                    <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                                        <p className="text-secondary-800 italic">
                                            "{booking.specialRequests}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* House Rules */}
                            <div className="mb-8">
                                <h3 className="font-medium text-black mb-3 flex items-center">
                                    <FaClipboardList className="text-secondary-600 mr-2" />
                                    House Rules
                                </h3>
                                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                                    <PropertyRules
                                        rules={booking.property.rules || {}}
                                        showAll={true}
                                        className="text-sm"
                                    />

                                    <div className="mt-4 pt-3 border-t border-secondary-200 text-secondary-600 text-sm flex items-center">
                                        <FaInfoCircle className="text-secondary-400 mr-2 flex-shrink-0" />
                                        <span>
                                            Please make sure to follow these
                                            house rules during your stay.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* What to bring */}
                            <div className="mb-8">
                                <h3 className="font-medium text-black mb-3 flex items-center">
                                    <FaSuitcase className="text-secondary-600 mr-2" />
                                    What to Bring
                                </h3>
                                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-lg border border-secondary-100">
                                            <h4 className="font-medium text-secondary-900 mb-2 flex items-center">
                                                <FaCheckCircle
                                                    className="text-green-500 mr-2"
                                                    size={14}
                                                />
                                                Provided by Host
                                            </h4>
                                            <ul className="space-y-2 text-sm text-secondary-700">
                                                <li className="flex items-start">
                                                    <FaCheck
                                                        className="text-green-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Towels and bed linens
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaCheck
                                                        className="text-green-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Basic toiletries (soap,
                                                        shampoo)
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaCheck
                                                        className="text-green-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Kitchen essentials
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaCheck
                                                        className="text-green-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>Wi-Fi access</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-secondary-100">
                                            <h4 className="font-medium text-secondary-900 mb-2 flex items-center">
                                                <FaExclamationCircle
                                                    className="text-amber-500 mr-2"
                                                    size={14}
                                                />
                                                Suggested Items
                                            </h4>
                                            <ul className="space-y-2 text-sm text-secondary-700">
                                                <li className="flex items-start">
                                                    <FaRegCircle
                                                        className="text-amber-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Personal toiletries
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaRegCircle
                                                        className="text-amber-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Clothing appropriate for
                                                        the season
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaRegCircle
                                                        className="text-amber-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Chargers for electronic
                                                        devices
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaRegCircle
                                                        className="text-amber-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Any special dietary
                                                        requirements
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-secondary-200 text-secondary-600 text-sm flex items-center">
                                        <FaInfoCircle className="text-secondary-400 mr-2 flex-shrink-0" />
                                        <span>
                                            Contact the host if you have any
                                            specific questions about what's
                                            provided.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking status information */}
                            <div className="mb-8">
                                <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                    <FaInfoCircle className="text-secondary-600 mr-2" />
                                    Status Information
                                </h3>
                                <div className="rounded-xl overflow-hidden border border-secondary-100">
                                    {booking.status === "pending" && (
                                        <div className="bg-yellow-50 p-5 flex items-start">
                                            <div className="bg-yellow-100 p-3 rounded-full mr-4 flex-shrink-0">
                                                <FaSpinner
                                                    className="text-yellow-600 animate-spin"
                                                    size={20}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-yellow-800 mb-1">
                                                    Waiting for host
                                                    confirmation
                                                </p>
                                                <p className="text-yellow-700">
                                                    The host typically responds
                                                    within 24 hours. You'll
                                                    receive a notification once
                                                    your booking is confirmed.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {booking.status === "confirmed" && (
                                        <div className="bg-green-50 p-5 flex items-start">
                                            <div className="bg-green-100 p-3 rounded-full mr-4 flex-shrink-0">
                                                <FaCheckCircle
                                                    className="text-green-600"
                                                    size={20}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-800 mb-1">
                                                    Booking confirmed
                                                </p>
                                                <p className="text-green-700">
                                                    Your booking has been
                                                    confirmed by the host.
                                                    You're all set for your
                                                    stay! Check your email for
                                                    confirmation details.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {booking.status === "cancelled" && (
                                        <div className="bg-red-50 p-5 flex items-start">
                                            <div className="bg-red-100 p-3 rounded-full mr-4 flex-shrink-0">
                                                <FaTimesCircle
                                                    className="text-red-600"
                                                    size={20}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-red-800 mb-1">
                                                    Booking cancelled
                                                </p>
                                                {booking.cancelReason && (
                                                    <p className="text-red-700 mb-2">
                                                        <span className="font-medium">
                                                            Reason:
                                                        </span>{" "}
                                                        {booking.cancelReason}
                                                    </p>
                                                )}
                                                <p className="text-red-700">
                                                    {booking.cancelledBy ===
                                                    "user"
                                                        ? "You cancelled this booking."
                                                        : "This booking was cancelled by the host."}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {booking.status === "completed" && (
                                        <div className="bg-blue-50 p-5 flex items-start">
                                            <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                                                <FaCheckCircle
                                                    className="text-blue-600"
                                                    size={20}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-blue-800 mb-1">
                                                    Stay completed
                                                </p>
                                                <p className="text-blue-700 mb-2">
                                                    Your stay has been
                                                    completed. We hope you had a
                                                    great time!
                                                </p>
                                                {!booking.hasReview && (
                                                    <Link
                                                        to={`/reviews/add?propertyId=${booking.property._id}&bookingId=${booking._id}`}
                                                        className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-secondary-800 transition-colors"
                                                    >
                                                        <FaRegStar className="mr-2" />
                                                        Leave a review
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cancellation policy */}
                            <div className="mb-8">
                                <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                    <FaRegClock className="text-secondary-600 mr-2" />
                                    Cancellation Policy
                                </h3>
                                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100 text-secondary-800">
                                    <p className="mb-2">
                                        <span className="font-medium">
                                            Free cancellation
                                        </span>{" "}
                                        until 48 hours before check-in. After
                                        that, the first night is non-refundable.
                                    </p>
                                    <p className="text-sm text-secondary-600">
                                        Review the host's full cancellation
                                        policy which applies even if you cancel
                                        for illness or other unforeseen
                                        circumstances.
                                    </p>
                                </div>
                            </div>

                            {/* Travel Tips */}
                            <div>
                                <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                    <FaRoute className="text-secondary-600 mr-2" />
                                    Travel Tips
                                </h3>
                                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                                    <div className="space-y-4">
                                        <div className="bg-white p-3 rounded-lg border border-secondary-100">
                                            <h4 className="font-medium text-secondary-900 mb-2 flex items-center">
                                                <FaMapMarkedAlt
                                                    className="text-secondary-600 mr-2"
                                                    size={14}
                                                />
                                                Getting There
                                            </h4>

                                            {/* Property Location Map */}
                                            <div className="mb-4">
                                                {/* Add console log to debug location data */}
                                                {console.log(
                                                    "Property location data:",
                                                    booking.property.location
                                                )}
                                                <LocationMap
                                                    coordinates={
                                                        booking.property
                                                            .location
                                                            ?.coordinates
                                                    }
                                                    title={
                                                        booking.property.title
                                                    }
                                                    height="200px"
                                                />
                                            </div>

                                            <p className="text-sm text-secondary-700 mb-2">
                                                {booking.property.location
                                                    ?.coordinates ? (
                                                    <>
                                                        The property is located
                                                        in{" "}
                                                        {
                                                            booking.property
                                                                .address.city
                                                        }
                                                        ,{" "}
                                                        {
                                                            booking.property
                                                                .address.country
                                                        }
                                                        . Here are some
                                                        transportation options:
                                                    </>
                                                ) : (
                                                    <>
                                                        The property is located
                                                        in{" "}
                                                        {
                                                            booking.property
                                                                .address.city
                                                        }
                                                        ,{" "}
                                                        {
                                                            booking.property
                                                                .address.country
                                                        }
                                                        . Exact location
                                                        coordinates are not
                                                        available.
                                                    </>
                                                )}
                                            </p>
                                            <ul className="space-y-2 text-sm text-secondary-700">
                                                <li className="flex items-start">
                                                    <FaCar
                                                        className="text-secondary-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        By car: Use GPS
                                                        navigation to{" "}
                                                        {
                                                            booking.property
                                                                .address.street
                                                        }
                                                        ,{" "}
                                                        {
                                                            booking.property
                                                                .address.city
                                                        }
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaTaxi
                                                        className="text-secondary-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Taxi or rideshare
                                                        services are available
                                                        in the area
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaBus
                                                        className="text-secondary-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Public transportation:
                                                        Check local transit
                                                        options
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-secondary-100">
                                            <h4 className="font-medium text-secondary-900 mb-2 flex items-center">
                                                <FaLightbulb
                                                    className="text-secondary-600 mr-2"
                                                    size={14}
                                                />
                                                Helpful Tips
                                            </h4>
                                            <ul className="space-y-2 text-sm text-secondary-700">
                                                <li className="flex items-start">
                                                    <FaRegClock
                                                        className="text-secondary-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Plan to arrive during
                                                        check-in hours:{" "}
                                                        {booking.property.rules
                                                            ?.checkIn ||
                                                            "3:00 PM - 8:00 PM"}
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaPhoneAlt
                                                        className="text-secondary-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Save the host's contact
                                                        information for easy
                                                        access
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaUmbrellaBeach
                                                        className="text-secondary-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Check the weather
                                                        forecast before your
                                                        trip
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <FaFirstAid
                                                        className="text-secondary-500 mt-0.5 mr-2 flex-shrink-0"
                                                        size={12}
                                                    />
                                                    <span>
                                                        Locate nearby medical
                                                        facilities and
                                                        pharmacies
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-secondary-200 text-secondary-600 text-sm flex items-center">
                                        <FaInfoCircle className="text-secondary-400 mr-2 flex-shrink-0" />
                                        <span>
                                            Message your host for specific
                                            directions or local recommendations.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Host information */}
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-secondary-100 animate-fadeIn animation-delay-300">
                            <h2 className="text-2xl font-semibold mb-6 text-secondary-900 flex items-center">
                                <FaRegUser className="text-secondary-600 mr-3" />
                                Host Information
                            </h2>
                            <div className="flex flex-col md:flex-row md:items-start">
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6 border-4 border-secondary-100 shadow-sm">
                                    <img
                                        src={
                                            booking.host.profilePicture ||
                                            "https://via.placeholder.com/100x100?text=Host"
                                        }
                                        alt={booking.host.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-xl text-secondary-900 mb-1">
                                        {booking.host.name}
                                    </h3>
                                    <div className="flex items-center mb-4">
                                        <span className="bg-secondary-100 text-secondary-700 text-sm px-3 py-1 rounded-full border border-secondary-200">
                                            Host since{" "}
                                            {booking.host.hostingSince
                                                ? new Date(
                                                      booking.host.hostingSince
                                                  ).getFullYear()
                                                : new Date(
                                                      booking.host.createdAt
                                                  ).getFullYear()}
                                        </span>
                                        {booking.host.isSuperhost && (
                                            <span className="bg-yellow-50 text-yellow-700 text-sm px-3 py-1 rounded-full border border-yellow-100 ml-2">
                                                Superhost
                                            </span>
                                        )}
                                    </div>

                                    {booking.status === "confirmed" ? (
                                        <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                                            <h4 className="font-medium text-secondary-900 mb-3">
                                                Contact Information
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center bg-white p-3 rounded-lg border border-secondary-100">
                                                    <div className="bg-secondary-100 p-2 rounded-full mr-3">
                                                        <FaPhone className="text-secondary-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-secondary-600">
                                                            Phone
                                                        </p>
                                                        <p className="font-medium text-secondary-900">
                                                            {booking.host
                                                                .phone ||
                                                                "Not provided"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center bg-white p-3 rounded-lg border border-secondary-100">
                                                    <div className="bg-secondary-100 p-2 rounded-full mr-3">
                                                        <FaEnvelope className="text-secondary-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-secondary-600">
                                                            Email
                                                        </p>
                                                        <p className="font-medium text-secondary-900">
                                                            {booking.host
                                                                .email ||
                                                                "Not provided"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100 text-secondary-700">
                                            <div className="flex items-center">
                                                <FaInfoCircle className="text-secondary-400 mr-2" />
                                                <p>
                                                    Contact information will be
                                                    available once your booking
                                                    is confirmed.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Booking summary and actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-16 space-y-2">
                            {/* Price summary */}
                            <div className="bg-white rounded-xl shadow-md p-6 border border-secondary-200 animate-fadeIn animation-delay-200">
                                <h2 className="text-xl font-semibold mb-5 text-secondary-900 flex items-center">
                                    <FaRegMoneyBillAlt className="text-secondary-600 mr-2" />
                                    Price Details
                                </h2>
                                <div className="space-y-4 mb-5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-secondary-700">
                                            {formatPrice(
                                                booking.property.price
                                            )}{" "}
                                            x{" "}
                                            {calculateNights(
                                                booking.checkInDate,
                                                booking.checkOutDate
                                            )}{" "}
                                            nights
                                        </span>
                                        <span className="text-secondary-900 font-medium">
                                            {formatPrice(
                                                booking.property.price *
                                                    calculateNights(
                                                        booking.checkInDate,
                                                        booking.checkOutDate
                                                    )
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-secondary-700 flex items-center">
                                            Cleaning fee
                                            <FaInfoCircle
                                                className="text-secondary-400 ml-1 cursor-help"
                                                size={12}
                                                title="One-time fee charged by host for cleaning their space"
                                            />
                                        </span>
                                        <span className="text-secondary-900 font-medium">
                                            {formatPrice(
                                                booking.property.cleaningFee ||
                                                    0
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-secondary-700 flex items-center">
                                            Service fee
                                            <FaInfoCircle
                                                className="text-secondary-400 ml-1 cursor-help"
                                                size={12}
                                                title="Fee that helps support our platform and services"
                                            />
                                        </span>
                                        <span className="text-secondary-900 font-medium">
                                            {formatPrice(
                                                booking.property.serviceFee || 0
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-secondary-200 pt-4">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span className="text-secondary-900">
                                            Total
                                        </span>
                                        <span className="text-secondary-900">
                                            {formatPrice(booking.totalPrice)}
                                        </span>
                                    </div>
                                    <div className="mt-3">
                                        {booking.paymentStatus === "paid" ? (
                                            <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 flex items-center">
                                                <FaRegCreditCard className="text-green-600 mr-2" />
                                                <span className="font-medium">
                                                    Paid in full
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="bg-secondary-50 text-secondary-700 p-3 rounded-lg border border-secondary-100 flex items-center">
                                                <FaRegCreditCard className="text-secondary-600 mr-2" />
                                                <span>
                                                    Payment will be processed
                                                    upon arrival
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white rounded-xl shadow-md p-6 border border-secondary-200 animate-fadeIn animation-delay-300">
                                <h2 className="text-xl font-semibold mb-5 text-secondary-900">
                                    Booking Actions
                                </h2>

                                <div className="space-y-4">
                                    {/* Cancel booking button - only show if not cancelled or completed */}
                                    {booking.status !== "cancelled" &&
                                        booking.status !== "completed" && (
                                            <button
                                                onClick={() =>
                                                    setShowCancelModal(true)
                                                }
                                                className="w-full flex justify-center items-center px-4 py-3 border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                                            >
                                                <FaTimesCircle className="mr-2" />
                                                Cancel booking
                                            </button>
                                        )}

                                    {/* Contact host button */}
                                    <Link
                                        to={`/messages?hostId=${booking.host._id}`}
                                        className="w-full flex justify-center items-center px-4 py-3 bg-black text-white rounded-xl hover:bg-secondary-800 transition-colors font-medium"
                                    >
                                        <FaEnvelope className="mr-2" />
                                        Contact host
                                    </Link>

                                    {/* View property button */}
                                    <Link
                                        to={`/properties/${booking.property._id}`}
                                        className="w-full flex justify-center items-center px-4 py-3 bg-secondary-100 text-secondary-800 rounded-xl hover:bg-secondary-200 transition-colors font-medium"
                                    >
                                        <FaHome className="mr-2" />
                                        View property
                                    </Link>
                                </div>
                            </div>

                            {/* Safety notice */}
                            <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-200 animate-fadeIn animation-delay-400">
                                <div className="flex items-start">
                                    <div className="text-secondary-600 mr-3 mt-1">
                                        <FaShieldAlt size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-black mb-1">
                                            Booking Protection
                                        </h4>
                                        <p className="text-sm text-secondary-700">
                                            All bookings are covered by our
                                            Guest Refund Policy for issues like
                                            host cancellations, listing
                                            inaccuracies, or other problems.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cancel booking modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                            <h2 className="text-2xl font-semibold mb-5 text-secondary-900">
                                Cancel Booking
                            </h2>
                            <div className="mb-6">
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-start mb-5">
                                    <div className="bg-yellow-100 p-2 rounded-full mr-3 flex-shrink-0">
                                        <FaExclamationTriangle
                                            className="text-yellow-600"
                                            size={18}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-yellow-800 mb-1">
                                            Are you sure?
                                        </p>
                                        <p className="text-yellow-700 text-sm">
                                            Are you sure you want to cancel this
                                            booking? Please review the
                                            cancellation policy before
                                            proceeding.
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="cancelReason"
                                        className="form-label"
                                    >
                                        Reason for cancellation (optional)
                                    </label>
                                    <textarea
                                        id="cancelReason"
                                        rows="4"
                                        value={cancelReason}
                                        onChange={(e) =>
                                            setCancelReason(e.target.value)
                                        }
                                        className="input-field"
                                        placeholder="Please let us know why you're cancelling"
                                    ></textarea>
                                    <p className="mt-2 text-xs text-secondary-600">
                                        Your feedback helps us improve our
                                        service. The host will be notified of
                                        your cancellation.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="px-5 py-3 border border-secondary-300 rounded-xl hover:bg-secondary-50 text-secondary-700 font-medium transition-colors"
                                >
                                    Keep booking
                                </button>
                                <button
                                    onClick={handleCancelBooking}
                                    disabled={cancelBookingMutation.isLoading}
                                    className="px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-red-300 font-medium transition-colors flex justify-center items-center"
                                >
                                    {cancelBookingMutation.isLoading ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Cancelling...
                                        </>
                                    ) : (
                                        "Confirm cancellation"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BookingDetailPage
