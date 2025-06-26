import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
    FaHome,
    FaCalendarAlt,
    FaStar,
    FaChartLine,
    FaPlus,
    FaUsers,
    FaMoneyBillWave,
    FaEllipsisH,
    FaArrowRight,
    FaRegClock,
} from "react-icons/fa"
import { propertyService, bookingService } from "../../services/api"
import { formatPrice } from "../../utils/currency"
import { useAuth } from "../../context/AuthContext"

/**
 * Host dashboard page component
 * Displays an overview of the host's properties, bookings, and stats
 * Redesigned with Airbnb-style grey/black color scheme
 */
const HostDashboardPage = () => {
    const { user } = useAuth()
    const [dateRange, setDateRange] = useState("month") // week, month, year

    // Fetch host properties
    const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
        queryKey: ["hostProperties", user?._id],
        queryFn: () => {
            if (!user?._id) {
                throw new Error("User ID is required to fetch properties")
            }
            return propertyService.getPropertiesByHost(user._id, { limit: 3 })
        },
        enabled: !!user?._id, // Only run query if user ID is available
    })

    // Fetch host bookings
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ["hostBookings", user?._id, { limit: 5 }],
        queryFn: () => bookingService.getHostBookings({ limit: 5 }),
    })

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Calculate dashboard stats
    const calculateStats = () => {
        if (!bookingsData || !propertiesData) {
            return {
                totalProperties: 0,
                activeBookings: 0,
                occupancyRate: 0,
                totalEarnings: 0,
            }
        }

        const totalProperties = propertiesData.totalProperties || 0
        const activeBookings = bookingsData.bookings.filter(
            (booking) => booking.status === "confirmed"
        ).length

        // This would be more complex in a real app
        const occupancyRate =
            totalProperties > 0 ? (activeBookings / totalProperties) * 100 : 0

        // Calculate total earnings (simplified)
        const totalEarnings = bookingsData.bookings
            .filter(
                (booking) =>
                    booking.status === "confirmed" ||
                    booking.status === "completed"
            )
            .reduce((sum, booking) => sum + booking.totalPrice, 0)

        return {
            totalProperties,
            activeBookings,
            occupancyRate,
            totalEarnings,
        }
    }

    const stats = calculateStats()

    // Loading state
    if (propertiesLoading && bookingsLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-medium text-secondary-900 mb-6">
                    Host Dashboard
                </h1>
                <div className="animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-sm h-32"
                            ></div>
                        ))}
                    </div>
                    <div className="bg-white rounded-lg shadow-sm h-64 mb-8"></div>
                    <div className="bg-white rounded-lg shadow-sm h-64"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <h1 className="text-2xl font-medium text-secondary-900">
                    Welcome back, {user?.name?.split(" ")[0]}
                </h1>

                <div className="mt-4 md:mt-0">
                    <Link
                        to="/host/properties/add"
                        className="inline-flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                    >
                        <FaPlus className="mr-2" />
                        <span>Add New Property</span>
                    </Link>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-secondary-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-secondary-100 text-secondary-700 mr-4">
                            <FaHome className="text-xl" />
                        </div>
                        <div>
                            <p className="text-secondary-500 text-sm font-medium">
                                Properties
                            </p>
                            <p className="text-2xl font-medium text-secondary-900 mt-1">
                                {stats.totalProperties}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-secondary-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-secondary-100 text-secondary-700 mr-4">
                            <FaCalendarAlt className="text-xl" />
                        </div>
                        <div>
                            <p className="text-secondary-500 text-sm font-medium">
                                Active Bookings
                            </p>
                            <p className="text-2xl font-medium text-secondary-900 mt-1">
                                {stats.activeBookings}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-secondary-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-secondary-100 text-secondary-700 mr-4">
                            <FaChartLine className="text-xl" />
                        </div>
                        <div>
                            <p className="text-secondary-500 text-sm font-medium">
                                Occupancy Rate
                            </p>
                            <p className="text-2xl font-medium text-secondary-900 mt-1">
                                {stats.occupancyRate.toFixed(0)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-secondary-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-secondary-100 text-secondary-700 mr-4">
                            <FaMoneyBillWave className="text-xl" />
                        </div>
                        <div>
                            <p className="text-secondary-500 text-sm font-medium">
                                Total Earnings
                            </p>
                            <p className="text-2xl font-medium text-secondary-900 mt-1">
                                {formatPrice(stats.totalEarnings)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent bookings */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-secondary-100 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium text-secondary-900">
                        Recent Bookings
                    </h2>
                    <Link
                        to="/host/bookings"
                        className="text-primary-500 hover:text-primary-600 flex items-center text-sm font-medium"
                    >
                        View all
                        <FaArrowRight className="ml-1 text-xs" />
                    </Link>
                </div>

                {bookingsData?.bookings?.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="flex justify-center mb-4">
                            <FaCalendarAlt className="text-secondary-300 text-4xl" />
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-secondary-900">
                            No bookings yet
                        </h3>
                        <p className="text-secondary-500">
                            When guests book your properties, they'll appear
                            here.
                        </p>
                    </div>
                ) : (
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {bookingsData?.bookings?.map((booking) => (
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
                                                                ?.profilePicture ||
                                                            "https://via.placeholder.com/40x40?text=Guest"
                                                        }
                                                        alt={
                                                            booking.guest
                                                                ?.name ||
                                                            "Guest"
                                                        }
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-secondary-900">
                                                        {booking.guest?.name ||
                                                            "Guest"}
                                                    </div>
                                                    <div className="text-sm text-secondary-500">
                                                        {booking.numberOfGuests}{" "}
                                                        guest
                                                        {booking.numberOfGuests !==
                                                        1
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
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${
                                                    booking.status ===
                                                    "confirmed"
                                                        ? "bg-green-100 text-green-800"
                                                        : booking.status ===
                                                          "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : booking.status ===
                                                          "cancelled"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-secondary-100 text-secondary-800"
                                                }`}
                                            >
                                                {booking.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    booking.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                                            {formatPrice(booking.totalPrice)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Properties overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-secondary-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium text-secondary-900">
                        Your Properties
                    </h2>
                    <Link
                        to="/host/properties"
                        className="text-primary-500 hover:text-primary-600 flex items-center text-sm font-medium"
                    >
                        View all
                        <FaArrowRight className="ml-1 text-xs" />
                    </Link>
                </div>

                {propertiesData?.properties?.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="flex justify-center mb-4">
                            <FaHome className="text-secondary-300 text-4xl" />
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-secondary-900">
                            No properties yet
                        </h3>
                        <p className="text-secondary-500 mb-6">
                            Start by adding your first property.
                        </p>
                        <Link
                            to="/host/properties/add"
                            className="inline-flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                        >
                            <FaPlus className="mr-2" />
                            <span>Add Property</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {propertiesData?.properties?.map((property) => (
                            <div
                                key={property._id}
                                className="rounded-lg overflow-hidden shadow-sm border border-secondary-100 hover:shadow-md transition-shadow"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={
                                            property.images[0] ||
                                            "https://via.placeholder.com/300x200?text=No+Image"
                                        }
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <button className="p-2 bg-white rounded-full shadow-md text-secondary-700 hover:text-secondary-900">
                                            <FaEllipsisH className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-lg text-secondary-900">
                                        {property.title}
                                    </h3>
                                    <p className="text-secondary-500 text-sm mt-1 mb-3">
                                        {property.address.city},{" "}
                                        {property.address.country}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <FaStar className="text-yellow-500 mr-1" />
                                            <span className="text-sm text-secondary-700">
                                                {property.avgRating
                                                    ? property.avgRating.toFixed(
                                                          1
                                                      )
                                                    : "New"}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <FaUsers className="text-secondary-500 mr-1" />
                                            <span className="text-sm text-secondary-700">
                                                {property.maxGuests} guests
                                            </span>
                                        </div>
                                        <span className="font-medium text-secondary-900">
                                            {formatPrice(property.price)}
                                        </span>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-secondary-100 flex justify-between">
                                        <Link
                                            to={`/properties/${property._id}`}
                                            className="text-secondary-700 hover:text-secondary-900 text-sm font-medium"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            to={`/host/properties/${property._id}/edit`}
                                            className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default HostDashboardPage
