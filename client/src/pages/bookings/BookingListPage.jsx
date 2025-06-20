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
        return new Date(dateString).toLocaleDateString("en-US", {
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <FaSpinner className="mr-1" />
                        Pending
                    </span>
                )
            case "confirmed":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1" />
                        Confirmed
                    </span>
                )
            case "cancelled":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FaTimesCircle className="mr-1" />
                        Cancelled
                    </span>
                )
            case "completed":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        <FaCheckCircle className="mr-1" />
                        Completed
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                )
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

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>
                <div className="animate-pulse">
                    {[...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md p-6 mb-4"
                        >
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Error state
    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>
                        Error loading bookings:{" "}
                        {error?.message || "Please try again later."}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Your Bookings</h1>

                <div className="mt-4 md:mt-0">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center bg-white px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                    >
                        <FaFilter className="mr-2" />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            {isFilterOpen && (
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label
                                htmlFor="status"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Statuses</option>
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
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-xl font-semibold mb-2">
                        You don't have any bookings yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Start exploring properties and book your next stay!
                    </p>
                    <Link
                        to="/properties"
                        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
                    >
                        Find properties
                    </Link>
                </div>
            )}

            {/* Bookings list */}
            {data?.bookings?.length > 0 && (
                <div className="space-y-6">
                    {data.bookings.map((booking) => (
                        <Link
                            key={booking._id}
                            to={`/bookings/${booking._id}`}
                            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="md:flex">
                                {/* Property image */}
                                <div className="md:w-1/4 h-48 md:h-auto">
                                    <img
                                        src={
                                            booking.property.images[0]
                                                ? typeof booking.property
                                                      .images[0] === "object"
                                                    ? booking.property.images[0]
                                                          .url
                                                    : booking.property.images[0]
                                                : "https://via.placeholder.com/300x200?text=No+Image"
                                        }
                                        alt={booking.property.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Booking details */}
                                <div className="p-6 md:w-3/4">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-2">
                                        <h2 className="text-xl font-semibold mb-2 md:mb-0">
                                            {booking.property.title}
                                        </h2>
                                        <div>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <FaMapMarkerAlt className="mr-1 text-gray-400" />
                                        <span>
                                            {booking.property.address.city},{" "}
                                            {booking.property.address.country}
                                        </span>
                                    </div>

                                    {/* Dates and guests */}
                                    <div className="flex flex-col md:flex-row md:items-center text-gray-700 mb-4">
                                        <div className="flex items-center mr-6 mb-2 md:mb-0">
                                            <FaCalendarAlt className="mr-2 text-gray-500" />
                                            <span>
                                                {formatDate(booking.startDate)}{" "}
                                                - {formatDate(booking.endDate)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                {booking.guests} guest
                                                {booking.guests !== 1
                                                    ? "s"
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-sm text-gray-600">
                                                Booked on{" "}
                                                {formatDate(booking.createdAt)}
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold">
                                            {formatPrice(booking.totalPrice)}
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
                            onClick={() => handlePageChange(filters.page - 1)}
                            disabled={filters.page === 1}
                            className="px-3 py-1 rounded-md mr-2 bg-white border border-gray-300 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <div className="flex space-x-1">
                            {[...Array(data.totalPages)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-3 py-1 rounded-md ${
                                        filters.page === index + 1
                                            ? "bg-primary-600 text-white"
                                            : "bg-white border border-gray-300"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handlePageChange(filters.page + 1)}
                            disabled={filters.page === data.totalPages}
                            className="px-3 py-1 rounded-md ml-2 bg-white border border-gray-300 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    )
}

export default BookingListPage
