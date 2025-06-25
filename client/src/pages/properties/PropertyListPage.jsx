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
    FaRupeeSign,
    FaFilter,
    FaSlidersH,
    FaSort,
    FaUmbrellaBeach,
    FaMountain,
    FaCity,
    FaTree,
    FaSwimmingPool,
    FaWifi,
    FaHotel,
    FaWarehouse,
    FaBuilding,
    FaMap,
} from "react-icons/fa"
import { IoIosRocket } from "react-icons/io"
import {
    MdOutlineExplore,
    MdTune,
    MdOutdoorGrill,
    MdPets,
} from "react-icons/md"
import { propertyService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import PropertyCard from "../../components/properties/PropertyCard"
import FilterModal from "../../components/properties/FilterModal"
import { Card, Badge, Button, Spinner } from "../../components/ui"
import { getCurrencySymbol } from "../../utils/currency"

/**
 * Airbnb-style property listing page with modern UI/UX
 */
const PropertyListPage = () => {
    const { addToFavorites, removeFromFavorites, user, isAuthenticated } =
        useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const [filters, setFilters] = useState({
        page: parseInt(searchParams.get("page") || "1"),
        limit: parseInt(searchParams.get("limit") || "20"), // Increased limit for more properties per page
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
    const [showMap, setShowMap] = useState(false) // Toggle for map view
    const [isFilterSectionVisible, setIsFilterSectionVisible] = useState(false)
    const searchInputRef = useRef(null)
    const locationInputRef = useRef(null)
    const filterScrollRef = useRef(null) // Reference for horizontal filter scroll

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

    // Property type options for quick filters
    const propertyTypes = [
        { value: "apartment", label: "Apartments", icon: <FaBuilding /> },
        { value: "house", label: "Houses", icon: <FaHome /> },
        { value: "villa", label: "Villas", icon: <FaHotel /> },
        { value: "cabin", label: "Cabins", icon: <FaWarehouse /> },
        { value: "condo", label: "Condos", icon: <FaCity /> },
    ]

    // Category filters for horizontal scrollbar (Airbnb style)
    const categoryFilters = [
        {
            id: "beachfront",
            label: "Beachfront",
            icon: <FaUmbrellaBeach />,
            amenity: "beachfront",
        },
        {
            id: "mountain",
            label: "Mountain view",
            icon: <FaMountain />,
            amenity: "mountain view",
        },
        {
            id: "pool",
            label: "Pool",
            icon: <FaSwimmingPool />,
            amenity: "pool",
        },
        { id: "wifi", label: "WiFi", icon: <FaWifi />, amenity: "wifi" },
        {
            id: "pet-friendly",
            label: "Pet friendly",
            icon: <MdPets />,
            amenity: "pet friendly",
        },
        {
            id: "bbq",
            label: "BBQ grill",
            icon: <MdOutdoorGrill />,
            amenity: "bbq",
        },
    ]

    // Scroll the filter bar left or right
    const scrollFilters = (direction) => {
        if (filterScrollRef.current) {
            const scrollAmount = 300 // Adjust as needed
            if (direction === "left") {
                filterScrollRef.current.scrollBy({
                    left: -scrollAmount,
                    behavior: "smooth",
                })
            } else {
                filterScrollRef.current.scrollBy({
                    left: scrollAmount,
                    behavior: "smooth",
                })
            }
        }
    }

    // Toggle category filter
    const toggleCategoryFilter = (amenity) => {
        const currentAmenities = filters.amenities
            ? filters.amenities.split(",")
            : []
        let newAmenities

        if (currentAmenities.includes(amenity)) {
            newAmenities = currentAmenities.filter((a) => a !== amenity)
        } else {
            newAmenities = [...currentAmenities, amenity]
        }

        setFilters((prev) => ({
            ...prev,
            amenities: newAmenities.join(","),
            page: 1,
        }))
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[2000px] mx-auto">
                {/* Airbnb-style Search Header */}
                <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Search Bar */}
                        <div className="w-full md:max-w-xl">
                            <form
                                onSubmit={handleSearch}
                                className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-500" />
                                    </div>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        name="search"
                                        placeholder="Search destinations, properties..."
                                        defaultValue={filters.search}
                                        className="w-full py-3 pl-10 pr-3 border-0 focus:ring-0 text-sm"
                                    />
                                </div>

                                <div className="h-8 w-px bg-gray-300 mx-1"></div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-500" />
                                    </div>
                                    <input
                                        ref={locationInputRef}
                                        type="text"
                                        name="city"
                                        placeholder="Where to?"
                                        defaultValue={filters.city}
                                        className="w-full py-3 pl-9 pr-3 border-0 focus:ring-0 text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="bg-primary-600 text-white p-3 rounded-full m-1 hover:bg-primary-700 transition-colors"
                                >
                                    <FaSearch className="text-sm" />
                                </button>
                            </form>
                        </div>

                        {/* Filter and View Controls */}
                        <div className="flex items-center gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={() => setIsFilterModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:shadow-md transition-shadow relative"
                            >
                                <FaFilter className="text-gray-600" />
                                <span>Filters</span>
                                {activeFilters > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {activeFilters}
                                    </span>
                                )}
                            </button>

                            <div className="flex border border-gray-300 rounded-full p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-full ${
                                        viewMode === "grid"
                                            ? "bg-gray-100 text-gray-800"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                    aria-label="Grid view"
                                >
                                    <FaThLarge size={14} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-full ${
                                        viewMode === "list"
                                            ? "bg-gray-100 text-gray-800"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                    aria-label="List view"
                                >
                                    <FaList size={14} />
                                </button>
                            </div>

                            <button
                                onClick={() => setShowMap(!showMap)}
                                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:shadow-md transition-shadow ${
                                    showMap ? "bg-gray-100 text-gray-800" : ""
                                }`}
                            >
                                <FaMap className="text-gray-600" />
                                <span>{showMap ? "Hide map" : "Show map"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Category Filter Bar - Airbnb Style */}
                <div className="relative border-b border-gray-200 bg-white">
                    <div className="px-4 py-4 flex items-center">
                        <button
                            onClick={() => scrollFilters("left")}
                            className="absolute left-0 z-10 bg-white bg-opacity-90 p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                            aria-label="Scroll filters left"
                        >
                            <FaChevronLeft className="text-gray-600" />
                        </button>

                        <div
                            ref={filterScrollRef}
                            className="flex items-center gap-6 overflow-x-auto no-scrollbar px-6 mx-auto"
                        >
                            {categoryFilters.map((category) => {
                                const isActive = filters.amenities?.includes(
                                    category.amenity
                                )
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            toggleCategoryFilter(
                                                category.amenity
                                            )
                                        }
                                        className={`flex flex-col items-center min-w-[80px] pb-2 pt-1 border-b-2 transition-colors ${
                                            isActive
                                                ? "border-gray-800 text-gray-800"
                                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                                        }`}
                                    >
                                        <div
                                            className={`text-2xl mb-1 ${
                                                isActive
                                                    ? "text-gray-800"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {category.icon}
                                        </div>
                                        <span className="text-xs font-medium whitespace-nowrap">
                                            {category.label}
                                        </span>
                                    </button>
                                )
                            })}

                            {propertyTypes.map((type) => {
                                const isActive = filters.type === type.value
                                return (
                                    <button
                                        key={type.value}
                                        onClick={() =>
                                            togglePropertyType(type.value)
                                        }
                                        className={`flex flex-col items-center min-w-[80px] pb-2 pt-1 border-b-2 transition-colors ${
                                            isActive
                                                ? "border-gray-800 text-gray-800"
                                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                                        }`}
                                    >
                                        <div
                                            className={`text-2xl mb-1 ${
                                                isActive
                                                    ? "text-gray-800"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {type.icon}
                                        </div>
                                        <span className="text-xs font-medium whitespace-nowrap">
                                            {type.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => scrollFilters("right")}
                            className="absolute right-0 z-10 bg-white bg-opacity-90 p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                            aria-label="Scroll filters right"
                        >
                            <FaChevronRight className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Active Filters Pills - Airbnb Style */}
                {activeFilters > 0 && (
                    <div className="px-4 py-3 bg-white animate-fadeIn">
                        <div className="flex flex-wrap items-center gap-2">
                            {filters.search && (
                                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-full flex items-center">
                                    <FaSearch className="mr-1.5 text-xs" />
                                    {filters.search.length > 15
                                        ? filters.search.substring(0, 15) +
                                          "..."
                                        : filters.search}
                                    <button
                                        onClick={() => clearFilter("search")}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.type && (
                                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-full flex items-center">
                                    <FaHome className="mr-1.5 text-xs" />
                                    {filters.type.charAt(0).toUpperCase() +
                                        filters.type.slice(1)}
                                    <button
                                        onClick={() => clearFilter("type")}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.city && (
                                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-full flex items-center">
                                    <FaMapMarkerAlt className="mr-1.5 text-xs" />
                                    {filters.city}
                                    <button
                                        onClick={() => clearFilter("city")}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {(filters.minPrice || filters.maxPrice) && (
                                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-full flex items-center">
                                    <FaRupeeSign className="mr-1.5 text-xs" />
                                    {filters.minPrice
                                        ? `${getCurrencySymbol()}${
                                              filters.minPrice
                                          }`
                                        : `${getCurrencySymbol()}0`}{" "}
                                    -
                                    {filters.maxPrice
                                        ? ` ${getCurrencySymbol()}${
                                              filters.maxPrice
                                          }`
                                        : " Any"}
                                    <button
                                        onClick={() => {
                                            if (filters.minPrice)
                                                clearFilter("minPrice")
                                            if (filters.maxPrice)
                                                clearFilter("maxPrice")
                                        }}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.bedrooms && (
                                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-full flex items-center">
                                    <FaBed className="mr-1.5 text-xs" />
                                    {filters.bedrooms}+ beds
                                    <button
                                        onClick={() => clearFilter("bedrooms")}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.bathrooms && (
                                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-full flex items-center">
                                    <FaBath className="mr-1.5 text-xs" />
                                    {filters.bathrooms}+ baths
                                    <button
                                        onClick={() => clearFilter("bathrooms")}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.maxGuests && (
                                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-full flex items-center">
                                    <FaUsers className="mr-1.5 text-xs" />
                                    {filters.maxGuests} guests
                                    <button
                                        onClick={() => clearFilter("maxGuests")}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </span>
                            )}

                            {filters.amenities &&
                                filters.amenities
                                    .split(",")
                                    .filter(Boolean)
                                    .map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-full flex items-center"
                                        >
                                            <IoIosRocket className="mr-1.5 text-xs" />
                                            {amenity}
                                            <button
                                                onClick={() => {
                                                    const newAmenities =
                                                        filters.amenities
                                                            .split(",")
                                                            .filter(
                                                                (a) =>
                                                                    a !==
                                                                    amenity
                                                            )
                                                            .join(",")
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        amenities: newAmenities,
                                                        page: 1,
                                                    }))
                                                }}
                                                className="ml-2 text-gray-500 hover:text-gray-700"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </span>
                                    ))}

                            <button
                                onClick={clearAllFilters}
                                className="text-primary-600 text-sm font-medium hover:text-primary-800 hover:underline ml-auto"
                            >
                                Clear all
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

                {/* Results Section - Airbnb Style */}
                <div className="px-4 py-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Spinner size="lg" />
                            <p className="ml-4 text-gray-600">
                                Finding your perfect stays...
                            </p>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="bg-red-50 text-red-700 p-6 rounded-xl max-w-lg mx-auto">
                                <p className="font-medium text-lg">
                                    Error loading properties
                                </p>
                                <p className="mt-2">{error.message}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : data?.properties?.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="text-7xl mb-6 text-gray-300">
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
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Results Count and Sort */}
                            <div className="flex flex-wrap justify-between items-center mb-6">
                                <div>
                                    <p className="text-gray-700">
                                        <span className="font-semibold text-gray-900">
                                            {data?.pagination?.total || 0}
                                        </span>{" "}
                                        {data?.pagination?.total === 1
                                            ? "stay"
                                            : "stays"}
                                        {filters.city && (
                                            <span>
                                                {" "}
                                                in{" "}
                                                <span className="font-semibold text-gray-900">
                                                    {filters.city}
                                                </span>
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Sort Dropdown - Airbnb Style */}
                                <div className="flex items-center">
                                    <div className="relative">
                                        <select
                                            name="sort"
                                            value={filters.sort}
                                            onChange={handleFilterChange}
                                            className="appearance-none bg-transparent border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
                                        >
                                            <option value="-createdAt">
                                                Newest first
                                            </option>
                                            <option value="price">
                                                Price: Low to High
                                            </option>
                                            <option value="-price">
                                                Price: High to Low
                                            </option>
                                            <option value="-avgRating">
                                                Top rated
                                            </option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Split View - Properties and Map */}
                            <div
                                className={`flex ${
                                    showMap
                                        ? "flex-col md:flex-row"
                                        : "flex-col"
                                }`}
                            >
                                {/* Property Grid - Airbnb Style */}
                                <div
                                    className={`${
                                        showMap ? "md:w-3/5" : "w-full"
                                    }`}
                                >
                                    <div
                                        className={`${
                                            viewMode === "grid"
                                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                                : "flex flex-col gap-4"
                                        }`}
                                    >
                                        {data?.properties ? (
                                            data.properties.map(
                                                (property, index) => (
                                                    <div
                                                        key={property._id}
                                                        className="animate-fadeIn"
                                                        style={{
                                                            animationDelay: `${
                                                                index * 0.05
                                                            }s`,
                                                        }}
                                                    >
                                                        <PropertyCard
                                                            property={property}
                                                            onToggleFavorite={
                                                                handleToggleFavorite
                                                            }
                                                            viewMode={viewMode}
                                                        />
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <div className="col-span-full text-center py-10">
                                                <p className="text-gray-500">
                                                    No properties found matching
                                                    your criteria.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Map View */}
                                {showMap && (
                                    <div className="md:w-2/5 h-[500px] md:h-auto md:sticky md:top-[76px] bg-gray-100 rounded-lg mt-6 md:mt-0 md:ml-6">
                                        <div className="h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <FaMap className="text-4xl text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-600">
                                                    Map view would be displayed
                                                    here
                                                </p>
                                                <p className="text-gray-500 text-sm mt-2">
                                                    (Map integration would be
                                                    implemented with Google Maps
                                                    or Mapbox)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination - Airbnb Style */}
                {!isLoading && !isError && data?.pagination?.pages > 1 && (
                    <div className="flex justify-center mt-12 mb-8">
                        <div className="flex items-center">
                            <button
                                onClick={() =>
                                    handlePageChange(filters.page - 1)
                                }
                                disabled={filters.page === 1}
                                className={`flex items-center gap-2 px-4 py-2 border rounded-full ${
                                    filters.page === 1
                                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                        : "border-gray-300 text-gray-700 hover:border-gray-900 transition-colors"
                                }`}
                                aria-label="Previous page"
                            >
                                <FaChevronLeft size={12} />
                                <span className="font-medium">Previous</span>
                            </button>

                            <div className="mx-4 text-sm text-gray-500">
                                Page{" "}
                                <span className="font-semibold text-gray-900">
                                    {filters.page}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-gray-900">
                                    {data.pagination.pages}
                                </span>
                            </div>

                            <button
                                onClick={() =>
                                    handlePageChange(filters.page + 1)
                                }
                                disabled={
                                    filters.page === data.pagination.pages
                                }
                                className={`flex items-center gap-2 px-4 py-2 border rounded-full ${
                                    filters.page === data.pagination.pages
                                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                        : "border-gray-300 text-gray-700 hover:border-gray-900 transition-colors"
                                }`}
                                aria-label="Next page"
                            >
                                <span className="font-medium">Next</span>
                                <FaChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PropertyListPage
