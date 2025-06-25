import { useState, useEffect } from "react"
import { useParams, useNavigate, Link, useLocation } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaUsers,
    FaCreditCard,
    FaCheckCircle,
    FaExclamationCircle,
    FaSpinner,
    FaMapMarkerAlt,
    FaBed,
    FaBath,
    FaShieldAlt,
    FaInfoCircle,
    FaRegClock,
    FaRegStar,
    FaRegSmile,
    FaRegCommentDots,
    FaClipboardList,
} from "react-icons/fa"
import { propertyService, bookingService } from "../../services/api"
import { formatPrice } from "../../utils/currency"
import { calculateBookingPrice } from "../../utils/bookingCalculator"
import { formatDate } from "../../utils/dateUtils"
import { useAuth } from "../../context/AuthContext"
import PropertyRules from "../../components/property/PropertyRules"
import AvailabilityCalendar from "../../components/property/AvailabilityCalendar"

/**
 * Enhanced Booking page component
 * Allows users to book a property by selecting dates and guests with a modern UI
 */
const BookingPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()

    // Parse query parameters
    const queryParams = new URLSearchParams(location.search)
    const checkInParam = queryParams.get("checkIn")
    const checkOutParam = queryParams.get("checkOut")
    const guestsParam = queryParams.get("guests")

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Form state
    const [bookingData, setBookingData] = useState({
        checkInDate: checkInParam || "",
        checkOutDate: checkOutParam || "",
        numberOfGuests: guestsParam ? parseInt(guestsParam) : 1,
        specialRequests: "",
    })

    // Validation state
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch property details
    const {
        data: property,
        isLoading: propertyLoading,
        isError: propertyError,
    } = useQuery({
        queryKey: ["property", id],
        queryFn: () => propertyService.getPropertyById(id),
    })

    // Create booking mutation
    const createBookingMutation = useMutation({
        mutationFn: (data) => bookingService.createBooking(data),
        onSuccess: (data) => {
            navigate(`/bookings/${data._id}`, {
                state: { success: true },
            })
        },
        onError: (error) => {
            console.error("Booking error:", error)
            setErrors({
                submit:
                    error.message ||
                    "Failed to create booking. Please try again.",
            })
            setIsSubmitting(false)
        },
    })

    // Check availability when dates change
    const {
        data: availabilityData,
        isLoading: availabilityLoading,
        refetch: checkAvailability,
    } = useQuery({
        queryKey: [
            "availability",
            id,
            bookingData.checkInDate,
            bookingData.checkOutDate,
        ],
        queryFn: () =>
            bookingService.getPropertyAvailability(id, {
                checkInDate: bookingData.checkInDate,
                checkOutDate: bookingData.checkOutDate,
            }),
        enabled: !!(id && bookingData.checkInDate && bookingData.checkOutDate),
    })

    // Calculate booking details using our utility function
    const calculateBookingDetails = () => {
        if (
            !property ||
            !bookingData.checkInDate ||
            !bookingData.checkOutDate
        ) {
            return {
                nights: 0,
                subtotal: 0,
                cleaningFee: 0,
                serviceFee: 0,
                total: 0,
            }
        }

        return calculateBookingPrice(
            property,
            bookingData.checkInDate,
            bookingData.checkOutDate
        )
    }

    const bookingDetails = calculateBookingDetails()

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setBookingData((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Clear related errors
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }))
        }
    }

    // Handle date selection from calendar
    const handleDateSelect = (dates) => {
        setBookingData((prev) => ({
            ...prev,
            checkInDate: dates.startDate || prev.checkInDate,
            checkOutDate: dates.endDate || prev.checkOutDate,
        }))

        // Clear related errors
        if (errors.checkInDate || errors.checkOutDate) {
            setErrors((prev) => ({
                ...prev,
                checkInDate: undefined,
                checkOutDate: undefined,
            }))
        }
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        if (!bookingData.checkInDate) {
            newErrors.checkInDate = "Check-in date is required"
        }

        if (!bookingData.checkOutDate) {
            newErrors.checkOutDate = "Check-out date is required"
        }

        if (bookingData.checkInDate && bookingData.checkOutDate) {
            const start = new Date(bookingData.checkInDate)
            const end = new Date(bookingData.checkOutDate)

            if (start >= end) {
                newErrors.checkOutDate =
                    "Check-out date must be after check-in date"
            }

            // Create a new Date object for today and set hours to beginning of day
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // Create a copy of the start date and set time to noon to avoid timezone issues
            const checkInDate = new Date(start)
            checkInDate.setHours(12, 0, 0, 0)

            // Compare the dates properly
            if (checkInDate < today) {
                newErrors.checkInDate = "Check-in date cannot be in the past"
            }
        }

        if (!bookingData.numberOfGuests || bookingData.numberOfGuests < 1) {
            newErrors.numberOfGuests = "At least 1 guest is required"
        }

        if (property && bookingData.numberOfGuests > property.maxGuests) {
            newErrors.numberOfGuests = `Maximum ${property.maxGuests} guests allowed`
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        // Check availability one more time
        if (bookingData.checkInDate && bookingData.checkOutDate) {
            const result = await checkAvailability()

            if (!result.data.available) {
                setErrors({
                    submit: "Sorry, these dates are no longer available. Please select different dates.",
                })
                return
            }
        }

        setIsSubmitting(true)

        // Create booking data
        const bookingPayload = {
            propertyId: id,
            checkInDate: bookingData.checkInDate,
            checkOutDate: bookingData.checkOutDate,
            numberOfGuests: parseInt(bookingData.numberOfGuests),
            specialRequests: bookingData.specialRequests,
            totalPrice: bookingDetails.total,
        }

        createBookingMutation.mutate(bookingPayload)
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                                <div className="h-8 bg-secondary-200 rounded-xl w-1/4 mb-6"></div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="h-12 bg-secondary-200 rounded-lg"></div>
                                    <div className="h-12 bg-secondary-200 rounded-lg"></div>
                                </div>

                                <div className="h-8 bg-secondary-200 rounded-xl w-1/4 mb-4"></div>
                                <div className="h-12 bg-secondary-200 rounded-lg mb-6"></div>

                                <div className="h-8 bg-secondary-200 rounded-xl w-1/4 mb-4"></div>
                                <div className="h-24 bg-secondary-200 rounded-lg mb-6"></div>

                                <div className="h-12 bg-secondary-200 rounded-lg w-1/3 ml-auto"></div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-6 border border-secondary-200">
                                <div className="h-8 bg-secondary-200 rounded-xl w-2/3 mb-6"></div>
                                <div className="flex mb-6">
                                    <div className="w-24 h-24 bg-secondary-200 rounded-lg mr-4"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-secondary-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
                                    </div>
                                </div>
                                <div className="h-4 bg-secondary-200 rounded w-full mb-3"></div>
                                <div className="h-4 bg-secondary-200 rounded w-full mb-3"></div>
                                <div className="h-4 bg-secondary-200 rounded w-full mb-6"></div>
                                <div className="h-6 bg-secondary-200 rounded w-full"></div>
                            </div>
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
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6 md:py-8">
                {/* Back button and title */}
                <div className="mb-6 md:mb-8 animate-fadeIn">
                    <button
                        onClick={() => navigate(`/properties/${id}`)}
                        className="flex items-center text-gray-600 hover:text-black mb-4 transition-colors group"
                    >
                        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to property</span>
                    </button>
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-semibold text-black">
                            Request to book
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base">
                            Your trip to {property.title}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left column - Booking form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6 animate-fadeIn animation-delay-100">
                            <h2 className="text-xl font-semibold mb-8 text-black">
                                Your trip
                            </h2>

                            <form onSubmit={handleSubmit}>
                                {/* Dates */}
                                <div className="mb-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                                            <FaCalendarAlt className="text-white text-sm" />
                                        </div>
                                        <h3 className="text-lg font-medium text-black">
                                            Dates
                                        </h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 md:p-6">
                                        <AvailabilityCalendar
                                            propertyId={id}
                                            onDateSelect={handleDateSelect}
                                            initialStartDate={
                                                bookingData.checkInDate
                                            }
                                            initialEndDate={
                                                bookingData.checkOutDate
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            {errors.checkInDate && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <FaExclamationCircle
                                                        className="mr-1"
                                                        size={12}
                                                    />
                                                    {errors.checkInDate}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            {errors.checkOutDate && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <FaExclamationCircle
                                                        className="mr-1"
                                                        size={12}
                                                    />
                                                    {errors.checkOutDate}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Availability message */}
                                    {bookingData.checkInDate &&
                                        bookingData.checkOutDate && (
                                            <div className="mt-4">
                                                {availabilityLoading ? (
                                                    <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                        <FaSpinner className="animate-spin mr-2 text-gray-400" />
                                                        <span className="text-sm">
                                                            Checking
                                                            availability...
                                                        </span>
                                                    </div>
                                                ) : availabilityData?.available ? (
                                                    <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                                                        <FaCheckCircle className="mr-2 text-green-600" />
                                                        <span className="font-medium text-sm">
                                                            Available for your
                                                            dates
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                                                        <FaExclamationCircle className="mr-2 text-red-600" />
                                                        <span className="font-medium text-sm">
                                                            Sorry, not available
                                                            for these dates
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </div>

                                {/* Guests */}
                                <div className="mb-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                                            <FaUsers className="text-white text-sm" />
                                        </div>
                                        <h3 className="text-lg font-medium text-black">
                                            Guests
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        <select
                                            id="numberOfGuests"
                                            name="numberOfGuests"
                                            value={bookingData.numberOfGuests}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                                                errors.numberOfGuests
                                                    ? "border-red-300 focus:ring-red-500"
                                                    : "border-gray-300 hover:border-gray-400"
                                            }`}
                                        >
                                            {[...Array(property.maxGuests)].map(
                                                (_, i) => (
                                                    <option
                                                        key={i + 1}
                                                        value={i + 1}
                                                    >
                                                        {i + 1} guest
                                                        {i !== 0 ? "s" : ""}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                        {errors.numberOfGuests && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <FaExclamationCircle
                                                    className="mr-2"
                                                    size={12}
                                                />
                                                {errors.numberOfGuests}
                                            </p>
                                        )}

                                        <div className="bg-gray-50 p-4 rounded-xl text-gray-600 text-sm">
                                            <p className="flex items-start">
                                                <FaInfoCircle className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    This property can
                                                    accommodate up to{" "}
                                                    {property.maxGuests} guests.
                                                    Additional guests may not be
                                                    allowed.
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* House Rules */}
                                <div className="mb-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                                            <FaClipboardList className="text-white text-sm" />
                                        </div>
                                        <h3 className="text-lg font-medium text-black">
                                            House rules
                                        </h3>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <PropertyRules
                                            rules={property?.rules || {}}
                                            showAll={true}
                                            className="text-sm"
                                        />

                                        <div className="mt-6 pt-4 border-t border-gray-200 text-gray-600 text-sm">
                                            <p className="flex items-start">
                                                <FaInfoCircle className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    By proceeding with this
                                                    booking, you agree to follow
                                                    the house rules set by the
                                                    host.
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Special requests */}
                                <div className="mb-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                                            <FaRegCommentDots className="text-white text-sm" />
                                        </div>
                                        <h3 className="text-lg font-medium text-black">
                                            Add a message for your host
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        <textarea
                                            id="specialRequests"
                                            name="specialRequests"
                                            value={bookingData.specialRequests}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Let the host know why you're traveling, who's coming with you, or anything else they should know."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none hover:border-gray-400"
                                        ></textarea>

                                        <div className="text-gray-500 text-sm">
                                            <p className="flex items-start">
                                                <FaRegSmile className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    Tell your host about your
                                                    trip to help them prepare
                                                    for your stay.
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment info */}
                                <div className="mb-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                                            <FaShieldAlt className="text-white text-sm" />
                                        </div>
                                        <h3 className="text-lg font-medium text-black">
                                            Booking protection
                                        </h3>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                                        <div className="flex items-start">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                                <FaShieldAlt
                                                    className="text-green-600"
                                                    size={16}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">
                                                    You won't be charged yet
                                                </h4>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    We'll secure your booking,
                                                    and payment will be
                                                    collected by the host after
                                                    confirmation.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                                <FaRegClock
                                                    className="text-blue-600"
                                                    size={16}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">
                                                    Free cancellation
                                                </h4>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    Cancel for free before{" "}
                                                    {formatDate(
                                                        (() => {
                                                            const date =
                                                                new Date()
                                                            date.setDate(
                                                                date.getDate() +
                                                                    2
                                                            )
                                                            return date
                                                        })(),
                                                        { format: "short" }
                                                    )}
                                                    . Review the host's full
                                                    cancellation policy.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit error */}
                                {errors.submit && (
                                    <div className="mb-6">
                                        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center">
                                            <FaExclamationCircle className="text-red-500 mr-3 flex-shrink-0" />
                                            <p className="text-sm">
                                                {errors.submit}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Submit button */}
                                <div className="pt-6 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            (bookingData.checkInDate &&
                                                bookingData.checkOutDate &&
                                                availabilityData &&
                                                !availabilityData.available)
                                        }
                                        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Request to book"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right column - Booking summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 animate-fadeIn animation-delay-200">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                                {/* Property info */}
                                <div className="flex mb-6 pb-6 border-b border-gray-100">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden mr-4 flex-shrink-0">
                                        <img
                                            src={
                                                property.images[0]
                                                    ? typeof property
                                                          .images[0] ===
                                                      "object"
                                                        ? property.images[0].url
                                                        : property.images[0]
                                                    : "https://via.placeholder.com/100x100?text=No+Image"
                                            }
                                            alt={property.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-black text-sm mb-1 truncate">
                                            {property.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-2 flex items-center">
                                            <FaMapMarkerAlt
                                                className="text-gray-400 mr-1"
                                                size={10}
                                            />
                                            {property.address.city},{" "}
                                            {property.address.country}
                                        </p>
                                        <div className="flex text-xs text-gray-500 space-x-3">
                                            <span className="flex items-center">
                                                <FaBed
                                                    className="text-gray-400 mr-1"
                                                    size={10}
                                                />
                                                {property.bedrooms} bed
                                                {property.bedrooms !== 1
                                                    ? "s"
                                                    : ""}
                                            </span>
                                            <span className="flex items-center">
                                                <FaBath
                                                    className="text-gray-400 mr-1"
                                                    size={10}
                                                />
                                                {property.bathrooms} bath
                                                {property.bathrooms !== 1
                                                    ? "s"
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Trip details */}
                                {bookingData.checkInDate &&
                                bookingData.checkOutDate ? (
                                    <div className="mb-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                        Check-in
                                                    </p>
                                                    <p className="font-medium text-black text-sm">
                                                        {formatDate(
                                                            bookingData.checkInDate,
                                                            {
                                                                format: "custom",
                                                                options: {
                                                                    weekday:
                                                                        "short",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                },
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                        Check-out
                                                    </p>
                                                    <p className="font-medium text-black text-sm">
                                                        {(() => {
                                                            const date =
                                                                new Date(
                                                                    bookingData.checkOutDate
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
                                                                }
                                                            )
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="py-3">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                    Guests
                                                </p>
                                                <p className="font-medium text-black text-sm">
                                                    {bookingData.numberOfGuests}{" "}
                                                    {bookingData.numberOfGuests ===
                                                    1
                                                        ? "guest"
                                                        : "guests"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm text-gray-600">
                                        <p className="flex items-center">
                                            <FaInfoCircle className="text-gray-400 mr-2" />
                                            Select your dates to see the total
                                            price
                                        </p>
                                    </div>
                                )}

                                {/* Price details */}
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm underline">
                                                {formatPrice(property.price)} x{" "}
                                                {bookingDetails.nights || "0"}{" "}
                                                nights
                                            </span>
                                            <span className="text-black text-sm">
                                                {formatPrice(
                                                    bookingDetails.subtotal
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm underline flex items-center">
                                                Cleaning fee
                                                <FaInfoCircle
                                                    className="text-gray-400 ml-1 cursor-help"
                                                    size={12}
                                                    title="One-time fee charged by host for cleaning their space"
                                                />
                                            </span>
                                            <span className="text-black text-sm">
                                                {formatPrice(
                                                    bookingDetails.cleaningFee
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm underline flex items-center">
                                                Service fee
                                                <FaInfoCircle
                                                    className="text-gray-400 ml-1 cursor-help"
                                                    size={12}
                                                    title="Fee that helps support our platform and services"
                                                />
                                            </span>
                                            <span className="text-black text-sm">
                                                {formatPrice(
                                                    bookingDetails.serviceFee
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-black font-semibold">
                                                Total (INR)
                                            </span>
                                            <span className="text-black font-semibold text-lg">
                                                {formatPrice(
                                                    bookingDetails.total
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Safety notice */}
                            <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                                <div className="flex items-start">
                                    <div className="text-primary-500 mr-3 mt-1">
                                        <FaShieldAlt size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-secondary-900 mb-1">
                                            Safe booking guarantee
                                        </h4>
                                        <p className="text-sm text-secondary-700">
                                            Book with confidence. Your payment
                                            is protected by our secure payment
                                            system.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingPage
