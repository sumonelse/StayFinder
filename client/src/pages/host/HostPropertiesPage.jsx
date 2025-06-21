import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaEye,
    FaToggleOn,
    FaToggleOff,
    FaStar,
    FaFilter,
} from "react-icons/fa"
import { propertyService } from "../../services/api"
import { formatPrice } from "../../utils/currency"
import { useAuth } from "../../context/AuthContext"

/**
 * Host properties page component
 * Displays a list of properties owned by the host
 */
const HostPropertiesPage = () => {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        type: "",
        page: 1,
        limit: 10,
    })
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [propertyToDelete, setPropertyToDelete] = useState(null)

    // Fetch host properties
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["hostProperties", user?._id, filters],
        queryFn: () => {
            if (!user?._id) {
                throw new Error("User ID is required to fetch properties")
            }
            return propertyService.getPropertiesByHost(user._id, filters)
        },
        enabled: !!user?._id, // Only run the query when user ID is available
    })

    // Toggle property availability mutation
    const toggleAvailabilityMutation = useMutation({
        mutationFn: (propertyId) =>
            propertyService.toggleAvailability(propertyId),
        onSuccess: () => {
            queryClient.invalidateQueries(["hostProperties"])
        },
    })

    // Delete property mutation
    const deletePropertyMutation = useMutation({
        mutationFn: (propertyId) => propertyService.deleteProperty(propertyId),
        onSuccess: () => {
            queryClient.invalidateQueries(["hostProperties"])
            setShowDeleteModal(false)
            setPropertyToDelete(null)
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

    // Handle toggle availability
    const handleToggleAvailability = (propertyId) => {
        toggleAvailabilityMutation.mutate(propertyId)
    }

    // Handle delete property
    const handleDeleteProperty = () => {
        if (propertyToDelete) {
            deletePropertyMutation.mutate(propertyToDelete)
        }
    }

    // Loading state or waiting for user data
    if (isLoading || !user || !user._id) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Your Properties</h1>
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-200 rounded mb-6"></div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className="h-20 bg-gray-200 rounded"
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
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Your Properties</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>
                        Error loading properties:{" "}
                        {error?.message || "Please try again later."}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Your Properties</h1>

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

            {/* Search and filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <form
                        onSubmit={handleSearch}
                        className="flex-1 flex items-center"
                    >
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="search"
                                placeholder="Search properties..."
                                defaultValue={filters.search}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="ml-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                            Search
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="md:w-auto w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center"
                    >
                        <FaFilter className="mr-2" />
                        <span>Filters</span>
                    </button>
                </div>

                {/* Advanced Filters */}
                {isFilterOpen && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                                <option value="pending">
                                    Pending Approval
                                </option>
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="type"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Property Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={filters.type}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Types</option>
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="villa">Villa</option>
                                <option value="cabin">Cabin</option>
                                <option value="condo">Condo</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* No properties message */}
            {data?.properties?.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-xl font-semibold mb-2">
                        You don't have any properties yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Start by adding your first property to rent out.
                    </p>
                    <Link
                        to="/host/properties/add"
                        className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
                    >
                        <FaPlus className="mr-2" />
                        <span>Add Property</span>
                    </Link>
                </div>
            )}

            {/* Properties list */}
            {data?.properties?.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
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
                                        Location
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Price
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Rating
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
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.properties.map((property) => (
                                    <tr key={property._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-md object-cover"
                                                        src={
                                                            property
                                                                .images[0] ||
                                                            "https://via.placeholder.com/40x40?text=Property"
                                                        }
                                                        alt={property.title}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {property.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {property.type
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            property.type.slice(
                                                                1
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {property.address?.city ||
                                                    "N/A"}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {property.address?.country ||
                                                    "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatPrice(property.price)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                per{" "}
                                                {property.pricePeriod ===
                                                "nightly"
                                                    ? "night"
                                                    : "month"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaStar className="text-yellow-500 mr-1" />
                                                <span>
                                                    {property.avgRating
                                                        ? property.avgRating.toFixed(
                                                              1
                                                          )
                                                        : "New"}
                                                </span>
                                                {property.reviewCount > 0 && (
                                                    <span className="text-gray-500 text-sm ml-1">
                                                        ({property.reviewCount})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    property.isAvailable
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {property.isAvailable
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/properties/${property._id}`}
                                                    className="text-primary-600 hover:text-primary-900"
                                                    title="View property"
                                                >
                                                    <FaEye />
                                                </Link>
                                                <Link
                                                    to={`/host/properties/${property._id}/edit`}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Edit property"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleToggleAvailability(
                                                            property._id
                                                        )
                                                    }
                                                    className={`${
                                                        property.isAvailable
                                                            ? "text-green-600 hover:text-green-900"
                                                            : "text-gray-600 hover:text-gray-900"
                                                    }`}
                                                    title={
                                                        property.isAvailable
                                                            ? "Mark as unavailable"
                                                            : "Mark as available"
                                                    }
                                                >
                                                    {property.isAvailable ? (
                                                        <FaToggleOn />
                                                    ) : (
                                                        <FaToggleOff />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPropertyToDelete(
                                                            property._id
                                                        )
                                                        setShowDeleteModal(true)
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete property"
                                                >
                                                    <FaTrash />
                                                </button>
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

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Delete Property
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete this property? This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProperty}
                                disabled={deletePropertyMutation.isLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
                            >
                                {deletePropertyMutation.isLoading
                                    ? "Deleting..."
                                    : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HostPropertiesPage
