import { useState } from "react"
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    FaArrowLeft,
    FaEdit,
    FaTrash,
    FaCalendarAlt,
    FaStar,
    FaMapMarkerAlt,
    FaUsers,
    FaBed,
    FaBath,
    FaCheckCircle,
    FaToggleOn,
    FaToggleOff,
} from "react-icons/fa"
import { propertyService, bookingService } from "../../services/api"
import { formatPrice } from "../../utils/currency"

/**
 * Host property detail page component
 * Displays detailed information about a property for the host
 */
const HostPropertyDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Check if coming from successful property creation/update
    const showSuccessMessage = location.state?.success

    // Fetch property details
    const {
        data: property,
        isLoading: propertyLoading,
        isError: propertyError,
    } = useQuery({
        queryKey: ["property", id],
        queryFn: () => propertyService.getPropertyById(id),
    })

    // Fetch property bookings
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ["propertyBookings", id],
        queryFn: () => bookingService.getPropertyBookings(id, { limit: 5 }),
    })

    // Toggle property availability mutation
    const toggleAvailabilityMutation = useMutation({
        mutationFn: () => propertyService.toggleAvailability(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["property", id])
        },
    })

    // Delete property mutation
    const deletePropertyMutation = useMutation({
        mutationFn: () => propertyService.deleteProperty(id),
        onSuccess: () => {
            navigate("/host/properties", {
                state: { deleted: true },
            })
        },
    })

    // Handle toggle availability
    const handleToggleAvailability = () => {
        toggleAvailabilityMutation.mutate()
    }

    // Handle delete property
    const handleDeleteProperty = () => {
        deletePropertyMutation.mutate()
    }

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Loading state
    if (propertyLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="h-96 bg-gray-200 rounded mb-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                    <div className="h-24 bg-gray-200 rounded mb-6"></div>
                </div>
            </div>
        )
    }

    // Error state
    if (propertyError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>
                        Error loading property details. Please try again later.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Success message */}
            {showSuccessMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
                    <FaCheckCircle className="mr-2" />
                    <span>
                        Property{" "}
                        {location.state.updated ? "updated" : "created"}{" "}
                        successfully!
                    </span>
                </div>
            )}

            {/* Back button and title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => navigate("/host/properties")}
                        className="flex items-center text-primary-600 hover:text-primary-800 mb-2"
                    >
                        <FaArrowLeft className="mr-2" />
                        <span>Back to properties</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {property.title}
                    </h1>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                    <Link
                        to={`/host/properties/${id}/edit`}
                        className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                    >
                        <FaEdit className="mr-2" />
                        <span>Edit Property</span>
                    </Link>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
                    >
                        <FaTrash className="mr-2" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Property details */}
                <div className="lg:col-span-2">
                    {/* Property images */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                        {property.images.length > 0 ? (
                            <div className="relative h-96">
                                <img
                                    src={
                                        typeof property.images[0] === "object"
                                            ? property.images[0].url
                                            : property.images[0]
                                    }
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-96 bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500">
                                    No images available
                                </span>
                            </div>
                        )}

                        {property.images.length > 1 && (
                            <div className="p-4 grid grid-cols-5 gap-2">
                                {property.images
                                    .slice(1, 6)
                                    .map((image, index) => (
                                        <div
                                            key={index}
                                            className="h-20 overflow-hidden rounded"
                                        >
                                            <img
                                                src={
                                                    typeof image === "object"
                                                        ? image.url
                                                        : image
                                                }
                                                alt={`Property ${index + 2}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Property information */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div className="flex items-center mb-2 md:mb-0">
                                <FaMapMarkerAlt className="text-gray-500 mr-2" />
                                <span className="text-gray-700">
                                    {property.address.street},{" "}
                                    {property.address.city},{" "}
                                    {property.address.country}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        property.isAvailable
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {property.isAvailable
                                        ? "Available"
                                        : "Unavailable"}
                                </span>
                                <button
                                    onClick={handleToggleAvailability}
                                    className="ml-2 text-primary-600 hover:text-primary-800"
                                    title={
                                        property.isAvailable
                                            ? "Mark as unavailable"
                                            : "Mark as available"
                                    }
                                >
                                    {property.isAvailable ? (
                                        <FaToggleOn className="text-xl" />
                                    ) : (
                                        <FaToggleOff className="text-xl" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                <FaBed className="text-gray-500 mb-1" />
                                <span className="text-sm text-gray-500">
                                    Bedrooms
                                </span>
                                <span className="font-medium">
                                    {property.bedrooms}
                                </span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                <FaBath className="text-gray-500 mb-1" />
                                <span className="text-sm text-gray-500">
                                    Bathrooms
                                </span>
                                <span className="font-medium">
                                    {property.bathrooms}
                                </span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                <FaUsers className="text-gray-500 mb-1" />
                                <span className="text-sm text-gray-500">
                                    Max Guests
                                </span>
                                <span className="font-medium">
                                    {property.maxGuests}
                                </span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                                <FaStar className="text-yellow-500 mb-1" />
                                <span className="text-sm text-gray-500">
                                    Rating
                                </span>
                                <span className="font-medium">
                                    {property.avgRating
                                        ? `${property.avgRating.toFixed(1)} (${
                                              property.reviewCount
                                          })`
                                        : "New"}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">
                                Description
                            </h2>
                            <p className="text-gray-700 whitespace-pre-line">
                                {property.description}
                            </p>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">
                                Amenities
                            </h2>
                            {property.amenities.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {property.amenities.map((amenity) => (
                                        <div
                                            key={amenity}
                                            className="flex items-center"
                                        >
                                            <FaCheckCircle className="text-green-500 mr-2" />
                                            <span className="text-gray-700 capitalize">
                                                {amenity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    No amenities listed
                                </p>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">
                                Pricing
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-500">
                                        Base Price
                                    </span>
                                    <div className="font-medium">
                                        {formatPrice(property.price)}{" "}
                                        <span className="text-sm font-normal text-gray-500">
                                            /{" "}
                                            {property.pricePeriod === "nightly"
                                                ? "night"
                                                : property.pricePeriod}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-500">
                                        Cleaning Fee
                                    </span>
                                    <div className="font-medium">
                                        {formatPrice(property.cleaningFee || 0)}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-500">
                                        Service Fee
                                    </span>
                                    <div className="font-medium">
                                        {formatPrice(property.serviceFee || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent bookings */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                Recent Bookings
                            </h2>
                            <Link
                                to={`/host/bookings?propertyId=${id}`}
                                className="text-primary-600 hover:text-primary-800"
                            >
                                View all
                            </Link>
                        </div>

                        {bookingsLoading ? (
                            <div className="animate-pulse space-y-4">
                                {[...Array(3)].map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-16 bg-gray-200 rounded"
                                    ></div>
                                ))}
                            </div>
                        ) : !bookingsData ||
                          !bookingsData.bookings ||
                          bookingsData.bookings.length === 0 ? (
                            <div className="text-center py-6">
                                <FaCalendarAlt className="text-gray-400 text-3xl mx-auto mb-2" />
                                <p className="text-gray-600">
                                    No bookings yet for this property
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookingsData.bookings.map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between mb-2">
                                            <div className="font-medium">
                                                {booking.user.name}
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {formatDate(booking.startDate)} -{" "}
                                            {formatDate(booking.endDate)} •{" "}
                                            {booking.guests} guest
                                            {booking.guests !== 1 ? "s" : ""}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-sm text-gray-500">
                                                Booked on{" "}
                                                {formatDate(booking.createdAt)}
                                            </div>
                                            <div className="font-medium">
                                                {formatPrice(
                                                    booking.totalPrice
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column - Stats and actions */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        {/* Property stats */}
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4">
                                Property Stats
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Listing created
                                    </span>
                                    <span className="font-medium">
                                        {formatDate(property.createdAt)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Last updated
                                    </span>
                                    <span className="font-medium">
                                        {formatDate(property.updatedAt)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Total bookings
                                    </span>
                                    <span className="font-medium">
                                        {bookingsData?.totalBookings || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Occupancy rate
                                    </span>
                                    <span className="font-medium">
                                        {bookingsData?.occupancyRate
                                            ? `${bookingsData.occupancyRate.toFixed(
                                                  0
                                              )}%`
                                            : "0%"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Total revenue
                                    </span>
                                    <span className="font-medium">
                                        {formatPrice(
                                            bookingsData?.totalRevenue || 0
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4">
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                <Link
                                    to={`/host/properties/${id}/edit`}
                                    className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                >
                                    Edit Property
                                </Link>
                                <Link
                                    to={`/properties/${id}`}
                                    className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    View Public Listing
                                </Link>
                                <button
                                    onClick={handleToggleAvailability}
                                    className={`w-full flex justify-center items-center px-4 py-2 rounded-md transition-colors ${
                                        property.isAvailable
                                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                            : "bg-green-100 text-green-800 hover:bg-green-200"
                                    }`}
                                >
                                    {property.isAvailable ? (
                                        <>
                                            <FaToggleOff className="mr-2" />
                                            Mark as Unavailable
                                        </>
                                    ) : (
                                        <>
                                            <FaToggleOn className="mr-2" />
                                            Mark as Available
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Delete Property
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete this property? This
                            action cannot be undone and will cancel all future
                            bookings.
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
                                    : "Delete Property"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HostPropertyDetailPage
