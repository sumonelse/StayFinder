import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
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
} from "react-icons/fa"
import { propertyService, bookingService } from "../../services/api"
import { formatPrice } from "../../utils/currency"
import { useAuth } from "../../context/AuthContext"

/**
 * Enhanced Booking page component
 * Allows users to book a property by selecting dates and guests with a modern UI
 */
const BookingPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Form state
    const [bookingData, setBookingData] = useState({
        startDate: "",
        endDate: "",
        guests: 1,
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
            bookingData.startDate,
            bookingData.endDate,
        ],
        queryFn: () =>
            bookingService.getPropertyAvailability(id, {
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
            }),
        enabled: !!(id && bookingData.startDate && bookingData.endDate),
    })

    // Calculate booking details
    const calculateBookingDetails = () => {
        if (!property || !bookingData.startDate || !bookingData.endDate) {
            return {
                nights: 0,
                subtotal: 0,
                cleaningFee: 0,
                serviceFee: 0,
                total: 0,
            }
        }

        // Calculate number of nights
        const start = new Date(bookingData.startDate)
        const end = new Date(bookingData.endDate)
        const nights = Math.round((end - start) / (1000 * 60 * 60 * 24))

        // Calculate fees
        const subtotal = property.price * nights
        const cleaningFee = property.cleaningFee || 0
        const serviceFee = property.serviceFee || Math.round(subtotal * 0.12)
        const total = subtotal + cleaningFee + serviceFee

        return {
            nights,
            subtotal,
            cleaningFee,
            serviceFee,
            total,
        }
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

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        if (!bookingData.startDate) {
            newErrors.startDate = "Check-in date is required"
        }

        if (!bookingData.endDate) {
            newErrors.endDate = "Check-out date is required"
        }

        if (bookingData.startDate && bookingData.endDate) {
            const start = new Date(bookingData.startDate)
            const end = new Date(bookingData.endDate)

            if (start >= end) {
                newErrors.endDate = "Check-out date must be after check-in date"
            }

            if (start < new Date().setHours(0, 0, 0, 0)) {
                newErrors.startDate = "Check-in date cannot be in the past"
            }
        }

        if (!bookingData.guests || bookingData.guests < 1) {
            newErrors.guests = "At least 1 guest is required"
        }

        if (property && bookingData.guests > property.maxGuests) {
            newErrors.guests = `Maximum ${property.maxGuests} guests allowed`
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
        if (bookingData.startDate && bookingData.endDate) {
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
            property: id,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            guests: parseInt(bookingData.guests),
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
        <div className="container mx-auto px-4 py-8">
            {/* Back button and title */}
            <div className="mb-8 animate-fadeIn">
                <button
                    onClick={() => navigate(`/properties/${id}`)}
                    className="flex items-center text-primary-600 hover:text-primary-800 mb-3 transition-colors"
                >
                    <FaArrowLeft className="mr-2" />
                    <span className="font-medium">Back to property</span>
                </button>
                <h1 className="text-3xl md:text-4xl font-bold text-secondary-900">
                    Complete your booking
                </h1>
                <p className="text-secondary-600 mt-2">
                    You're just a few steps away from your stay at{" "}
                    {property.title}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Booking form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-secondary-100 animate-fadeIn animation-delay-100">
                        <h2 className="text-2xl font-semibold mb-6 text-secondary-900 flex items-center">
                            <FaRegStar className="text-primary-500 mr-3" />
                            Your trip details
                        </h2>

                        <form onSubmit={handleSubmit}>
                            {/* Dates */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-3 text-secondary-900 flex items-center">
                                    <FaCalendarAlt className="text-primary-500 mr-2" />
                                    Select dates
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="startDate"
                                            className="form-label"
                                        >
                                            Check-in
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaCalendarAlt className="text-secondary-400" />
                                            </div>
                                            <input
                                                type="date"
                                                id="startDate"
                                                name="startDate"
                                                value={bookingData.startDate}
                                                onChange={handleInputChange}
                                                className={`input-field pl-10 ${
                                                    errors.startDate
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                        : ""
                                                }`}
                                            />
                                        </div>
                                        {errors.startDate && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <FaExclamationCircle
                                                    className="mr-1"
                                                    size={12}
                                                />
                                                {errors.startDate}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="endDate"
                                            className="form-label"
                                        >
                                            Check-out
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaCalendarAlt className="text-secondary-400" />
                                            </div>
                                            <input
                                                type="date"
                                                id="endDate"
                                                name="endDate"
                                                value={bookingData.endDate}
                                                onChange={handleInputChange}
                                                className={`input-field pl-10 ${
                                                    errors.endDate
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                        : ""
                                                }`}
                                            />
                                        </div>
                                        {errors.endDate && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <FaExclamationCircle
                                                    className="mr-1"
                                                    size={12}
                                                />
                                                {errors.endDate}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Availability message */}
                                {bookingData.startDate &&
                                    bookingData.endDate && (
                                        <div className="mt-3">
                                            {availabilityLoading ? (
                                                <p className="text-secondary-600 flex items-center">
                                                    <FaSpinner className="animate-spin mr-2" />
                                                    Checking availability...
                                                </p>
                                            ) : availabilityData?.available ? (
                                                <p className="text-green-600 flex items-center bg-green-50 p-2 rounded-lg border border-green-100">
                                                    <FaCheckCircle className="mr-2" />
                                                    <span className="font-medium">
                                                        Available for your dates
                                                    </span>
                                                </p>
                                            ) : (
                                                <p className="text-red-600 flex items-center bg-red-50 p-2 rounded-lg border border-red-100">
                                                    <FaExclamationCircle className="mr-2" />
                                                    <span className="font-medium">
                                                        Sorry, not available for
                                                        these dates
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                            </div>

                            {/* Guests */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-3 text-secondary-900 flex items-center">
                                    <FaUsers className="text-primary-500 mr-2" />
                                    Number of guests
                                </h3>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUsers className="text-secondary-400" />
                                    </div>
                                    <select
                                        id="guests"
                                        name="guests"
                                        value={bookingData.guests}
                                        onChange={handleInputChange}
                                        className={`input-field pl-10 appearance-none ${
                                            errors.guests
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : ""
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
                                </div>
                                {errors.guests && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <FaExclamationCircle
                                            className="mr-1"
                                            size={12}
                                        />
                                        {errors.guests}
                                    </p>
                                )}

                                <div className="mt-3 bg-secondary-50 p-3 rounded-lg border border-secondary-100 text-secondary-700 text-sm flex items-start">
                                    <FaInfoCircle className="text-primary-500 mr-2 mt-0.5" />
                                    <span>
                                        This property can accommodate up to{" "}
                                        {property.maxGuests} guests. Additional
                                        guests may not be allowed.
                                    </span>
                                </div>
                            </div>

                            {/* Special requests */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-3 text-secondary-900 flex items-center">
                                    <FaRegCommentDots className="text-primary-500 mr-2" />
                                    Special requests
                                </h3>
                                <textarea
                                    id="specialRequests"
                                    name="specialRequests"
                                    value={bookingData.specialRequests}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Let the host know if you have any special requirements or questions"
                                    className="input-field"
                                ></textarea>

                                <div className="mt-3 text-secondary-600 text-sm flex items-center">
                                    <FaRegSmile className="text-primary-500 mr-2" />
                                    <span>
                                        Special requests are subject to host
                                        approval and availability.
                                    </span>
                                </div>
                            </div>

                            {/* Payment info */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-3 text-secondary-900 flex items-center">
                                    <FaCreditCard className="text-primary-500 mr-2" />
                                    Payment information
                                </h3>
                                <div className="bg-secondary-50 p-5 rounded-xl border border-secondary-100">
                                    <div className="flex items-start mb-4">
                                        <div className="bg-primary-100 p-2 rounded-full mr-3">
                                            <FaShieldAlt
                                                className="text-primary-600"
                                                size={18}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-secondary-900 mb-1">
                                                Secure booking process
                                            </h4>
                                            <p className="text-secondary-700">
                                                You won't be charged yet. We'll
                                                secure your booking, and payment
                                                will be collected by the host
                                                after confirmation.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-primary-100 p-2 rounded-full mr-3">
                                            <FaRegClock
                                                className="text-primary-600"
                                                size={18}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-secondary-900 mb-1">
                                                Flexible cancellation
                                            </h4>
                                            <p className="text-secondary-700">
                                                Free cancellation before{" "}
                                                {new Date(
                                                    new Date().setDate(
                                                        new Date().getDate() + 2
                                                    )
                                                ).toLocaleDateString()}
                                                . Review the host's full
                                                cancellation policy which
                                                applies even if you cancel for
                                                illness or disruptions caused by
                                                COVID-19.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit error */}
                            {errors.submit && (
                                <div className="mb-6">
                                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center">
                                        <FaExclamationCircle className="text-red-500 mr-3 flex-shrink-0" />
                                        <p>{errors.submit}</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        (bookingData.startDate &&
                                            bookingData.endDate &&
                                            availabilityData &&
                                            !availabilityData.available)
                                    }
                                    className="btn btn-primary py-3 px-8 text-lg flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Confirm and book"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right column - Booking summary */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 animate-fadeIn animation-delay-200">
                        <div className="bg-white rounded-xl shadow-md p-6 border border-secondary-200 mb-6">
                            <h2 className="text-xl font-semibold mb-5 text-secondary-900">
                                Booking summary
                            </h2>

                            {/* Property info */}
                            <div className="flex mb-6">
                                <div className="w-24 h-24 rounded-lg overflow-hidden mr-4 border border-secondary-100 shadow-sm">
                                    <img
                                        src={
                                            property.images[0]
                                                ? typeof property.images[0] ===
                                                  "object"
                                                    ? property.images[0].url
                                                    : property.images[0]
                                                : "https://via.placeholder.com/100x100?text=No+Image"
                                        }
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-medium text-secondary-900 line-clamp-1 mb-1">
                                        {property.title}
                                    </h3>
                                    <p className="text-sm text-secondary-600 mb-1 flex items-center">
                                        <FaMapMarkerAlt
                                            className="text-primary-500 mr-1"
                                            size={12}
                                        />
                                        {property.address.city},{" "}
                                        {property.address.country}
                                    </p>
                                    <div className="flex text-sm text-secondary-600 space-x-3">
                                        <span className="flex items-center">
                                            <FaBed
                                                className="text-primary-500 mr-1"
                                                size={12}
                                            />
                                            {property.bedrooms}{" "}
                                            {property.bedrooms !== 1
                                                ? "bedrooms"
                                                : "bedroom"}
                                        </span>
                                        <span className="flex items-center">
                                            <FaBath
                                                className="text-primary-500 mr-1"
                                                size={12}
                                            />
                                            {property.bathrooms}{" "}
                                            {property.bathrooms !== 1
                                                ? "baths"
                                                : "bath"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Trip details */}
                            {bookingData.startDate && bookingData.endDate ? (
                                <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-100 mb-6">
                                    <h3 className="font-medium text-secondary-900 mb-2">
                                        Trip details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-secondary-600">
                                                Check-in
                                            </p>
                                            <p className="font-medium text-secondary-900">
                                                {new Date(
                                                    bookingData.startDate
                                                ).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-secondary-600">
                                                Check-out
                                            </p>
                                            <p className="font-medium text-secondary-900">
                                                {new Date(
                                                    bookingData.endDate
                                                ).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-secondary-600">
                                                Guests
                                            </p>
                                            <p className="font-medium text-secondary-900">
                                                {bookingData.guests}{" "}
                                                {bookingData.guests === 1
                                                    ? "guest"
                                                    : "guests"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 mb-6 text-sm text-secondary-700">
                                    <p className="flex items-center">
                                        <FaInfoCircle className="text-primary-500 mr-2" />
                                        Select your dates to see the total price
                                    </p>
                                </div>
                            )}

                            {/* Price details */}
                            <div className="border-t border-secondary-200 pt-4 mb-4">
                                <h3 className="font-medium mb-3 text-secondary-900">
                                    Price details
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-secondary-700">
                                            {formatPrice(property.price)} x{" "}
                                            {bookingDetails.nights || "0"}{" "}
                                            nights
                                        </span>
                                        <span className="text-secondary-900">
                                            {formatPrice(
                                                bookingDetails.subtotal
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary-700 flex items-center">
                                            Cleaning fee
                                            <FaInfoCircle
                                                className="text-secondary-400 ml-1 cursor-help"
                                                size={12}
                                                title="One-time fee charged by host for cleaning their space"
                                            />
                                        </span>
                                        <span className="text-secondary-900">
                                            {formatPrice(
                                                bookingDetails.cleaningFee
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary-700 flex items-center">
                                            Service fee
                                            <FaInfoCircle
                                                className="text-secondary-400 ml-1 cursor-help"
                                                size={12}
                                                title="Fee that helps support our platform and services"
                                            />
                                        </span>
                                        <span className="text-secondary-900">
                                            {formatPrice(
                                                bookingDetails.serviceFee
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-secondary-200 pt-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span className="text-secondary-900">
                                        Total
                                    </span>
                                    <span className="text-secondary-900">
                                        {formatPrice(bookingDetails.total)}
                                    </span>
                                </div>
                                <p className="text-secondary-600 text-sm mt-1 text-right">
                                    {property.pricePeriod === "nightly"
                                        ? "for your stay"
                                        : "for the first month"}
                                </p>
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
                                        Book with confidence. Your payment is
                                        protected by our secure payment system.
                                    </p>
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
