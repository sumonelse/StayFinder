import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
    FaStar,
    FaMapMarkerAlt,
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
    FaRegCalendarAlt,
    FaInfoCircle,
    FaEnvelope,
    FaLock,
    FaTag,
    FaFlag,
    FaHome,
    FaList,
    FaComments,
    FaClipboardList,
    FaBookmark,
    FaChevronRight,
    FaChevronDown,
    FaCompass,
    FaUtensils,
    FaPizzaSlice,
    FaGlassMartiniAlt,
    FaLandmark,
    FaTree,
    FaStore,
    FaTheaterMasks,
    FaWalking,
    FaSubway,
    FaBus,
    FaBicycle,
    FaShoppingBasket,
    FaShoppingCart,
    FaPrescriptionBottleAlt,
    FaHospital,
    FaRegClock,
    FaRegSmile,
    FaRegCommentDots,
    FaExclamationTriangle,
    FaClock,
    FaTimesCircle,
    FaCheckCircle,
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
import PropertyRules from "../../components/property/PropertyRules"
import PropertyStatus from "../../components/property/PropertyStatus"
import LocationMap from "../../components/property/LocationMap"
import { Button, Badge, DatePicker } from "../../components/ui"
import { formatPrice } from "../../utils/currency"
import {
    calculateBookingPrice,
    calculateNights,
} from "../../utils/bookingCalculator"

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
    const [selectedDates, setSelectedDates] = useState({
        startDate: "",
        endDate: "",
    })
    const [guestCount, setGuestCount] = useState(1)
    const [stayDuration, setStayDuration] = useState(3)
    const [activeSection, setActiveSection] = useState("overview")
    const [showReportModal, setShowReportModal] = useState(false)

    // Refs for scrolling to sections
    const bookingSectionRef = useRef(null)
    const overviewRef = useRef(null)
    const amenitiesRef = useRef(null)
    const reviewsRef = useRef(null)
    const locationRef = useRef(null)
    const rulesRef = useRef(null)

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

    // Check if user has a booking for this property
    const [userHasBooking, setUserHasBooking] = useState(false)

    const { data: userBookingsData } = useQuery({
        queryKey: ["userBookingsForProperty", id, user?._id],
        queryFn: async () => {
            const result = await bookingService.getUserBookings()
            return result.bookings || []
        },
        enabled: !!id && isAuthenticated,
    })

    // Process booking data in useEffect to ensure it runs when data changes
    useEffect(() => {
        if (!userBookingsData || !Array.isArray(userBookingsData)) {
            return
        }

        // Check if property IDs match - convert to strings for safer comparison
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

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Calculate stay duration when dates change using our utility
    useEffect(() => {
        if (selectedDates.startDate && selectedDates.endDate) {
            const nights = calculateNights(
                selectedDates.startDate,
                selectedDates.endDate
            )
            setStayDuration(nights || 1)
        }
    }, [selectedDates])

    // Handle scroll to update active section
    useEffect(() => {
        if (propertyLoading || propertyError) return

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100

            // Get all section positions
            const sections = [
                { id: "overview", ref: overviewRef },
                { id: "amenities", ref: amenitiesRef },
                { id: "location", ref: locationRef },
                { id: "reviews", ref: reviewsRef },
                { id: "rules", ref: rulesRef },
            ]

            // Find the current active section
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i]
                if (
                    section.ref.current &&
                    section.ref.current.offsetTop <= scrollPosition
                ) {
                    setActiveSection(section.id)
                    break
                }
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [propertyLoading, propertyError])

    // Scroll to section function
    const scrollToSection = (sectionId) => {
        const sectionRefs = {
            overview: overviewRef,
            amenities: amenitiesRef,
            location: locationRef,
            reviews: reviewsRef,
            rules: rulesRef,
            booking: bookingSectionRef,
        }

        const ref = sectionRefs[sectionId]
        if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth" })
            setActiveSection(sectionId)
        }
    }

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

    // Scroll to booking section
    const scrollToBooking = () => {
        bookingSectionRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // Check if property can be booked (simple version for backward compatibility)
    const canBookProperty = () => {
        return property && property.isApproved && property.isAvailable
    }

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

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    // This function is no longer needed as we're using the DatePicker component
    // which handles date changes internally

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
                            {/* Booking card skeleton */}
                            <div className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6">
                                {/* Price skeleton */}
                                <div className="flex items-baseline justify-between mb-5">
                                    <div className="h-8 bg-secondary-200 rounded-lg w-24"></div>
                                    <div className="h-6 bg-secondary-200 rounded-lg w-16"></div>
                                </div>

                                {/* Calendar skeleton */}
                                <div className="mb-4">
                                    <div className="h-4 bg-secondary-200 rounded w-20 mb-2"></div>
                                    <div className="border border-secondary-200 rounded-lg p-4">
                                        <div className="grid grid-cols-7 gap-1 mb-4">
                                            {[...Array(7)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-8 bg-secondary-200 rounded"
                                                ></div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {[...Array(35)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-8 bg-secondary-100 rounded"
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Guest selector skeleton */}
                                <div className="mb-4">
                                    <div className="h-4 bg-secondary-200 rounded w-16 mb-2"></div>
                                    <div className="h-12 bg-secondary-200 rounded-lg"></div>
                                </div>

                                {/* Book button skeleton */}
                                <div className="h-12 bg-secondary-200 rounded-lg mb-4"></div>

                                {/* Total skeleton */}
                                <div className="h-6 bg-secondary-200 rounded w-32"></div>
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
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Back button and title */}
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                    <div className="animate-fadeIn">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center text-primary-600 hover:text-primary-800 mb-3 transition-colors"
                        >
                            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to search</span>
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-3 leading-tight">
                            {property.title}
                        </h1>

                        {/* Location and quick info */}
                        <div className="flex flex-wrap items-center text-secondary-700 mb-2">
                            <div className="flex items-center mr-4 mb-2 md:mb-0">
                                <FaMapMarkerAlt className="text-primary-500 mr-2" />
                                <span>
                                    {property.address.city},{" "}
                                    {property.address.state},{" "}
                                    {property.address.country}
                                </span>
                            </div>

                            {property.avgRating > 0 && (
                                <div className="flex items-center mr-4 mb-2 md:mb-0">
                                    <FaStar className="text-yellow-500 mr-1" />
                                    <span className="font-medium">
                                        {property.avgRating.toFixed(1)}
                                    </span>
                                    <span className="text-secondary-600 ml-1">
                                        ({property.reviewCount} reviews)
                                    </span>
                                </div>
                            )}

                            <Badge
                                color={property.isAvailable ? "green" : "red"}
                                className="mb-2 md:mb-0"
                            >
                                {property.isAvailable
                                    ? "Available"
                                    : "Unavailable"}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center mt-3 md:mt-0 space-x-2 animate-fadeIn animation-delay-200">
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center bg-white px-3 py-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-all shadow-sm hover:shadow-md"
                            aria-label="Share property"
                        >
                            <FaShare className="text-secondary-600 mr-2" />
                            <span>Share</span>
                        </button>

                        <button
                            onClick={handleToggleFavorite}
                            className={`flex items-center px-3 py-2 rounded-lg border transition-all shadow-sm hover:shadow-md ${
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
                <div className="mb-6">
                    <ImageGallery
                        images={property?.images || []}
                        alt={property?.title || "Property"}
                    />
                </div>

                {/* Share modal */}
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    title={property?.title || "Property"}
                    url={window.location.href}
                />

                {/* Report Listing Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 bg-secondary-900/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-fadeIn">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-secondary-900 flex items-center">
                                        <FaFlag className="text-red-500 mr-2" />
                                        Report this listing
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setShowReportModal(false)
                                        }
                                        className="text-secondary-500 hover:text-secondary-700"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <p className="text-secondary-700 mb-4">
                                    Please select a reason for reporting this
                                    property:
                                </p>

                                <div className="space-y-2 mb-4">
                                    {[
                                        "Inaccurate description or photos",
                                        "Suspicious or fraudulent listing",
                                        "Inappropriate content",
                                        "Property is not available",
                                        "Other concern",
                                    ].map((reason) => (
                                        <div
                                            key={reason}
                                            className="flex items-center p-3 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name="reportReason"
                                                id={reason}
                                                className="mr-3 text-primary-600 focus:ring-primary-500"
                                            />
                                            <label
                                                htmlFor={reason}
                                                className="flex-1 cursor-pointer"
                                            >
                                                {reason}
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-secondary-700 mb-2 font-medium">
                                        Additional details (optional)
                                    </label>
                                    <textarea
                                        className="w-full border-secondary-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        rows={3}
                                        placeholder="Please provide any additional information that might help us understand your concern..."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowReportModal(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            // Handle report submission
                                            setShowReportModal(false)
                                            // Show confirmation toast or message
                                        }}
                                    >
                                        Submit Report
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Section Navigation - Desktop */}
                <div className="hidden md:block sticky top-0 z-20 bg-white border-b border-secondary-100 shadow-sm mb-6">
                    <div className="container mx-auto">
                        <div className="flex items-center space-x-6 overflow-x-auto py-4 px-2">
                            <button
                                onClick={() => scrollToSection("overview")}
                                className={`flex items-center whitespace-nowrap px-3 py-2 rounded-lg transition-colors ${
                                    activeSection === "overview"
                                        ? "bg-primary-50 text-primary-700 font-medium"
                                        : "text-secondary-600 hover:bg-secondary-50"
                                }`}
                            >
                                <FaHome className="mr-2" size={14} />
                                Overview
                            </button>
                            <button
                                onClick={() => scrollToSection("amenities")}
                                className={`flex items-center whitespace-nowrap px-3 py-2 rounded-lg transition-colors ${
                                    activeSection === "amenities"
                                        ? "bg-primary-50 text-primary-700 font-medium"
                                        : "text-secondary-600 hover:bg-secondary-50"
                                }`}
                            >
                                <FaList className="mr-2" size={14} />
                                Amenities
                            </button>
                            <button
                                onClick={() => scrollToSection("location")}
                                className={`flex items-center whitespace-nowrap px-3 py-2 rounded-lg transition-colors ${
                                    activeSection === "location"
                                        ? "bg-primary-50 text-primary-700 font-medium"
                                        : "text-secondary-600 hover:bg-secondary-50"
                                }`}
                            >
                                <FaMapMarkerAlt className="mr-2" size={14} />
                                Location
                            </button>
                            <button
                                onClick={() => scrollToSection("reviews")}
                                className={`flex items-center whitespace-nowrap px-3 py-2 rounded-lg transition-colors ${
                                    activeSection === "reviews"
                                        ? "bg-primary-50 text-primary-700 font-medium"
                                        : "text-secondary-600 hover:bg-secondary-50"
                                }`}
                            >
                                <FaComments className="mr-2" size={14} />
                                Reviews
                            </button>
                            <button
                                onClick={() => scrollToSection("rules")}
                                className={`flex items-center whitespace-nowrap px-3 py-2 rounded-lg transition-colors ${
                                    activeSection === "rules"
                                        ? "bg-primary-50 text-primary-700 font-medium"
                                        : "text-secondary-600 hover:bg-secondary-50"
                                }`}
                            >
                                <FaClipboardList className="mr-2" size={14} />
                                House Rules
                            </button>
                            <button
                                onClick={() => scrollToSection("booking")}
                                className="flex items-center whitespace-nowrap px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors ml-auto"
                            >
                                <FaBookmark className="mr-2" size={14} />
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Book Button - Mobile Only */}
                <div className="md:hidden my-4">
                    {canBookProperty() ? (
                        <Button
                            variant="primary"
                            fullWidth
                            size="lg"
                            onClick={scrollToBooking}
                            className="sticky top-2 z-10 shadow-lg"
                        >
                            <div className="flex justify-between items-center w-full">
                                <span className="font-bold">
                                    {formatPrice(property.price)}
                                    <span className="font-normal text-sm">
                                        {" "}
                                        / night
                                    </span>
                                </span>
                                <span className="flex items-center">
                                    <FaCheckCircle className="mr-1" size={16} />
                                    Book Now
                                </span>
                            </div>
                        </Button>
                    ) : (
                        <div
                            className={`p-4 rounded-lg text-center border-2 ${
                                !property.isApproved
                                    ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                                    : "bg-red-50 text-red-800 border-red-200"
                            }`}
                        >
                            <div className="flex items-center justify-center mb-2">
                                {!property.isApproved ? (
                                    <FaClock className="mr-2" size={18} />
                                ) : (
                                    <FaTimesCircle className="mr-2" size={18} />
                                )}
                                <span className="font-semibold">
                                    {!property.isApproved
                                        ? "Under Review"
                                        : "Not Available"}
                                </span>
                            </div>
                            <p className="text-sm">
                                {!property.isApproved
                                    ? "This property is being reviewed and will be available soon."
                                    : "This property is currently unavailable for booking."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Property details and booking */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column - Property details */}
                    <div className="lg:col-span-2 animate-fadeIn animation-delay-200">
                        {/* Overview section */}
                        <div
                            ref={overviewRef}
                            id="overview"
                            className="scroll-mt-20"
                        >
                            {/* Compact Host info card */}
                            <div className="bg-white p-5 rounded-xl border border-secondary-100 shadow-sm mb-8 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                    <div className="flex items-center mb-4 sm:mb-0">
                                        <div className="mr-4">
                                            {property.host?.profilePicture ? (
                                                <img
                                                    src={
                                                        property.host
                                                            .profilePicture
                                                    }
                                                    alt={property.host.name}
                                                    className="h-14 w-14 rounded-full object-cover border-2 border-primary-100 shadow-sm"
                                                />
                                            ) : (
                                                <div className="h-14 w-14 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center border-2 border-primary-100 shadow-sm">
                                                    <span className="font-medium text-xl">
                                                        {property.host?.name
                                                            ?.charAt(0)
                                                            .toUpperCase() ||
                                                            "H"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-secondary-900 mb-1">
                                                Hosted by{" "}
                                                {property.host?.name || "Host"}
                                            </h2>
                                            <div className="flex flex-wrap items-center text-sm text-secondary-600">
                                                <span className="flex items-center mr-4 mb-1 sm:mb-0">
                                                    <FaRegCalendarAlt
                                                        className="mr-1 text-primary-500"
                                                        size={12}
                                                    />
                                                    Host since{" "}
                                                    {property.host?.createdAt
                                                        ? new Date(
                                                              property.host.createdAt
                                                          ).getFullYear()
                                                        : "N/A"}
                                                </span>

                                                {property.host?.avgRating && (
                                                    <span className="flex items-center mb-1 sm:mb-0">
                                                        <FaStar
                                                            className="mr-1 text-yellow-500"
                                                            size={12}
                                                        />
                                                        {property.host.avgRating.toFixed(
                                                            1
                                                        )}{" "}
                                                        rating
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        leftIcon={<FaEnvelope size={14} />}
                                        className="text-sm hover:bg-primary-50 hover:border-primary-200 transition-colors"
                                    >
                                        Contact Host
                                    </Button>
                                </div>
                            </div>

                            {/* Property Status Banner */}
                            <PropertyStatus
                                property={property}
                                showBanner={true}
                            />

                            {/* Property highlights */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white p-5 rounded-xl border border-secondary-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-primary-200 hover:shadow-md transition-all group">
                                    <div className="bg-primary-50 p-3 rounded-full mb-3 group-hover:bg-primary-100 transition-colors">
                                        <FaUsers
                                            className="text-primary-600"
                                            size={22}
                                        />
                                    </div>
                                    <span className="text-secondary-600 text-sm mb-1">
                                        Guests
                                    </span>
                                    <span className="font-semibold text-secondary-900 text-lg">
                                        {property.maxGuests}
                                    </span>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-secondary-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-primary-200 hover:shadow-md transition-all group">
                                    <div className="bg-primary-50 p-3 rounded-full mb-3 group-hover:bg-primary-100 transition-colors">
                                        <FaBed
                                            className="text-primary-600"
                                            size={22}
                                        />
                                    </div>
                                    <span className="text-secondary-600 text-sm mb-1">
                                        Bedrooms
                                    </span>
                                    <span className="font-semibold text-secondary-900 text-lg">
                                        {property.bedrooms}
                                    </span>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-secondary-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-primary-200 hover:shadow-md transition-all group">
                                    <div className="bg-primary-50 p-3 rounded-full mb-3 group-hover:bg-primary-100 transition-colors">
                                        <FaBath
                                            className="text-primary-600"
                                            size={22}
                                        />
                                    </div>
                                    <span className="text-secondary-600 text-sm mb-1">
                                        Bathrooms
                                    </span>
                                    <span className="font-semibold text-secondary-900 text-lg">
                                        {property.bathrooms}
                                    </span>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-secondary-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-primary-200 hover:shadow-md transition-all group">
                                    <div className="bg-primary-50 p-3 rounded-full mb-3 group-hover:bg-primary-100 transition-colors">
                                        <FaTag
                                            className="text-primary-600"
                                            size={22}
                                        />
                                    </div>
                                    <span className="text-secondary-600 text-sm mb-1">
                                        Property Type
                                    </span>
                                    <span className="font-semibold text-secondary-900 text-lg capitalize">
                                        {property.type}
                                    </span>
                                </div>
                            </div>

                            {/* Property description */}
                            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm mb-8 hover:shadow-md transition-shadow">
                                <h2 className="text-2xl font-semibold mb-4 text-secondary-900 flex items-center">
                                    <FaHome className="mr-3 text-primary-500" />
                                    About this place
                                </h2>
                                <div className="text-secondary-700 space-y-4 leading-relaxed">
                                    <p>{property.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div
                            ref={amenitiesRef}
                            id="amenities"
                            className="scroll-mt-20"
                        >
                            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm mb-8 hover:shadow-md transition-shadow">
                                <h2 className="text-2xl font-semibold mb-5 text-secondary-900 flex items-center">
                                    <FaList className="mr-3 text-primary-500" />
                                    What this place offers
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                                    {(showAllAmenities
                                        ? property.amenities
                                        : property.amenities.slice(0, 8)
                                    ).map((amenity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center text-secondary-700 group hover:text-secondary-900 transition-colors"
                                        >
                                            <div className="mr-4 bg-primary-50 p-2 rounded-full text-primary-600 group-hover:bg-primary-100 transition-colors">
                                                {getAmenityIcon(amenity)}
                                            </div>
                                            <span className="font-medium">
                                                {amenity}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {property.amenities.length > 8 && (
                                    <button
                                        onClick={() =>
                                            setShowAllAmenities(
                                                !showAllAmenities
                                            )
                                        }
                                        className="mt-6 flex items-center px-4 py-2 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                                    >
                                        {showAllAmenities ? (
                                            <>
                                                <FaChevronDown className="mr-2" />
                                                Show less
                                            </>
                                        ) : (
                                            <>
                                                <FaChevronRight className="mr-2" />
                                                Show all{" "}
                                                {property.amenities.length}{" "}
                                                amenities
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* House Rules */}
                        <div ref={rulesRef} id="rules" className="scroll-mt-20">
                            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm mb-8 hover:shadow-md transition-shadow">
                                <PropertyRules
                                    rules={property.rules || {}}
                                    showAll={false}
                                    maxInitialRules={5}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div
                            ref={locationRef}
                            id="location"
                            className="scroll-mt-20"
                        >
                            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm mb-8 hover:shadow-md transition-shadow">
                                <h2 className="text-2xl font-semibold mb-5 text-secondary-900 flex items-center">
                                    <FaMapMarkerAlt className="mr-3 text-primary-500" />
                                    Location
                                </h2>

                                {userHasBooking ? (
                                    // Show the map if user has a booking
                                    <div>
                                        <LocationMap
                                            coordinates={
                                                property.location?.coordinates
                                            }
                                            title={property.title}
                                            height="300px"
                                        />
                                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                                            <div className="flex items-start">
                                                <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-green-800">
                                                        Exact location shown
                                                    </p>
                                                    <p className="text-green-700 text-sm">
                                                        {
                                                            property.address
                                                                .street
                                                        }
                                                        ,{" "}
                                                        {property.address.city},{" "}
                                                        {property.address.state}
                                                        ,{" "}
                                                        {
                                                            property.address
                                                                .zipCode
                                                        }
                                                        ,{" "}
                                                        {
                                                            property.address
                                                                .country
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Show placeholder with limited info if user doesn't have a booking
                                    <div className="bg-secondary-50 rounded-xl h-[300px] flex items-center justify-center border border-secondary-100 overflow-hidden">
                                        <div className="text-center text-secondary-700 p-6">
                                            <div className="bg-white p-3 rounded-full inline-block mb-4 shadow-sm">
                                                <FaMapMarkerAlt
                                                    className="text-primary-500"
                                                    size={28}
                                                />
                                            </div>
                                            <p className="text-lg font-medium mb-2">
                                                {property.address.city},{" "}
                                                {property.address.state},{" "}
                                                {property.address.country}
                                            </p>
                                            <p className="mb-4">
                                                Neighborhood:{" "}
                                                {property.neighborhood ||
                                                    "Central area"}
                                            </p>
                                            <div className="bg-primary-50 p-3 rounded-lg inline-flex items-center text-primary-700 border border-primary-100">
                                                <FaLock
                                                    className="mr-2"
                                                    size={14}
                                                />
                                                <span className="text-sm font-medium">
                                                    Exact location provided
                                                    after booking
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-4 text-secondary-600 flex items-start">
                                    <FaInfoCircle className="text-primary-500 mr-2 mt-1 flex-shrink-0" />
                                    <p className="text-sm">
                                        The property is located in a quiet
                                        neighborhood, just 10 minutes from
                                        downtown and 15 minutes from the
                                        airport. Public transportation is easily
                                        accessible.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Local Recommendations */}
                        <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm mb-8 hover:shadow-md transition-shadow">
                            <h2 className="text-2xl font-semibold mb-5 text-secondary-900 flex items-center">
                                <FaCompass className="mr-3 text-primary-500" />
                                Local Recommendations
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                                    <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                        <FaUtensils className="text-primary-500 mr-2" />
                                        Dining
                                    </h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaCoffee className="text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Morning Brew Café
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    Great breakfast spot, 5 min
                                                    walk
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaPizzaSlice className="text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Napoli's Italian
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    Authentic Italian cuisine,
                                                    10 min walk
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaGlassMartiniAlt className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Skyline Lounge
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    Rooftop bar with city views,
                                                    15 min drive
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                                    <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                        <FaLandmark className="text-primary-500 mr-2" />
                                        Attractions
                                    </h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaTree className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Central Park
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    Beautiful park with walking
                                                    trails, 8 min walk
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaStore className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Downtown Shopping
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    Boutiques and local shops,
                                                    12 min drive
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaTheaterMasks className="text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    City Arts Center
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    Museum and performances, 20
                                                    min drive
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                                    <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                        <FaWalking className="text-primary-500 mr-2" />
                                        Getting Around
                                    </h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaSubway className="text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Metro Station
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    Central Line, 7 min walk
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaBus className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Bus Stop
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    Routes 10, 15, and 22, 3 min
                                                    walk
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaBicycle className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Bike Rental
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    City Bikes station, 5 min
                                                    walk
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                                    <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                        <FaShoppingBasket className="text-primary-500 mr-2" />
                                        Essentials
                                    </h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaShoppingCart className="text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Grocery Store
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    Fresh Market, 4 min walk
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaPrescriptionBottleAlt className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Pharmacy
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    City Pharmacy, 6 min walk
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                                                <FaHospital className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-secondary-900">
                                                    Medical Center
                                                </p>
                                                <p className="text-sm text-secondary-600">
                                                    Community Hospital, 10 min
                                                    drive
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div
                            ref={reviewsRef}
                            id="reviews"
                            className="scroll-mt-20"
                        >
                            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm mb-8 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                                    <h2 className="text-2xl font-semibold text-secondary-900 mb-4 sm:mb-0">
                                        <span className="flex items-center">
                                            <FaStar className="text-yellow-500 mr-2" />
                                            {property.avgRating
                                                ? `${property.avgRating.toFixed(
                                                      1
                                                  )} · ${
                                                      property.reviewCount
                                                  } reviews`
                                                : "No reviews yet"}
                                        </span>
                                    </h2>
                                    {property.reviewCount > 0 && (
                                        <Link
                                            to={`/properties/${id}/reviews`}
                                            className="flex items-center px-4 py-2 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                                        >
                                            <FaComments className="mr-2" />
                                            See all reviews
                                        </Link>
                                    )}
                                </div>

                                {/* Rating breakdown - Only show if there are reviews */}
                                {property.reviewCount > 0 && (
                                    <div className="bg-secondary-50 p-4 rounded-lg mb-6">
                                        <h3 className="font-medium text-secondary-900 mb-3">
                                            Rating Breakdown
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* These would be actual rating categories in a real app */}
                                            {[
                                                {
                                                    name: "Cleanliness",
                                                    value: 4.8,
                                                },
                                                {
                                                    name: "Accuracy",
                                                    value: 4.7,
                                                },
                                                {
                                                    name: "Communication",
                                                    value: 4.9,
                                                },
                                                {
                                                    name: "Location",
                                                    value: 4.6,
                                                },
                                                {
                                                    name: "Check-in",
                                                    value: 4.8,
                                                },
                                                { name: "Value", value: 4.5 },
                                            ].map((category) => (
                                                <div
                                                    key={category.name}
                                                    className="flex items-center"
                                                >
                                                    <span className="text-secondary-700 w-32">
                                                        {category.name}
                                                    </span>
                                                    <div className="flex-1 bg-secondary-200 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-primary-500 h-full rounded-full"
                                                            style={{
                                                                width: `${
                                                                    (category.value /
                                                                        5) *
                                                                    100
                                                                }%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="ml-2 text-secondary-700 font-medium">
                                                        {category.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                    <div className="text-secondary-600 bg-red-50 p-4 rounded-lg border border-red-100">
                                        <div className="flex items-center text-red-600 mb-2">
                                            <FaExclamationCircle className="mr-2" />
                                            <span className="font-medium">
                                                Error loading reviews
                                            </span>
                                        </div>
                                        <p>
                                            Please try again later or contact
                                            support if the problem persists.
                                        </p>
                                    </div>
                                ) : reviewsData?.reviews?.length > 0 ? (
                                    <div className="space-y-6">
                                        {reviewsData.reviews.map((review) => (
                                            <div
                                                key={review._id}
                                                className="animate-fadeIn border-b border-secondary-100 pb-6 last:border-0 hover:bg-secondary-50 p-3 rounded-lg transition-colors"
                                            >
                                                <div className="flex items-start mb-3">
                                                    <div className="mr-3">
                                                        {review.user
                                                            ?.profilePicture ? (
                                                            <img
                                                                src={
                                                                    review.user
                                                                        .profilePicture
                                                                }
                                                                alt={
                                                                    review.user
                                                                        .name
                                                                }
                                                                className="h-12 w-12 rounded-full object-cover border border-secondary-100 shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center border border-primary-50 shadow-sm">
                                                                <span className="font-medium text-lg">
                                                                    {review.user?.name
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() ||
                                                                        "G"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-secondary-900 text-lg">
                                                            {review.user
                                                                ?.name ||
                                                                "Guest"}
                                                        </div>
                                                        <div className="text-secondary-500 text-sm">
                                                            {formatDate(
                                                                review.createdAt
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center mb-3">
                                                    <div className="flex">
                                                        {[...Array(5)].map(
                                                            (_, i) => (
                                                                <FaStar
                                                                    key={i}
                                                                    className={
                                                                        i <
                                                                        review.rating
                                                                            ? "text-yellow-500"
                                                                            : "text-secondary-300"
                                                                    }
                                                                    size={16}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-secondary-700 leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        ))}

                                        {reviewsData.reviews.length <
                                            property.reviewCount && (
                                            <div className="text-center">
                                                <Link
                                                    to={`/properties/${id}/reviews`}
                                                    className="inline-flex items-center px-4 py-2 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                                                >
                                                    <FaChevronDown className="mr-2" />
                                                    Load more reviews
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-secondary-700 bg-secondary-50 p-6 rounded-lg border border-secondary-100 text-center">
                                        <FaComments className="mx-auto text-secondary-400 text-4xl mb-3" />
                                        <p className="font-medium mb-2">
                                            No reviews yet
                                        </p>
                                        <p className="text-secondary-600 mb-4">
                                            Be the first to leave a review for
                                            this property!
                                        </p>
                                        <Button variant="outline" size="sm">
                                            Write a review
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* House rules */}
                        <div ref={rulesRef} id="rules" className="scroll-mt-20">
                            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm mb-8 hover:shadow-md transition-shadow">
                                <h2 className="text-2xl font-semibold mb-5 text-secondary-900 flex items-center">
                                    <FaClipboardList className="mr-3 text-primary-500" />
                                    House rules
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-100 flex items-center text-secondary-700">
                                        <div className="bg-white p-3 rounded-full mr-4 shadow-sm">
                                            <FaCalendarAlt
                                                className="text-primary-500"
                                                size={20}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-medium text-secondary-900 mb-1">
                                                Check-in
                                            </div>
                                            <div className="text-lg">
                                                After 3:00 PM
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-100 flex items-center text-secondary-700">
                                        <div className="bg-white p-3 rounded-full mr-4 shadow-sm">
                                            <FaCalendarAlt
                                                className="text-primary-500"
                                                size={20}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-medium text-secondary-900 mb-1">
                                                Checkout
                                            </div>
                                            <div className="text-lg">
                                                Before 11:00 AM
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-lg border border-secondary-100 mb-4">
                                    <h3 className="font-semibold text-lg mb-4 text-secondary-900">
                                        Additional rules
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center text-secondary-700">
                                            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center mr-3 text-red-500">
                                                <FaCheck size={14} />
                                            </div>
                                            <span>No smoking</span>
                                        </div>
                                        <div className="flex items-center text-secondary-700">
                                            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center mr-3 text-red-500">
                                                <FaCheck size={14} />
                                            </div>
                                            <span>No parties or events</span>
                                        </div>
                                        <div className="flex items-center text-secondary-700">
                                            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mr-3 text-green-500">
                                                <FaCheck size={14} />
                                            </div>
                                            <span>
                                                Pets allowed (with restrictions)
                                            </span>
                                        </div>
                                        <div className="flex items-center text-secondary-700">
                                            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mr-3 text-green-500">
                                                <FaCheck size={14} />
                                            </div>
                                            <span>Self check-in available</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-secondary-600 flex items-start">
                                    <FaInfoCircle className="text-primary-500 mr-2 mt-1 flex-shrink-0" />
                                    <p className="text-sm">
                                        By booking this property, you agree to
                                        follow all house rules and acknowledge
                                        that violations may result in additional
                                        charges or termination of your stay
                                        without refund.
                                    </p>
                                </div>
                            </div>

                            {/* Cancellation policy */}
                            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm mb-8 hover:shadow-md transition-shadow">
                                <h2 className="text-2xl font-semibold mb-5 text-secondary-900 flex items-center">
                                    <FaRegCalendarAlt className="mr-3 text-primary-500" />
                                    Cancellation policy
                                </h2>
                                <div className="bg-secondary-50 p-5 rounded-lg border border-secondary-100 mb-4">
                                    <h3 className="font-semibold text-lg mb-3 text-secondary-900">
                                        Flexible
                                    </h3>
                                    <p className="text-secondary-700 mb-4 leading-relaxed">
                                        Free cancellation for 48 hours. After
                                        that, cancel before check-in and get a
                                        50% refund, minus the service fee.
                                    </p>
                                    <div className="flex items-start text-secondary-700 bg-white p-3 rounded-lg border border-secondary-100">
                                        <FaInfoCircle className="text-primary-500 mr-2 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium mb-1">
                                                Important note
                                            </p>
                                            <p className="text-sm">
                                                Review the host's full
                                                cancellation policy which
                                                applies even if you cancel for
                                                illness or disruptions caused by
                                                COVID-19.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <Button
                                        variant="text"
                                        className="text-primary-600 hover:text-primary-800"
                                        leftIcon={<FaChevronRight size={12} />}
                                    >
                                        Read full policy
                                    </Button>

                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        className="flex items-center text-secondary-500 hover:text-secondary-700 transition-colors"
                                    >
                                        <FaFlag className="mr-2" size={12} />
                                        <span className="text-sm">
                                            Report this listing
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Booking card */}
                    <div
                        className="lg:col-span-1 animate-fadeIn animation-delay-300"
                        ref={bookingSectionRef}
                        id="booking"
                    >
                        <div className="sticky top-24">
                            <div className="bg-white rounded-xl shadow-lg border border-secondary-100 overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-baseline justify-between mb-5">
                                        <div>
                                            <span className="text-3xl font-bold text-secondary-900">
                                                {formatPrice(property.price)}
                                            </span>
                                            <span className="text-secondary-600">
                                                {" "}
                                                / night
                                            </span>
                                        </div>
                                        {property.avgRating > 0 && (
                                            <div className="flex items-center bg-secondary-50 px-3 py-1 rounded-lg">
                                                <FaStar className="text-yellow-500 mr-1" />
                                                <span className="font-medium">
                                                    {property.avgRating.toFixed(
                                                        1
                                                    )}
                                                </span>
                                                <span className="text-secondary-600 ml-1">
                                                    ({property.reviewCount})
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-5">
                                        {/* Date selection with visual calendar */}
                                        <div className="mb-4">
                                            <label className="block text-xs text-secondary-500 mb-2 font-medium">
                                                SELECT DATES
                                            </label>

                                            <AvailabilityCalendar
                                                propertyId={id}
                                                initialStartDate={
                                                    selectedDates.startDate
                                                }
                                                initialEndDate={
                                                    selectedDates.endDate
                                                }
                                                onDateSelect={(dates) => {
                                                    setSelectedDates(dates)
                                                }}
                                            />

                                            {/* Quick date selection buttons */}
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const today = new Date()
                                                        const tomorrow =
                                                            new Date(today)
                                                        tomorrow.setDate(
                                                            tomorrow.getDate() +
                                                                1
                                                        )
                                                        const dayAfter =
                                                            new Date(today)
                                                        dayAfter.setDate(
                                                            dayAfter.getDate() +
                                                                2
                                                        )

                                                        setSelectedDates({
                                                            startDate: tomorrow
                                                                .toISOString()
                                                                .split("T")[0],
                                                            endDate: dayAfter
                                                                .toISOString()
                                                                .split("T")[0],
                                                        })
                                                    }}
                                                    className="px-3 py-1 text-xs bg-secondary-100 hover:bg-secondary-200 text-secondary-800 rounded-full transition-colors"
                                                >
                                                    Tomorrow · 1 night
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const today = new Date()
                                                        const thisWeekend =
                                                            new Date(today)
                                                        // Find the next Friday
                                                        const daysUntilFriday =
                                                            (5 -
                                                                today.getDay() +
                                                                7) %
                                                            7
                                                        thisWeekend.setDate(
                                                            today.getDate() +
                                                                daysUntilFriday
                                                        )

                                                        const sundayAfter =
                                                            new Date(
                                                                thisWeekend
                                                            )
                                                        sundayAfter.setDate(
                                                            thisWeekend.getDate() +
                                                                2
                                                        )

                                                        setSelectedDates({
                                                            startDate:
                                                                thisWeekend
                                                                    .toISOString()
                                                                    .split(
                                                                        "T"
                                                                    )[0],
                                                            endDate: sundayAfter
                                                                .toISOString()
                                                                .split("T")[0],
                                                        })
                                                    }}
                                                    className="px-3 py-1 text-xs bg-secondary-100 hover:bg-secondary-200 text-secondary-800 rounded-full transition-colors"
                                                >
                                                    This weekend
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const today = new Date()
                                                        const nextWeek =
                                                            new Date(today)
                                                        nextWeek.setDate(
                                                            today.getDate() + 7
                                                        )
                                                        const weekAfter =
                                                            new Date(today)
                                                        weekAfter.setDate(
                                                            today.getDate() + 14
                                                        )

                                                        setSelectedDates({
                                                            startDate: nextWeek
                                                                .toISOString()
                                                                .split("T")[0],
                                                            endDate: weekAfter
                                                                .toISOString()
                                                                .split("T")[0],
                                                        })
                                                    }}
                                                    className="px-3 py-1 text-xs bg-secondary-100 hover:bg-secondary-200 text-secondary-800 rounded-full transition-colors"
                                                >
                                                    Next week · 7 nights
                                                </button>
                                            </div>
                                        </div>

                                        {/* Guest selection */}
                                        <div className="p-4 border border-secondary-200 rounded-lg shadow-sm hover:border-primary-300 transition-colors">
                                            <label className="block text-xs text-secondary-500 mb-1 font-medium">
                                                GUESTS
                                            </label>
                                            <select
                                                value={guestCount}
                                                onChange={(e) =>
                                                    setGuestCount(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="w-full border-0 p-0 focus:ring-0 text-secondary-900 text-lg"
                                            >
                                                {[
                                                    ...Array(
                                                        property.maxGuests
                                                    ),
                                                ].map((_, i) => (
                                                    <option
                                                        key={i}
                                                        value={i + 1}
                                                    >
                                                        {i + 1}{" "}
                                                        {i === 0
                                                            ? "guest"
                                                            : "guests"}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {(() => {
                                        // Check if property can be booked
                                        if (!canBookProperty()) {
                                            return (
                                                <div className="mb-4">
                                                    <button
                                                        disabled
                                                        className="w-full bg-gray-400 text-white text-center py-3 text-lg font-medium rounded-lg cursor-not-allowed mb-2 opacity-75"
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            {!property.isApproved ? (
                                                                <>
                                                                    <FaClock className="mr-2" />
                                                                    Property
                                                                    Under Review
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaTimesCircle className="mr-2" />
                                                                    Property
                                                                    Unavailable
                                                                </>
                                                            )}
                                                        </div>
                                                    </button>
                                                    <div
                                                        className={`text-center text-sm p-3 rounded-lg ${
                                                            !property.isApproved
                                                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                                                : "bg-red-50 text-red-700 border border-red-200"
                                                        }`}
                                                    >
                                                        {!property.isApproved
                                                            ? "This property is being reviewed by our team. You'll be able to book once it's approved."
                                                            : "This property is currently not available for booking. Contact the host for more information."}
                                                    </div>
                                                </div>
                                            )
                                        }

                                        if (
                                            selectedDates.startDate &&
                                            selectedDates.endDate
                                        ) {
                                            return (
                                                <Link
                                                    to={`/properties/${id}/book?checkIn=${selectedDates.startDate}&checkOut=${selectedDates.endDate}&guests=${guestCount}`}
                                                    className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-3 text-lg font-medium mb-4 rounded-lg shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-primary-200"
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <FaCheckCircle className="mr-2" />
                                                        Book now
                                                    </div>
                                                </Link>
                                            )
                                        }

                                        return (
                                            <button
                                                disabled
                                                className="w-full bg-gray-300 text-gray-500 text-center py-3 text-lg font-medium mb-4 rounded-lg cursor-not-allowed"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <FaCalendarAlt className="mr-2" />
                                                    Select dates to book
                                                </div>
                                            </button>
                                        )
                                    })()}

                                    <div className="text-center text-secondary-600 text-sm mb-5 bg-secondary-50 py-2 rounded-lg">
                                        You won't be charged yet
                                    </div>

                                    {selectedDates.startDate &&
                                    selectedDates.endDate ? (
                                        <>
                                            <div className="space-y-3 text-secondary-700">
                                                {(() => {
                                                    const bookingPrice =
                                                        calculateBookingPrice(
                                                            property,
                                                            selectedDates.startDate,
                                                            selectedDates.endDate
                                                        )

                                                    return (
                                                        <>
                                                            <div className="flex justify-between items-center">
                                                                <span className="flex items-center">
                                                                    {formatPrice(
                                                                        property.price
                                                                    )}{" "}
                                                                    x{" "}
                                                                    {
                                                                        bookingPrice.nights
                                                                    }{" "}
                                                                    {bookingPrice.nights ===
                                                                    1
                                                                        ? "night"
                                                                        : "nights"}
                                                                    <FaInfoCircle
                                                                        className="ml-1 text-secondary-400 cursor-help"
                                                                        size={
                                                                            12
                                                                        }
                                                                        title={`Base rate per ${property.pricePeriod}`}
                                                                    />
                                                                </span>
                                                                <span>
                                                                    {formatPrice(
                                                                        bookingPrice.subtotal
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="flex items-center">
                                                                    Cleaning fee
                                                                    <FaInfoCircle
                                                                        className="ml-1 text-secondary-400 cursor-help"
                                                                        size={
                                                                            12
                                                                        }
                                                                        title="One-time fee charged by host to cover the cost of cleaning their space"
                                                                    />
                                                                </span>
                                                                <span>
                                                                    {formatPrice(
                                                                        bookingPrice.cleaningFee
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="flex items-center">
                                                                    Service fee
                                                                    <FaInfoCircle
                                                                        className="ml-1 text-secondary-400 cursor-help"
                                                                        size={
                                                                            12
                                                                        }
                                                                        title="This helps us run our platform and offer services like 24/7 support"
                                                                    />
                                                                </span>
                                                                <span>
                                                                    {formatPrice(
                                                                        bookingPrice.serviceFee
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <hr className="my-4 border-secondary-100" />

                                                            <div className="flex justify-between font-bold text-lg text-secondary-900">
                                                                <span>
                                                                    Total
                                                                </span>
                                                                <span>
                                                                    {formatPrice(
                                                                        bookingPrice.total
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-secondary-600 py-3">
                                            Select dates to see prices
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 bg-white rounded-xl shadow-sm border border-secondary-100 p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center text-secondary-700">
                                    <div className="bg-green-50 p-2 rounded-full mr-3 text-green-600">
                                        <FaShieldAlt className="flex-shrink-0" />
                                    </div>
                                    <span className="text-sm">
                                        To protect your payment, never transfer
                                        money or communicate outside of the
                                        StayFinder website or app.
                                    </span>
                                </div>
                            </div>

                            {/* Quick rules summary */}
                            <div className="mt-4 bg-white rounded-xl shadow-sm border border-secondary-100 p-4 hover:shadow-md transition-shadow">
                                <h3 className="font-medium text-secondary-900 mb-3 flex items-center">
                                    <FaClipboardList className="mr-2 text-primary-500" />
                                    Key things to know
                                </h3>
                                <div className="space-y-2 text-sm text-secondary-700">
                                    <div className="flex items-start">
                                        <FaRegClock className="mt-0.5 mr-2 text-primary-500 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                Check-in:
                                            </span>{" "}
                                            {property.rules?.checkIn ||
                                                "3:00 PM"}
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FaRegClock className="mt-0.5 mr-2 text-primary-500 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                Check-out:
                                            </span>{" "}
                                            {property.rules?.checkOut ||
                                                "11:00 AM"}
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FaRegSmile className="mt-0.5 mr-2 text-primary-500 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                Pets:
                                            </span>{" "}
                                            {property.rules?.pets
                                                ? "Allowed"
                                                : "Not allowed"}
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FaRegCommentDots className="mt-0.5 mr-2 text-primary-500 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                Parties:
                                            </span>{" "}
                                            {property.rules?.parties
                                                ? "Allowed"
                                                : "Not allowed"}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => scrollToSection("rules")}
                                    className="mt-3 text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                                >
                                    View all rules
                                    <FaChevronRight
                                        className="ml-1"
                                        size={12}
                                    />
                                </button>
                            </div>

                            {/* Contact Host Button */}
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    leftIcon={<FaEnvelope />}
                                    className="hover:bg-primary-50 hover:border-primary-200 transition-colors"
                                >
                                    Contact Host
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Properties Section */}
                <div className="mt-12 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-secondary-900 flex items-center">
                            <FaHome className="mr-3 text-primary-500" />
                            Similar Properties You Might Like
                        </h2>
                        <Link
                            to="/properties"
                            className="text-primary-600 hover:text-primary-800 font-medium flex items-center"
                        >
                            View all
                            <FaChevronRight className="ml-1" size={12} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* This would be populated with actual similar properties */}
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden hover:shadow-md transition-all group"
                            >
                                <div className="h-48 bg-secondary-100 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/50 to-transparent flex items-end p-3">
                                        <Badge
                                            color="primary"
                                            className="group-hover:bg-primary-600 transition-colors"
                                        >
                                            Similar
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-secondary-900 group-hover:text-primary-700 transition-colors">
                                            Similar Property {item}
                                        </h3>
                                        <div className="flex items-center text-sm">
                                            <FaStar className="text-yellow-500 mr-1" />
                                            <span>4.{item + 4}</span>
                                        </div>
                                    </div>
                                    <p className="text-secondary-600 text-sm mb-3">
                                        {property.address.city},{" "}
                                        {property.address.state}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-secondary-900">
                                            {formatPrice(
                                                property.price - 20 * item
                                            )}
                                            <span className="font-normal text-secondary-600 text-sm">
                                                {" "}
                                                / night
                                            </span>
                                        </span>
                                        <Button
                                            variant="text"
                                            size="sm"
                                            className="text-primary-600 hover:text-primary-800"
                                        >
                                            View
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky mobile booking bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
                <div className="flex items-center justify-between p-4">
                    <div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatPrice(property.price)}
                            <span className="text-sm font-normal text-gray-600">
                                {" "}
                                / night
                            </span>
                        </div>
                        {property.avgRating > 0 && (
                            <div className="flex items-center text-sm">
                                <FaStar
                                    className="text-yellow-500 mr-1"
                                    size={12}
                                />
                                <span>{property.avgRating.toFixed(1)}</span>
                                <span className="text-gray-500 ml-1">
                                    ({property.reviewCount})
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => scrollToSection("booking")}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Check availability
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PropertyDetailPage
