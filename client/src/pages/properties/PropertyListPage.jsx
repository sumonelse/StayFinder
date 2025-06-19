import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
    FaSearch,
    FaMapMarkerAlt,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaBed,
    FaBath,
    FaUsers,
    FaHome,
    FaList,
    FaThLarge,
    FaDollarSign,
} from "react-icons/fa"
import { IoIosRocket } from "react-icons/io"
import { MdOutlineExplore, MdTune } from "react-icons/md"
import { propertyService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import PropertyCard from "../../components/properties/PropertyCard"
import FilterModal from "../../components/properties/FilterModal"
import { Card, Badge } from "../../components/ui"

/**
 * Redesigned modern property listing page with enhanced UI/UX
 */
const PropertyListPage = () => {
    const { addToFavorites, removeFromFavorites, user, isAuthenticated } =
        useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const [filters, setFilters] = useState({
        page: parseInt(searchParams.get("page") || "1"),
        limit: parseInt(searchParams.get("limit") || "12"),
        sort: searchParams.get("sort") || "-createdAt",
        type: searchParams.get("type") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        bedrooms: searchParams.get("bedrooms") || "",
        bathrooms: searchParams.get("bathrooms") || "",
        maxGuests: searchParams.get("maxGuests") || "",
        city: searchParams.get("city") || searchParams.get("location") || "",
        country: searchParams.get("country") || "",
        amenities: searchParams.get("amenities") || "",
        search: searchParams.get("search") || "",
    })
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState(0)
    const [viewMode, setViewMode] = useState("grid") // grid or list
    const searchInputRef = useRef(null)
    const locationInputRef = useRef(null)

    // Calculate active filters count
    useEffect(() => {
        const count = Object.entries(filters).filter(([key, value]) => {
            return value && !["page", "limit", "sort"].includes(key)
        }).length
        setActiveFilters(count)
    }, [filters])

    // Fetch properties with filters
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["properties", filters],
        queryFn: () => propertyService.getAllProperties(filters),
    })

    // Update URL when filters change - with debounce to prevent flickering
    useEffect(() => {
        // Use a timeout to debounce the URL updates
        const debounceTimeout = setTimeout(() => {
            const newSearchParams = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    newSearchParams.set(key, value)
                }
            })
            setSearchParams(newSearchParams)
        }, 100) // 100ms debounce

        // Cleanup timeout on component unmount or when filters change again
        return () => clearTimeout(debounceTimeout)
    }, [filters, setSearchParams])

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target
        // Only update if the value has actually changed
        if (filters[name] !== value) {
            setFilters((prev) => ({
                ...prev,
                [name]: value,
                page: 1, // Reset to first page when filters change
            }))
        }
    }

    // Toggle property type filter
    const togglePropertyType = (typeValue) => {
        setFilters((prev) => ({
            ...prev,
            type: prev.type === typeValue ? "" : typeValue,
            page: 1,
        }))
    }

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault()
        e.stopPropagation() // Stop event propagation to prevent bubbling

        try {
            const formData = new FormData(e.target)
            const searchValue = formData.get("search") || ""
            const cityValue = formData.get("city") || ""

            // Only update if values have changed
            if (searchValue !== filters.search || cityValue !== filters.city) {
                setFilters((prev) => ({
                    ...prev,
                    search: searchValue,
                    city: cityValue,
                    page: 1,
                }))
            }
        } catch (error) {
            console.error("Search error:", error)
        }
    }

    // Handle pagination
    const handlePageChange = (newPage) => {
        setFilters((prev) => ({ ...prev, page: newPage }))
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Handle favorite toggle
    const handleToggleFavorite = async (propertyId) => {
        try {
            const isFavorite = data?.properties.some(
                (property) => property._id === propertyId && property.isFavorite
            )

            if (isFavorite) {
                await removeFromFavorites(propertyId)
            } else {
                await addToFavorites(propertyId)
            }
        } catch (err) {
            // Silent error handling
        }
    }

    // Clear a single filter
    const clearFilter = (filterName) => {
        // Only update if the filter has a value
        if (filters[filterName]) {
            setFilters((prev) => ({
                ...prev,
                [filterName]: "",
                page: 1,
            }))
        }
    }

    // Clear all filters
    const clearAllFilters = () => {
        setFilters({
            page: 1,
            limit: filters.limit,
            sort: "-createdAt",
            type: "",
            minPrice: "",
            maxPrice: "",
            bedrooms: "",
            bathrooms: "",
            maxGuests: "",
            city: "",
            country: "",
            amenities: "",
            search: "",
        })

        // Clear input fields
        if (searchInputRef.current) searchInputRef.current.value = ""
        if (locationInputRef.current) locationInputRef.current.value = ""
    }

    // Format price for display
    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Hero Section with Search */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg mb-8 overflow-hidden">
                    <div className="px-6 py-8 md:px-10 md:py-12 max-w-4xl">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Find Your Perfect Stay
                        </h1>
                        <p className="text-primary-100 mb-6 max-w-2xl">
                            Discover amazing properties for your next adventure.
                            Use our advanced filters to find exactly what you're
                            looking for.
                        </p>

                        {/* Enhanced Search Bar */}
                        <div className="bg-white rounded-xl shadow-md p-2 md:p-3 flex flex-col md:flex-row gap-2">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-1 flex-col md:flex-row gap-2 w-full"
                            >
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaSearch className="text-primary-500" />
                                    </div>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        name="search"
                                        placeholder="Search by property name or description..."
                                        defaultValue={filters.search}
                                        className="input-field pl-10 w-full py-3 rounded-lg border-gray-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                    />
                                </div>

                                <div className="relative md:w-1/3">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-primary-500" />
                                    </div>
                                    <input
                                        ref={locationInputRef}
                                        type="text"
                                        name="city"
                                        placeholder="Location (city)"
                                        defaultValue={filters.city}
                                        className="input-field pl-10 w-full py-3 rounded-lg border-gray-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setIsFilterModalOpen(true)
                                        }}
                                        className="btn btn-secondary py-3 px-4 relative flex items-center gap-2 rounded-lg"
                                    >
                                        <MdTune className="text-lg" />
                                        <span className="hidden md:inline">
                                            Filters
                                        </span>
                                        {activeFilters > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                                {activeFilters}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary py-3 px-6 rounded-lg"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Active Filters Pills */}
                {activeFilters > 0 && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">
                                Active filters:
                            </span>

                            {filters.search && (
                                <span className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full flex items-center border border-primary-100">
                                    <FaSearch className="mr-1 text-xs" />
                                    {filters.search.length > 15
                                        ? filters.search.substring(0, 15) +
                                          "..."
                                        : filters.search}
                                    <button
                                        onClick={() => clearFilter("search")}
                                        className="ml-2 text-primary-500 hover:text-primary-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.type && (
                                <span className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full flex items-center border border-primary-100">
                                    <FaHome className="mr-1 text-xs" />
                                    {filters.type.charAt(0).toUpperCase() +
                                        filters.type.slice(1)}
                                    <button
                                        onClick={() => clearFilter("type")}
                                        className="ml-2 text-primary-500 hover:text-primary-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.city && (
                                <span className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full flex items-center border border-primary-100">
                                    <FaMapMarkerAlt className="mr-1 text-xs" />
                                    {filters.city}
                                    <button
                                        onClick={() => clearFilter("city")}
                                        className="ml-2 text-primary-500 hover:text-primary-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {(filters.minPrice || filters.maxPrice) && (
                                <span className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full flex items-center border border-primary-100">
                                    <FaDollarSign className="mr-1 text-xs" />
                                    {filters.minPrice
                                        ? `$${filters.minPrice}`
                                        : "$0"}{" "}
                                    -
                                    {filters.maxPrice
                                        ? ` $${filters.maxPrice}`
                                        : " Any"}
                                    <button
                                        onClick={() => {
                                            if (filters.minPrice)
                                                clearFilter("minPrice")
                                            if (filters.maxPrice)
                                                clearFilter("maxPrice")
                                        }}
                                        className="ml-2 text-primary-500 hover:text-primary-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.bedrooms && (
                                <span className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full flex items-center border border-primary-100">
                                    <FaBed className="mr-1 text-xs" />
                                    {filters.bedrooms}+ beds
                                    <button
                                        onClick={() => clearFilter("bedrooms")}
                                        className="ml-2 text-primary-500 hover:text-primary-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.bathrooms && (
                                <span className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full flex items-center border border-primary-100">
                                    <FaBath className="mr-1 text-xs" />
                                    {filters.bathrooms}+ baths
                                    <button
                                        onClick={() => clearFilter("bathrooms")}
                                        className="ml-2 text-primary-500 hover:text-primary-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.maxGuests && (
                                <span className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full flex items-center border border-primary-100">
                                    <FaUsers className="mr-1 text-xs" />
                                    {filters.maxGuests} guests
                                    <button
                                        onClick={() => clearFilter("maxGuests")}
                                        className="ml-2 text-primary-500 hover:text-primary-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.amenities && (
                                <span className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full flex items-center border border-primary-100">
                                    <IoIosRocket className="mr-1 text-xs" />
                                    {
                                        filters.amenities
                                            .split(",")
                                            .filter(Boolean).length
                                    }{" "}
                                    amenities
                                    <button
                                        onClick={() => clearFilter("amenities")}
                                        className="ml-2 text-primary-500 hover:text-primary-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            <button
                                onClick={clearAllFilters}
                                className="text-primary-600 text-sm font-medium hover:text-primary-800 hover:underline ml-auto"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter Modal */}
                {isFilterModalOpen && (
                    <FilterModal
                        isOpen={true}
                        onClose={() => setIsFilterModalOpen(false)}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onFilterApply={(newFilters) => {
                            setFilters({
                                ...newFilters,
                                page: 1, // Reset to first page when filters change
                            })
                            setIsFilterModalOpen(false)
                        }}
                        onClearFilters={clearAllFilters}
                    />
                )}

                {/* Results Section */}
                <div className="mb-8">
                    {isLoading ? (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                            <div className="inline-block w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-600 text-lg">
                                Finding your perfect stays...
                            </p>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                            <div className="bg-danger-50 text-danger-700 p-6 rounded-xl max-w-lg mx-auto">
                                <p className="font-medium text-lg">
                                    Error loading properties
                                </p>
                                <p className="mt-2">{error.message}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 btn btn-danger"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : data?.properties?.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                            <div className="text-7xl mb-6 text-primary-300">
                                <MdOutlineExplore className="mx-auto" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                No properties found
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                We couldn't find any properties matching your
                                criteria. Try adjusting your filters or
                                exploring different locations.
                            </p>
                            <button
                                onClick={clearAllFilters}
                                className="btn btn-primary"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <span className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                                            {data?.pagination?.total || 0}
                                        </span>
                                        {data?.pagination?.total === 1
                                            ? "Property"
                                            : "Properties"}{" "}
                                        Available
                                    </h2>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Showing{" "}
                                        <span className="font-medium text-primary-600">
                                            {data?.properties?.length || 0}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium text-primary-600">
                                            {data?.pagination?.total || 0}
                                        </span>{" "}
                                        properties
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* View Mode Toggle */}
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={`p-2 rounded-md flex items-center justify-center ${
                                                viewMode === "grid"
                                                    ? "bg-white text-primary-600 shadow-sm"
                                                    : "text-gray-600 hover:bg-gray-200"
                                            }`}
                                            aria-label="Grid view"
                                        >
                                            <FaThLarge size={16} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode("list")}
                                            className={`p-2 rounded-md flex items-center justify-center ${
                                                viewMode === "list"
                                                    ? "bg-white text-primary-600 shadow-sm"
                                                    : "text-gray-600 hover:bg-gray-200"
                                            }`}
                                            aria-label="List view"
                                        >
                                            <FaList size={16} />
                                        </button>
                                    </div>

                                    {/* Sort Dropdown */}
                                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                                        <span className="text-gray-600 text-sm">
                                            Sort:
                                        </span>
                                        <select
                                            name="sort"
                                            value={filters.sort}
                                            onChange={handleFilterChange}
                                            className="border-0 bg-transparent focus:ring-0 text-gray-800 font-medium text-sm"
                                        >
                                            <option value="-createdAt">
                                                Newest
                                            </option>
                                            <option value="price">
                                                Price: Low to High
                                            </option>
                                            <option value="-price">
                                                Price: High to Low
                                            </option>
                                            <option value="-avgRating">
                                                Highest Rated
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Property Grid */}
                            <div
                                className={`${
                                    viewMode === "grid"
                                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                        : "flex flex-col gap-4"
                                }`}
                            >
                                {data?.properties ? (
                                    data.properties.map((property) => (
                                        <PropertyCard
                                            key={property._id}
                                            property={property}
                                            onToggleFavorite={
                                                handleToggleFavorite
                                            }
                                            viewMode={viewMode}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10">
                                        <p className="text-gray-500">
                                            No properties found matching your
                                            criteria.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && !isError && data?.pagination?.pages > 1 && (
                    <div className="flex justify-center mt-12 mb-8">
                        <div className="flex items-center space-x-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                            <button
                                onClick={() =>
                                    handlePageChange(filters.page - 1)
                                }
                                disabled={filters.page === 1}
                                className={`p-2.5 rounded-lg ${
                                    filters.page === 1
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                                }`}
                                aria-label="Previous page"
                            >
                                <FaChevronLeft />
                            </button>

                            {(() => {
                                const totalPages = data.pagination.pages
                                const currentPage = filters.page
                                const pages = []

                                // Always show first page
                                pages.push(
                                    <button
                                        key={1}
                                        onClick={() => handlePageChange(1)}
                                        className={`w-10 h-10 rounded-lg ${
                                            currentPage === 1
                                                ? "bg-primary-600 text-white"
                                                : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                                        }`}
                                    >
                                        1
                                    </button>
                                )

                                // Show ellipsis if needed
                                if (currentPage > 3) {
                                    pages.push(
                                        <span
                                            key="ellipsis1"
                                            className="text-gray-400"
                                        >
                                            ...
                                        </span>
                                    )
                                }

                                // Show current page and adjacent pages
                                for (
                                    let i = Math.max(2, currentPage - 1);
                                    i <=
                                    Math.min(totalPages - 1, currentPage + 1);
                                    i++
                                ) {
                                    if (i === 1 || i === totalPages) continue // Skip first and last page as they're always shown
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={`w-10 h-10 rounded-lg ${
                                                currentPage === i
                                                    ? "bg-primary-600 text-white"
                                                    : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                                            }`}
                                        >
                                            {i}
                                        </button>
                                    )
                                }

                                // Show ellipsis if needed
                                if (currentPage < totalPages - 2) {
                                    pages.push(
                                        <span
                                            key="ellipsis2"
                                            className="text-gray-400"
                                        >
                                            ...
                                        </span>
                                    )
                                }

                                // Always show last page if there is more than one page
                                if (totalPages > 1) {
                                    pages.push(
                                        <button
                                            key={totalPages}
                                            onClick={() =>
                                                handlePageChange(totalPages)
                                            }
                                            className={`w-10 h-10 rounded-lg ${
                                                currentPage === totalPages
                                                    ? "bg-primary-600 text-white"
                                                    : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                                            }`}
                                        >
                                            {totalPages}
                                        </button>
                                    )
                                }

                                return pages
                            })()}

                            <button
                                onClick={() =>
                                    handlePageChange(filters.page + 1)
                                }
                                disabled={
                                    filters.page === data.pagination.pages
                                }
                                className={`p-2.5 rounded-lg ${
                                    filters.page === data.pagination.pages
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                                }`}
                                aria-label="Next page"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PropertyListPage
