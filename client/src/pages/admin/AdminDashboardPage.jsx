import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    FaHome,
    FaCalendarCheck,
    FaUsers,
    FaDollarSign,
    FaChartLine,
    FaClipboardList,
    FaUserFriends,
    FaComments,
    FaEye,
    FaPlus,
    FaClock,
    FaCheckCircle,
} from "react-icons/fa"
import { adminService } from "../../services/api"
import { formatPrice } from "../../utils/currency"
import { Link } from "react-router-dom"

/**
 * Admin Dashboard Page
 * Shows overview statistics and recent activity
 */
const AdminDashboardPage = () => {
    const {
        data: stats,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["adminDashboard"],
        queryFn: adminService.getDashboardStats,
    })

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white p-6 rounded-lg shadow-sm"
                            >
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Error loading dashboard: {error.message}
                </div>
            </div>
        )
    }

    const statCards = [
        {
            title: "Total Properties",
            value: stats.properties.total,
            icon: FaHome,
            color: "bg-blue-500",
            subtext: `${stats.properties.pending} pending approval`,
            link: "/admin/properties",
        },
        {
            title: "Total Bookings",
            value: stats.bookings.total,
            icon: FaCalendarCheck,
            color: "bg-green-500",
            subtext: `${stats.bookings.pending} pending`,
            link: "/admin/bookings",
        },
        {
            title: "Total Users",
            value: stats.users.total,
            icon: FaUsers,
            color: "bg-purple-500",
            subtext: `${stats.users.hosts} hosts`,
            link: "/admin/users",
        },
        {
            title: "Total Revenue",
            value: formatPrice(stats.revenue.total),
            icon: FaDollarSign,
            color: "bg-yellow-500",
            subtext: "From confirmed bookings",
            link: "/admin/bookings",
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Overview of your platform's performance and activity
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, index) => (
                        <Link
                            key={index}
                            to={card.link}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        {card.title}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {card.value}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {card.subtext}
                                    </p>
                                </div>
                                <div className={`${card.color} p-3 rounded-lg`}>
                                    <card.icon
                                        className="text-white"
                                        size={24}
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Properties */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Recent Properties
                                </h2>
                                <Link
                                    to="/admin/properties"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    View all
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {stats.recent.properties.length > 0 ? (
                                <div className="space-y-4">
                                    {stats.recent.properties.map((property) => (
                                        <div
                                            key={property._id}
                                            className="flex items-start space-x-3"
                                        >
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <FaHome className="text-gray-500" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {property.title}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    by {property.host.name}
                                                </p>
                                                <div className="flex items-center mt-1">
                                                    {property.isApproved ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <FaCheckCircle
                                                                className="mr-1"
                                                                size={10}
                                                            />
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <FaClock
                                                                className="mr-1"
                                                                size={10}
                                                            />
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    No recent properties
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Recent Bookings
                                </h2>
                                <Link
                                    to="/admin/bookings"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    View all
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {stats.recent.bookings.length > 0 ? (
                                <div className="space-y-4">
                                    {stats.recent.bookings.map((booking) => (
                                        <div
                                            key={booking._id}
                                            className="flex items-start space-x-3"
                                        >
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <FaCalendarCheck className="text-gray-500" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {booking.property.title}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    by {booking.guest.name}
                                                </p>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            booking.status ===
                                                            "confirmed"
                                                                ? "bg-green-100 text-green-800"
                                                                : booking.status ===
                                                                  "pending"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatPrice(
                                                            booking.totalPrice
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    No recent bookings
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            to="/admin/properties?status=pending"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaClock className="text-yellow-500 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">
                                    Review Pending Properties
                                </p>
                                <p className="text-sm text-gray-500">
                                    {stats.properties.pending} properties
                                    awaiting approval
                                </p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/bookings?status=pending"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaCalendarCheck className="text-blue-500 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">
                                    Review Pending Bookings
                                </p>
                                <p className="text-sm text-gray-500">
                                    {stats.bookings.pending} bookings need
                                    attention
                                </p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/users"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaUsers className="text-purple-500 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">
                                    Manage Users
                                </p>
                                <p className="text-sm text-gray-500">
                                    {stats.users.total} users registered
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardPage
