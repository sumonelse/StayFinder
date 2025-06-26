import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaFilter,
} from "react-icons/fa"
import { bookingService } from "../../services/api"
import { formatPrice } from "../../utils/currency"
import { BookingCardSkeleton } from "../../components/ui"

/**
 * Booking list page component
 * Displays a list of the user's bookings
 */
const BookingListPage = () => {
    const [filters, setFilters] = useState({
        status: "",
        page: 1,
        limit: 10,
    })
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    // Fetch user bookings
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["userBookings", filters],
        queryFn: () => bookingService.getUserBookings(filters),
    })

    // Format date
    const formatDate = (dateString) => {
        // Create a new date object and set time to noon to avoid timezone issues
        const date = new Date(dateString)
        date.setHours(12, 0, 0, 0)

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters((prev) => ({
            ...prev,
            [name]: value,
            page: 1, // Reset to first page when filters change
        }))
    }

    // Handle pagination
    const handlePageChange = (newPage) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }))
        window.scrollTo(0, 0)
    }

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <FaSpinner className="mr-1.5" size={10} />
                        Pending
                    </span>
                )
            case "confirmed":
                return (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <FaCheckCircle className="mr-1.5" size={10} />
                        Confirmed
                    </span>
                )
            case "cancelled":
                return (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        <FaTimesCircle className="mr-1.5" size={10} />
                        Cancelled
                    </span>
                )
            case "completed":
                return (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <FaCheckCircle className="mr-1.5" size={10} />
                        Completed
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 border border-secondary-200">
                        {status}
                    </span>
                )
        }
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-secondary-50">
                <div className="container mx-auto px-4 py-6 md:py-8">
                    <h1 className="text-2xl md:text-3xl font-semibold text-black mb-8">
                        Your trips
                    </h1>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                            <BookingCardSkeleton key={index} />
                        ))}
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
                    <h1 className="text-2xl md:text-3xl font-semibold text-black mb-8">
                        Your trips
                    </h1>
                    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                                <FaTimesCircle
                                    className="text-red-600"
                                    size={20}
                                />
                            </div>
                            <div>
                                <h3 className="font-medium text-red-800 mb-1">
                                    Error loading bookings
                                </h3>
                                <p className="text-sm">
                                    {error?.message ||
                                        "Please try again later."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="container mx-auto px-4 py-6 md:py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-black">
                            Your trips
                        </h1>
                        <p className="text-secondary-600 mt-1 text-sm md:text-base">
                            Manage your bookings and reservations
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center bg-white px-4 py-2.5 rounded-xl border border-secondary-300 hover:border-secondary-400 hover:shadow-sm transition-all text-sm font-medium"
                        >
                            <FaFilter
                                className="mr-2 text-secondary-500"
                                size={14}
                            />
                            <span className="text-secondary-700">Filter</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {isFilterOpen && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-200 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label
                                    htmlFor="status"
                                    className="block text-sm font-medium text-black mb-2"
                                >
                                    Filter by status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="w-full p-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
                                >
                                    <option value="">All bookings</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* No bookings message */}
                {data?.bookings?.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-12 text-center">
                        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaCalendarAlt
                                className="text-secondary-400"
                                size={24}
                            />
                        </div>
                        <h2 className="text-xl font-semibold text-black mb-3">
                            No trips yet
                        </h2>
                        <p className="text-secondary-600 mb-8 max-w-md mx-auto">
                            Time to dust off your bags and start planning your
                            next adventure
                        </p>
                        <Link
                            to="/properties"
                            className="inline-block bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-secondary-800 transition-colors"
                        >
                            Start searching
                        </Link>
                    </div>
                )}

                {/* Bookings list */}
                {data?.bookings?.length > 0 && (
                    <div className="space-y-4">
                        {data.bookings.map((booking) => (
                            <Link
                                key={booking._id}
                                to={`/bookings/${booking._id}`}
                                className="block bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md hover:border-secondary-300 transition-all group"
                            >
                                <div className="md:flex">
                                    {/* Property image */}
                                    <div className="md:w-1/3 h-48 md:h-40 relative overflow-hidden">
                                        <img
                                            src={
                                                booking.property.images[0]
                                                    ? typeof booking.property
                                                          .images[0] ===
                                                      "object"
                                                        ? booking.property
                                                              .images[0].url
                                                        : booking.property
                                                              .images[0]
                                                    : "https://via.placeholder.com/300x200?text=No+Image"
                                            }
                                            alt={booking.property.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3">
                                            {getStatusBadge(booking.status)}
                                        </div>
                                    </div>

                                    {/* Booking details */}
                                    <div className="p-6 md:w-2/3 flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-black mb-2 group-hover:text-secondary-700 transition-colors">
                                                {booking.property.title}
                                            </h2>

                                            {/* Location */}
                                            <div className="flex items-center text-secondary-500 mb-3">
                                                <FaMapMarkerAlt
                                                    className="mr-2"
                                                    size={12}
                                                />
                                                <span className="text-sm">
                                                    {
                                                        booking.property.address
                                                            .city
                                                    }
                                                    ,{" "}
                                                    {
                                                        booking.property.address
                                                            .country
                                                    }
                                                </span>
                                            </div>

                                            {/* Dates */}
                                            <div className="flex items-center text-secondary-600 mb-3">
                                                <FaCalendarAlt
                                                    className="mr-2 text-secondary-400"
                                                    size={14}
                                                />
                                                <span className="text-sm">
                                                    {formatDate(
                                                        booking.checkInDate
                                                    )}{" "}
                                                    –{" "}
                                                    {formatDate(
                                                        booking.checkOutDate
                                                    )}
                                                </span>
                                            </div>

                                            {/* Guests */}
                                            <div className="text-sm text-secondary-600 mb-4">
                                                {booking.numberOfGuests} guest
                                                {booking.numberOfGuests !== 1
                                                    ? "s"
                                                    : ""}
                                            </div>
                                        </div>

                                        {/* Price and booking date */}
                                        <div className="flex justify-between items-end">
                                            <div className="text-xs text-secondary-500">
                                                Booked{" "}
                                                {formatDate(booking.createdAt)}
                                            </div>
                                            <div className="text-lg font-semibold text-black">
                                                {formatPrice(
                                                    booking.totalPrice
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {data?.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <nav className="flex items-center">
                            <button
                                onClick={() =>
                                    handlePageChange(filters.page - 1)
                                }
                                disabled={filters.page === 1}
                                className="px-3 py-1 rounded-md mr-2 bg-white border border-secondary-300 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <div className="flex space-x-1">
                                {[...Array(data.totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            handlePageChange(index + 1)
                                        }
                                        className={`px-3 py-1 rounded-md ${
                                            filters.page === index + 1
                                                ? "bg-primary-600 text-white"
                                                : "bg-white border border-secondary-300"
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() =>
                                    handlePageChange(filters.page + 1)
                                }
                                disabled={filters.page === data.totalPages}
                                className="px-3 py-1 rounded-md ml-2 bg-white border border-secondary-300 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BookingListPage
