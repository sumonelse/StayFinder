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
} from "react-icons/fa"
import { propertyService, bookingService } from "../../services/api"
import { formatPrice } from "../../utils/currency"
import { useAuth } from "../../context/AuthContext"

/**
 * Host dashboard page component
 * Displays an overview of the host's properties, bookings, and stats
 */
const HostDashboardPage = () => {
    const { user } = useAuth()
    const [dateRange, setDateRange] = useState("month") // week, month, year

    // Fetch host properties
    const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
        queryKey: ["hostProperties", user?._id],
        queryFn: () =>
            propertyService.getPropertiesByHost(user?._id, { limit: 3 }),
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
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Host Dashboard</h1>
                <div className="animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md h-32"
                            ></div>
                        ))}
                    </div>
                    <div className="bg-white rounded-lg shadow-md h-64 mb-8"></div>
                    <div className="bg-white rounded-lg shadow-md h-64"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Host Dashboard</h1>

                <div className="mt-4 md:mt-0">
                    <Link
                        to="/host/properties/add"
                        className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                    >
                        <FaPlus className="mr-2" />
                        <span>Add New Property</span>
                    </Link>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                            <FaHome className="text-xl" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Properties</p>
                            <p className="text-2xl font-bold">
                                {stats.totalProperties}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <FaCalendarAlt className="text-xl" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">
                                Active Bookings
                            </p>
                            <p className="text-2xl font-bold">
                                {stats.activeBookings}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                            <FaChartLine className="text-xl" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">
                                Occupancy Rate
                            </p>
                            <p className="text-2xl font-bold">
                                {stats.occupancyRate.toFixed(0)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                            <FaMoneyBillWave className="text-xl" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">
                                Total Earnings
                            </p>
                            <p className="text-2xl font-bold">
                                {formatPrice(stats.totalEarnings)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent bookings */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Recent Bookings</h2>
                    <Link
                        to="/host/bookings"
                        className="text-primary-600 hover:text-primary-800"
                    >
                        View all
                    </Link>
                </div>

                {bookingsData?.bookings?.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="flex justify-center mb-4">
                            <FaCalendarAlt className="text-gray-400 text-4xl" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                            No bookings yet
                        </h3>
                        <p className="text-gray-600">
                            When guests book your properties, they'll appear
                            here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Guest
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Property
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Dates
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookingsData?.bookings?.map((booking) => (
                                    <tr key={booking._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={
                                                            booking.user
                                                                .avatar ||
                                                            "https://via.placeholder.com/40x40?text=Guest"
                                                        }
                                                        alt={booking.user.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {booking.user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.guests} guest
                                                        {booking.guests !== 1
                                                            ? "s"
                                                            : ""}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {booking.property.title}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {booking.property.address.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatDate(booking.startDate)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                to {formatDate(booking.endDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Your Properties</h2>
                    <Link
                        to="/host/properties"
                        className="text-primary-600 hover:text-primary-800"
                    >
                        View all
                    </Link>
                </div>

                {propertiesData?.properties?.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="flex justify-center mb-4">
                            <FaHome className="text-gray-400 text-4xl" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                            No properties yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Start by adding your first property.
                        </p>
                        <Link
                            to="/host/properties/add"
                            className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
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
                                className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                                <div className="h-40 overflow-hidden">
                                    <img
                                        src={
                                            property.images[0] ||
                                            "https://via.placeholder.com/300x200?text=No+Image"
                                        }
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-lg mb-1">
                                        {property.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {property.address.city},{" "}
                                        {property.address.country}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <FaStar className="text-yellow-500 mr-1" />
                                            <span className="text-sm">
                                                {property.avgRating
                                                    ? property.avgRating.toFixed(
                                                          1
                                                      )
                                                    : "New"}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <FaUsers className="text-gray-500 mr-1" />
                                            <span className="text-sm">
                                                {property.maxGuests} guests
                                            </span>
                                        </div>
                                        <span className="font-bold">
                                            {formatPrice(property.price)}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex space-x-2">
                                        <Link
                                            to={`/properties/${property._id}`}
                                            className="text-primary-600 hover:text-primary-800 text-sm"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            to={`/host/properties/${property._id}/edit`}
                                            className="text-primary-600 hover:text-primary-800 text-sm"
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
