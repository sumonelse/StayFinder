import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    FaHome,
    FaUser,
    FaMapMarkerAlt,
    FaCheck,
    FaTimes,
    FaEye,
    FaTrash,
    FaFilter,
    FaSearch,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
} from "react-icons/fa"
import { adminService } from "../../services/api"
import { formatPrice } from "../../utils/currency"
import { Link } from "react-router-dom"

/**
 * Admin Properties Management Page
 */
const AdminPropertiesPage = () => {
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        search: "",
        status: "",
        sortBy: "createdAt",
        sortOrder: "desc",
    })
    const [selectedProperty, setSelectedProperty] = useState(null)
    const [showApprovalModal, setShowApprovalModal] = useState(false)
    const [approvalData, setApprovalData] = useState({
        isApproved: true,
        rejectionReason: "",
    })

    const queryClient = useQueryClient()

    const {
        data: propertiesData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["adminProperties", filters],
        queryFn: () => adminService.getProperties(filters),
    })

    const approvalMutation = useMutation({
        mutationFn: ({ id, data }) =>
            adminService.updatePropertyApproval(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminProperties"])
            queryClient.invalidateQueries(["adminDashboard"])
            setShowApprovalModal(false)
            setSelectedProperty(null)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteProperty,
        onSuccess: () => {
            queryClient.invalidateQueries(["adminProperties"])
            queryClient.invalidateQueries(["adminDashboard"])
        },
    })

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: key !== "page" ? 1 : value, // Reset to page 1 when other filters change
        }))
    }

    const handleApproval = (property, isApproved) => {
        setSelectedProperty(property)
        setApprovalData({ isApproved, rejectionReason: "" })
        setShowApprovalModal(true)
    }

    const handleApprovalSubmit = () => {
        if (selectedProperty) {
            approvalMutation.mutate({
                id: selectedProperty._id,
                data: approvalData,
            })
        }
    }

    const handleDelete = (propertyId) => {
        if (
            window.confirm(
                "Are you sure you want to delete this property? This action cannot be undone."
            )
        ) {
            deleteMutation.mutate(propertyId)
        }
    }

    const getStatusBadge = (property) => {
        if (property.isApproved) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaCheckCircle className="mr-1" size={10} />
                    Approved
                </span>
            )
        } else {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <FaClock className="mr-1" size={10} />
                    Pending
                </span>
            )
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-secondary-200 rounded w-1/4 mb-8"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white p-6 rounded-lg shadow-sm"
                            >
                                <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
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
                    Error loading properties: {error.message}
                </div>
            </div>
        )
    }

    const { properties, pagination } = propertiesData

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                        Properties Management
                    </h1>
                    <p className="text-secondary-600">
                        Review and manage all properties on the platform
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                                <input
                                    type="text"
                                    placeholder="Search properties..."
                                    className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                                    value={filters.search}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "search",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Status
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={filters.status}
                                onChange={(e) =>
                                    handleFilterChange("status", e.target.value)
                                }
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Sort By
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={filters.sortBy}
                                onChange={(e) =>
                                    handleFilterChange("sortBy", e.target.value)
                                }
                            >
                                <option value="createdAt">Date Created</option>
                                <option value="title">Title</option>
                                <option value="price">Price</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Order
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={filters.sortOrder}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "sortOrder",
                                        e.target.value
                                    )
                                }
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Properties List */}
                <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
                    <div className="p-6 border-b border-secondary-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-secondary-900">
                                Properties ({pagination.total})
                            </h2>
                        </div>
                    </div>

                    {properties.length > 0 ? (
                        <div className="divide-y divide-secondary-200">
                            {properties.map((property) => (
                                <div key={property._id} className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            {property.images?.length > 0 ? (
                                                <img
                                                    src={property.images[0].url}
                                                    alt={property.title}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-secondary-200 rounded-lg flex items-center justify-center">
                                                    <FaHome className="text-secondary-500" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-medium text-secondary-900 mb-1">
                                                        {property.title}
                                                    </h3>
                                                    <div className="flex items-center text-sm text-secondary-500 mb-2">
                                                        <FaMapMarkerAlt className="mr-1" />
                                                        {property.address.city},{" "}
                                                        {property.address.state}
                                                    </div>
                                                    <div className="flex items-center text-sm text-secondary-500 mb-2">
                                                        <FaUser className="mr-1" />
                                                        Host:{" "}
                                                        {property.host.name} (
                                                        {property.host.email})
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm">
                                                        <span className="font-medium text-secondary-900">
                                                            {formatPrice(
                                                                property.price
                                                            )}
                                                            /night
                                                        </span>
                                                        <span className="text-secondary-500">
                                                            {property.bedrooms}{" "}
                                                            bed,{" "}
                                                            {property.bathrooms}{" "}
                                                            bath
                                                        </span>
                                                        <span className="text-secondary-500">
                                                            Max{" "}
                                                            {property.maxGuests}{" "}
                                                            guests
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {getStatusBadge(property)}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="text-xs text-secondary-500">
                                                    Created:{" "}
                                                    {new Date(
                                                        property.createdAt
                                                    ).toLocaleDateString()}
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        to={`/properties/${property._id}`}
                                                        className="inline-flex items-center px-3 py-1 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50"
                                                    >
                                                        <FaEye
                                                            className="mr-1"
                                                            size={12}
                                                        />
                                                        View
                                                    </Link>

                                                    {!property.isApproved && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleApproval(
                                                                        property,
                                                                        true
                                                                    )
                                                                }
                                                                className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                                                            >
                                                                <FaCheck
                                                                    className="mr-1"
                                                                    size={12}
                                                                />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleApproval(
                                                                        property,
                                                                        false
                                                                    )
                                                                }
                                                                className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                                                            >
                                                                <FaTimes
                                                                    className="mr-1"
                                                                    size={12}
                                                                />
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                property._id
                                                            )
                                                        }
                                                        className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                                                        disabled={
                                                            deleteMutation.isLoading
                                                        }
                                                    >
                                                        <FaTrash
                                                            className="mr-1"
                                                            size={12}
                                                        />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <FaHome className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                            <h3 className="text-lg font-medium text-secondary-900 mb-2">
                                No properties found
                            </h3>
                            <p className="text-secondary-500">
                                No properties match your current filters.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="p-6 border-t border-secondary-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-secondary-700">
                                    Showing{" "}
                                    {(pagination.page - 1) * pagination.limit +
                                        1}{" "}
                                    to{" "}
                                    {Math.min(
                                        pagination.page * pagination.limit,
                                        pagination.total
                                    )}{" "}
                                    of {pagination.total} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() =>
                                            handleFilterChange(
                                                "page",
                                                pagination.page - 1
                                            )
                                        }
                                        disabled={pagination.page === 1}
                                        className="px-3 py-1 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-secondary-700">
                                        Page {pagination.page} of{" "}
                                        {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleFilterChange(
                                                "page",
                                                pagination.page + 1
                                            )
                                        }
                                        disabled={
                                            pagination.page === pagination.pages
                                        }
                                        className="px-3 py-1 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium text-secondary-900 mb-4">
                            {approvalData.isApproved ? "Approve" : "Reject"}{" "}
                            Property
                        </h3>

                        <div className="mb-4">
                            <p className="text-sm text-secondary-600 mb-2">
                                Property:{" "}
                                <strong>{selectedProperty?.title}</strong>
                            </p>
                            <p className="text-sm text-secondary-600">
                                Host:{" "}
                                <strong>{selectedProperty?.host.name}</strong>
                            </p>
                        </div>

                        {!approvalData.isApproved && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Rejection Reason
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={approvalData.rejectionReason}
                                    onChange={(e) =>
                                        setApprovalData((prev) => ({
                                            ...prev,
                                            rejectionReason: e.target.value,
                                        }))
                                    }
                                    placeholder="Please provide a reason for rejection..."
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowApprovalModal(false)}
                                className="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleApprovalSubmit}
                                disabled={approvalMutation.isLoading}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                                    approvalData.isApproved
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                } disabled:opacity-50`}
                            >
                                {approvalMutation.isLoading
                                    ? "Processing..."
                                    : approvalData.isApproved
                                    ? "Approve"
                                    : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminPropertiesPage
