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
    FaStar,
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
} from "react-icons/fa"
import { bookingService } from "../../services/api"
import { formatPrice } from "../../utils/currency"

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
                cancelReason,
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
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-50 text-yellow-800 border border-yellow-200 shadow-sm">
                        <FaSpinner className="mr-2 animate-spin" />
                        Pending Confirmation
                    </span>
                )
            case "confirmed":
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-50 text-green-800 border border-green-200 shadow-sm">
                        <FaCheckCircle className="mr-2" />
                        Confirmed
                    </span>
                )
            case "cancelled":
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-50 text-red-800 border border-red-200 shadow-sm">
                        <FaTimesCircle className="mr-2" />
                        Cancelled
                    </span>
                )
            case "completed":
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-50 text-primary-800 border border-primary-200 shadow-sm">
                        <FaCheckCircle className="mr-2" />
                        Completed
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-secondary-50 text-secondary-800 border border-secondary-200 shadow-sm">
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
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="flex items-center mb-8">
                        <div className="h-10 w-10 bg-secondary-200 rounded-full mr-4"></div>
                        <div className="h-8 bg-secondary-200 rounded-xl w-1/3"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                                <div className="md:flex">
                                    <div className="md:w-1/3 h-48 bg-secondary-200"></div>
                                    <div className="p-6 md:w-2/3">
                                        <div className="h-6 bg-secondary-200 rounded-lg w-3/4 mb-4"></div>
                                        <div className="h-4 bg-secondary-200 rounded-lg w-1/2 mb-4"></div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="h-12 bg-secondary-200 rounded-lg"></div>
                                            <div className="h-12 bg-secondary-200 rounded-lg"></div>
                                            <div className="h-12 bg-secondary-200 rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <div className="h-6 bg-secondary-200 rounded-lg w-1/4 mb-6"></div>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div className="h-24 bg-secondary-200 rounded-lg"></div>
                                    <div className="h-24 bg-secondary-200 rounded-lg"></div>
                                </div>
                                <div className="h-24 bg-secondary-200 rounded-lg mb-6"></div>
                                <div className="h-16 bg-secondary-200 rounded-lg"></div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <div className="h-6 bg-secondary-200 rounded-lg w-1/2 mb-6"></div>
                                <div className="space-y-4 mb-6">
                                    <div className="h-4 bg-secondary-200 rounded-lg"></div>
                                    <div className="h-4 bg-secondary-200 rounded-lg"></div>
                                    <div className="h-4 bg-secondary-200 rounded-lg"></div>
                                </div>
                                <div className="h-6 bg-secondary-200 rounded-lg w-1/2 mt-6"></div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="h-6 bg-secondary-200 rounded-lg w-1/2 mb-6"></div>
                                <div className="space-y-4">
                                    <div className="h-10 bg-secondary-200 rounded-lg"></div>
                                    <div className="h-10 bg-secondary-200 rounded-lg"></div>
                                    <div className="h-10 bg-secondary-200 rounded-lg"></div>
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
                            Error loading booking
                        </h3>
                        <p>
                            We couldn't load the booking details:{" "}
                            {error?.message || "Please try again later."}
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
            {/* Success message */}
            {showSuccessMessage && (
                <div className="bg-green-50 border border-green-100 text-green-700 p-5 rounded-xl mb-8 flex items-start animate-fadeIn">
                    <div className="bg-green-100 p-3 rounded-full mr-4 flex-shrink-0">
                        <FaCheckCircle className="text-green-600" size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-800 mb-1">
                            Booking successful!
                        </h3>
                        <p className="text-green-700">
                            Your booking request has been sent to the host.
                            You'll receive a confirmation once it's approved.
                        </p>
                    </div>
                </div>
            )}

            {/* Back button and title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-fadeIn">
                <div>
                    <button
                        onClick={() => navigate("/bookings")}
                        className="flex items-center text-primary-600 hover:text-primary-800 mb-3 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        <span className="font-medium">Back to bookings</span>
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-secondary-900">
                        Booking Details
                    </h1>
                </div>
                <div className="mt-4 md:mt-0">
                    {getStatusBadge(booking.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Booking details */}
                <div className="lg:col-span-2">
                    {/* Property details */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-secondary-100 animate-fadeIn animation-delay-100">
                        <div className="md:flex">
                            {/* Property image */}
                            <div className="md:w-1/3 h-56 md:h-auto relative">
                                <img
                                    src={
                                        booking.property.images[0] ||
                                        "https://via.placeholder.com/300x200?text=No+Image"
                                    }
                                    alt={booking.property.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black bg-opacity-60 text-white">
                                        <FaRegBuilding className="mr-1" />
                                        {booking.property.type
                                            .charAt(0)
                                            .toUpperCase() +
                                            booking.property.type.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Property info */}
                            <div className="p-6 md:w-2/3">
                                <Link
                                    to={`/properties/${booking.property._id}`}
                                    className="text-xl font-semibold text-secondary-900 hover:text-primary-600 transition-colors"
                                >
                                    {booking.property.title}
                                </Link>

                                {/* Location */}
                                <div className="flex items-center text-secondary-600 mt-2 mb-4">
                                    <FaMapMarkerAlt className="mr-2 text-primary-500" />
                                    <span>
                                        {booking.property.address.street},{" "}
                                        {booking.property.address.city},{" "}
                                        {booking.property.address.country}
                                    </span>
                                </div>

                                {/* Property details */}
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="flex flex-col items-center p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                        <FaHome className="text-primary-500 mb-1" />
                                        <p className="text-secondary-600 text-xs">
                                            Type
                                        </p>
                                        <p className="font-medium text-secondary-900 capitalize">
                                            {booking.property.type}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                        <FaBed className="text-primary-500 mb-1" />
                                        <p className="text-secondary-600 text-xs">
                                            Bedrooms
                                        </p>
                                        <p className="font-medium text-secondary-900">
                                            {booking.property.bedrooms}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                        <FaBath className="text-primary-500 mb-1" />
                                        <p className="text-secondary-600 text-xs">
                                            Bathrooms
                                        </p>
                                        <p className="font-medium text-secondary-900">
                                            {booking.property.bathrooms}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking information */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-secondary-100 animate-fadeIn animation-delay-200">
                        <h2 className="text-2xl font-semibold mb-6 text-secondary-900 flex items-center">
                            <FaRegCalendarCheck className="text-primary-500 mr-3" />
                            Booking Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-secondary-50 p-5 rounded-xl border border-secondary-100">
                                <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                    <FaCalendarAlt className="text-primary-500 mr-2" />
                                    Stay Dates
                                </h3>
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-secondary-100">
                                        <div className="flex items-center">
                                            <div className="bg-primary-100 p-2 rounded-full mr-3">
                                                <FaRegCalendarCheck className="text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-secondary-600">
                                                    Check-in
                                                </p>
                                                <p className="font-medium text-secondary-900">
                                                    {new Date(
                                                        booking.startDate
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-secondary-100 px-2 py-1 rounded text-secondary-700">
                                            From 3 PM
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-secondary-100">
                                        <div className="flex items-center">
                                            <div className="bg-primary-100 p-2 rounded-full mr-3">
                                                <FaRegCalendarTimes className="text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-secondary-600">
                                                    Check-out
                                                </p>
                                                <p className="font-medium text-secondary-900">
                                                    {new Date(
                                                        booking.endDate
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-secondary-100 px-2 py-1 rounded text-secondary-700">
                                            By 11 AM
                                        </span>
                                    </div>

                                    <div className="text-center bg-primary-50 py-2 px-4 rounded-lg border border-primary-100">
                                        <span className="font-medium text-primary-700">
                                            {calculateNights(
                                                booking.startDate,
                                                booking.endDate
                                            )}{" "}
                                            nights
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-secondary-50 p-5 rounded-xl border border-secondary-100">
                                <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                    <FaUsers className="text-primary-500 mr-2" />
                                    Guest Information
                                </h3>
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-secondary-100">
                                        <div className="flex items-center">
                                            <div className="bg-primary-100 p-2 rounded-full mr-3">
                                                <FaRegUser className="text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-secondary-600">
                                                    Number of guests
                                                </p>
                                                <p className="font-medium text-secondary-900">
                                                    {booking.guests}{" "}
                                                    {booking.guests === 1
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
                                            {new Date(
                                                booking.createdAt
                                            ).toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Special requests */}
                        {booking.specialRequests && (
                            <div className="mb-8">
                                <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                    <FaRegCommentDots className="text-primary-500 mr-2" />
                                    Special Requests
                                </h3>
                                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                                    <p className="text-secondary-800 italic">
                                        "{booking.specialRequests}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Booking status information */}
                        <div className="mb-8">
                            <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                <FaInfoCircle className="text-primary-500 mr-2" />
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
                                                Waiting for host confirmation
                                            </p>
                                            <p className="text-yellow-700">
                                                The host typically responds
                                                within 24 hours. You'll receive
                                                a notification once your booking
                                                is confirmed.
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
                                                Your booking has been confirmed
                                                by the host. You're all set for
                                                your stay! Check your email for
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
                                                {booking.cancelledBy === "user"
                                                    ? "You cancelled this booking."
                                                    : "This booking was cancelled by the host."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {booking.status === "completed" && (
                                    <div className="bg-primary-50 p-5 flex items-start">
                                        <div className="bg-primary-100 p-3 rounded-full mr-4 flex-shrink-0">
                                            <FaCheckCircle
                                                className="text-primary-600"
                                                size={20}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-primary-800 mb-1">
                                                Stay completed
                                            </p>
                                            <p className="text-primary-700 mb-2">
                                                Your stay has been completed. We
                                                hope you had a great time!
                                            </p>
                                            {!booking.hasReview && (
                                                <Link
                                                    to={`/reviews/add?propertyId=${booking.property._id}&bookingId=${booking._id}`}
                                                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
                        <div>
                            <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                <FaRegClock className="text-primary-500 mr-2" />
                                Cancellation Policy
                            </h3>
                            <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100 text-secondary-800">
                                <p className="mb-2">
                                    <span className="font-medium">
                                        Free cancellation
                                    </span>{" "}
                                    until 48 hours before check-in. After that,
                                    the first night is non-refundable.
                                </p>
                                <p className="text-sm text-secondary-600">
                                    Review the host's full cancellation policy
                                    which applies even if you cancel for illness
                                    or disruptions caused by COVID-19.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Host information */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-secondary-100 animate-fadeIn animation-delay-300">
                        <h2 className="text-2xl font-semibold mb-6 text-secondary-900 flex items-center">
                            <FaRegUser className="text-primary-500 mr-3" />
                            Host Information
                        </h2>
                        <div className="flex flex-col md:flex-row md:items-start">
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6 border-4 border-secondary-100 shadow-sm">
                                <img
                                    src={
                                        booking.property.host.avatar ||
                                        "https://via.placeholder.com/100x100?text=Host"
                                    }
                                    alt={booking.property.host.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-xl text-secondary-900 mb-1">
                                    {booking.property.host.name}
                                </h3>
                                <div className="flex items-center mb-4">
                                    <span className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full border border-primary-100">
                                        Host since{" "}
                                        {new Date(
                                            booking.property.host.createdAt
                                        ).getFullYear()}
                                    </span>
                                    {booking.property.host.isSuperhost && (
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
                                                <div className="bg-primary-100 p-2 rounded-full mr-3">
                                                    <FaPhone className="text-primary-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-secondary-600">
                                                        Phone
                                                    </p>
                                                    <p className="font-medium text-secondary-900">
                                                        {booking.property.host
                                                            .phone ||
                                                            "Not provided"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center bg-white p-3 rounded-lg border border-secondary-100">
                                                <div className="bg-primary-100 p-2 rounded-full mr-3">
                                                    <FaEnvelope className="text-primary-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-secondary-600">
                                                        Email
                                                    </p>
                                                    <p className="font-medium text-secondary-900">
                                                        {booking.property.host
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
                                            <FaInfoCircle className="text-primary-500 mr-2" />
                                            <p>
                                                Contact information will be
                                                available once your booking is
                                                confirmed.
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
                    <div className="sticky top-8 space-y-6">
                        {/* Price summary */}
                        <div className="bg-white rounded-xl shadow-md p-6 border border-secondary-200 animate-fadeIn animation-delay-200">
                            <h2 className="text-xl font-semibold mb-5 text-secondary-900 flex items-center">
                                <FaRegMoneyBillAlt className="text-primary-500 mr-2" />
                                Price Details
                            </h2>
                            <div className="space-y-4 mb-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-secondary-700">
                                        {formatPrice(booking.property.price)} x{" "}
                                        {calculateNights(
                                            booking.startDate,
                                            booking.endDate
                                        )}{" "}
                                        nights
                                    </span>
                                    <span className="text-secondary-900 font-medium">
                                        {formatPrice(
                                            booking.property.price *
                                                calculateNights(
                                                    booking.startDate,
                                                    booking.endDate
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
                                            booking.property.cleaningFee || 0
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
                                            <FaRegCreditCard className="text-primary-500 mr-2" />
                                            <span>
                                                Payment will be processed upon
                                                arrival
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
                                    to={`/messages?hostId=${booking.property.host._id}`}
                                    className="w-full flex justify-center items-center px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
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
                                <div className="text-primary-500 mr-3 mt-1">
                                    <FaShieldAlt size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-secondary-900 mb-1">
                                        Booking Protection
                                    </h4>
                                    <p className="text-sm text-secondary-700">
                                        All bookings are covered by our Guest
                                        Refund Policy for issues like host
                                        cancellations, listing inaccuracies, or
                                        other problems.
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
                                        booking? Please review the cancellation
                                        policy before proceeding.
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
                                    Your feedback helps us improve our service.
                                    The host will be notified of your
                                    cancellation.
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
    )
}

export default BookingDetailPage
