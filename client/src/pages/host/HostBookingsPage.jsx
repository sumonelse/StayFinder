import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    FaCalendarAlt,
    FaSearch,
    FaFilter,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaExclamationTriangle,
    FaRegClock,
    FaCommentAlt,
} from "react-icons/fa"
import { bookingService } from "../../services/api"
import { formatPrice } from "../../utils/currency"

/**
 * Host bookings page component
 * Displays a list of bookings for the host's properties
 * Redesigned with Airbnb-style grey/black color scheme
 */
const HostBookingsPage = () => {
    const queryClient = useQueryClient()
    const [filters, setFilters] = useState({
        status: "",
        propertyId: "",
        search: "",
        page: 1,
        limit: 10,
    })
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [showActionModal, setShowActionModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [actionType, setActionType] = useState("")
    const [actionReason, setActionReason] = useState("")

    // Fetch host bookings
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["hostBookings", filters],
        queryFn: () => bookingService.getHostBookings(filters),
    })

    // Update booking status mutation
    const updateBookingStatusMutation = useMutation({
        mutationFn: ({ id, status, reason }) =>
            bookingService.updateBookingStatus(id, {
                status,
                reason,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries(["hostBookings"])
            setShowActionModal(false)
            setSelectedBooking(null)
            setActionType("")
            setActionReason("")
        },
    })

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters((prev) => ({
            ...prev,
            [name]: value,
            page: 1, // Reset to first page when filters change
        }))
    }

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const searchValue = formData.get("search")

        setFilters((prev) => ({
            ...prev,
            search: searchValue,
            page: 1,
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

    // Open action modal
    const openActionModal = (booking, action) => {
        setSelectedBooking(booking)
        setActionType(action)
        setShowActionModal(true)
    }

    // Handle booking action
    const handleBookingAction = () => {
        if (!selectedBooking || !actionType) return

        updateBookingStatusMutation.mutate({
            id: selectedBooking._id,
            status: actionType,
            reason: actionReason,
        })
    }

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        <FaCheckCircle className="mr-1" />
                        Completed
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        {status}
                    </span>
                )
        }
    }

    // Calculate nights
    const calculateNights = (startDate, endDate) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        return Math.round((end - start) / (1000 * 60 * 60 * 24))
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-medium text-secondary-900 mb-6">
                    Booking Requests
                </h1>
                <div className="animate-pulse">
                    <div className="h-12 bg-secondary-200 rounded-lg mb-6"></div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="h-8 bg-secondary-200 rounded w-1/4 mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className="h-20 bg-secondary-200 rounded"
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (isError) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-medium text-secondary-900 mb-6">
                    Booking Requests
                </h1>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                    <FaExclamationTriangle className="text-red-500 mt-0.5 mr-2" />
                    <p>
                        Error loading bookings:{" "}
                        {error?.message || "Please try again later."}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-medium text-secondary-900 mb-8">
                Booking Requests
            </h1>

            {/* Search and filters */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-secondary-100 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <form
                        onSubmit={handleSearch}
                        className="flex-1 flex items-center"
                    >
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-secondary-400" />
                            </div>
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by guest name..."
                                defaultValue={filters.search}
                                className="w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg bg-secondary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="ml-2 px-4 py-2 bg-secondary-900 text-white rounded-lg hover:bg-secondary-800 transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="md:w-auto w-full px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 flex items-center justify-center"
                    >
                        <FaFilter className="mr-2" />
                        <span>Filters</span>
                    </button>
                </div>

                {/* Advanced Filters */}
                {isFilterOpen && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary-100">
                        <div>
                            <label
                                htmlFor="status"
                                className="block text-sm font-medium text-secondary-700 mb-1"
                            >
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-secondary-300 rounded-lg bg-secondary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="propertyId"
                                className="block text-sm font-medium text-secondary-700 mb-1"
                            >
                                Property
                            </label>
                            <select
                                id="propertyId"
                                name="propertyId"
                                value={filters.propertyId}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-secondary-300 rounded-lg bg-secondary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500"
                            >
                                <option value="">All Properties</option>
                                {data?.properties?.map((property) => (
                                    <option
                                        key={property._id}
                                        value={property._id}
                                    >
                                        {property.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* No bookings message */}
            {data?.bookings?.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-secondary-100">
                    <div className="flex justify-center mb-4">
                        <FaCalendarAlt className="text-secondary-300 text-4xl" />
                    </div>
                    <h2 className="text-xl font-medium mb-2 text-secondary-900">
                        No bookings yet
                    </h2>
                    <p className="text-secondary-500">
                        When guests book your properties, they'll appear here.
                    </p>
                </div>
            )}

            {/* Bookings list */}
            {data?.bookings?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-secondary-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-secondary-200">
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                                    >
                                        Guest
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                                    >
                                        Property
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                                    >
                                        Dates
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                                    >
                                        Amount
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {data.bookings.map((booking) => (
                                    <tr
                                        key={booking._id}
                                        className="hover:bg-secondary-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={
                                                            booking.guest
                                                                .profilePicture ||
                                                            "https://via.placeholder.com/40x40?text=Guest"
                                                        }
                                                        alt={booking.guest.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-secondary-900">
                                                        {booking.guest.name}
                                                    </div>
                                                    <div className="text-sm text-secondary-500">
                                                        {booking.guests} guest
                                                        {booking.guests !== 1
                                                            ? "s"
                                                            : ""}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-secondary-900">
                                                {booking.property.title}
                                            </div>
                                            <div className="text-sm text-secondary-500">
                                                {booking.property.address.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-secondary-900 flex items-center">
                                                <FaRegClock className="text-secondary-400 mr-1.5 text-xs" />
                                                {formatDate(
                                                    booking.checkInDate
                                                )}
                                            </div>
                                            <div className="text-sm text-secondary-500 ml-4">
                                                to{" "}
                                                {formatDate(
                                                    booking.checkOutDate
                                                )}
                                            </div>
                                            <div className="text-xs text-secondary-500 ml-4">
                                                {calculateNights(
                                                    booking.checkInDate,
                                                    booking.checkOutDate
                                                )}{" "}
                                                nights
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                                            {formatPrice(booking.totalPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex flex-col space-y-2">
                                                {booking.status ===
                                                    "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                openActionModal(
                                                                    booking,
                                                                    "confirmed"
                                                                )
                                                            }
                                                            className="text-green-600 hover:text-green-800 font-medium"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openActionModal(
                                                                    booking,
                                                                    "cancelled"
                                                                )
                                                            }
                                                            className="text-secondary-600 hover:text-red-600 font-medium"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status ===
                                                    "confirmed" && (
                                                    <button
                                                        onClick={() =>
                                                            openActionModal(
                                                                booking,
                                                                "cancelled"
                                                            )
                                                        }
                                                        className="text-secondary-600 hover:text-red-600 font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/messages?userId=${booking.guest._id}`}
                                                    className="text-secondary-600 hover:text-secondary-900 font-medium flex items-center"
                                                >
                                                    <FaCommentAlt className="mr-1.5 text-xs" />
                                                    Message
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {data?.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <nav className="flex items-center">
                        <button
                            onClick={() => handlePageChange(filters.page - 1)}
                            disabled={filters.page === 1}
                            className="px-4 py-2 rounded-lg mr-2 bg-white border border-secondary-200 text-secondary-700 disabled:opacity-50 disabled:text-secondary-400"
                        >
                            Previous
                        </button>
                        <div className="flex space-x-1">
                            {[...Array(data.totalPages)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-3 py-2 rounded-lg ${
                                        filters.page === index + 1
                                            ? "bg-secondary-900 text-white"
                                            : "bg-white border border-secondary-200 text-secondary-700 hover:bg-secondary-50"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handlePageChange(filters.page + 1)}
                            disabled={filters.page === data.totalPages}
                            className="px-4 py-2 rounded-lg ml-2 bg-white border border-secondary-200 text-secondary-700 disabled:opacity-50 disabled:text-secondary-400"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}

            {/* Action modal */}
            {showActionModal && (
                <div className="fixed inset-0 bg-secondary-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
                        <h2 className="text-xl font-medium text-secondary-900 mb-4">
                            {actionType === "confirmed"
                                ? "Confirm Booking"
                                : "Cancel Booking"}
                        </h2>

                        {actionType === "confirmed" ? (
                            <div className="mb-6">
                                <p className="text-secondary-600">
                                    Are you sure you want to confirm this
                                    booking request?
                                </p>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <div className="flex items-start mb-4">
                                    <FaExclamationTriangle className="text-yellow-500 mr-2 mt-1" />
                                    <p className="text-secondary-600">
                                        Are you sure you want to cancel this
                                        booking? The guest will be notified.
                                    </p>
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="actionReason"
                                        className="block text-sm font-medium text-secondary-700 mb-1"
                                    >
                                        Reason for cancellation
                                    </label>
                                    <textarea
                                        id="actionReason"
                                        rows="3"
                                        value={actionReason}
                                        onChange={(e) =>
                                            setActionReason(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg bg-secondary-50 focus:outline-none focus:ring-1 focus:ring-secondary-500"
                                        placeholder="Please provide a reason for cancellation"
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBookingAction}
                                disabled={
                                    updateBookingStatusMutation.isLoading ||
                                    (actionType === "cancelled" &&
                                        !actionReason.trim())
                                }
                                className={`px-4 py-2 rounded-lg ${
                                    actionType === "confirmed"
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-red-600 hover:bg-red-700 text-white"
                                } disabled:opacity-50`}
                            >
                                {updateBookingStatusMutation.isLoading
                                    ? "Processing..."
                                    : actionType === "confirmed"
                                    ? "Confirm Booking"
                                    : "Cancel Booking"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HostBookingsPage
