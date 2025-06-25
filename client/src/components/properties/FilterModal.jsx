import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import ReactSlider from "react-slider"
import "./FilterModal.css"
import {
    FaMapMarkerAlt,
    FaRupeeSign,
    FaUsers,
    FaWifi,
    FaSwimmingPool,
    FaDumbbell,
    FaParking,
    FaSnowflake,
    FaHome,
    FaBuilding,
    FaWarehouse,
    FaHotel,
    FaCity,
    FaCheck,
    FaTimes,
    FaFilter,
} from "react-icons/fa"
import {
    MdOutdoorGrill,
    MdPets,
    MdLocalLaundryService,
    MdTv,
    MdKitchen,
} from "react-icons/md"
import { IoIosRocket } from "react-icons/io"
import Modal from "../ui/Modal"
import { formatPrice, getCurrencySymbol } from "../../utils/currency"

/**
 * Redesigned modal component for property filters with modern UI and improved UX
 */
const FilterModal = ({
    isOpen,
    onClose,
    filters,
    onFilterChange,
    onFilterApply,
    onClearFilters,
}) => {
    // Local state for filters (to avoid applying changes immediately)
    const [localFilters, setLocalFilters] = useState({ ...filters })
    // Track which category is expanded
    const [expandedCategory, setExpandedCategory] = useState("propertyType")
    // Track if any changes were made
    const [hasChanges, setHasChanges] = useState(false)

    // Price range state for the slider
    const [priceRange, setPriceRange] = useState([
        parseInt(localFilters.minPrice) || 0,
        parseInt(localFilters.maxPrice) || 10000,
    ])

    // Reset local filters when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters({ ...filters })
            setPriceRange([
                parseInt(filters.minPrice) || 0,
                parseInt(filters.maxPrice) || 10000,
            ])
            setHasChanges(false)
        }
    }, [isOpen, filters])

    // Property types with icons
    const propertyTypes = [
        { name: "Apartment", icon: <FaBuilding />, value: "apartment" },
        { name: "House", icon: <FaHome />, value: "house" },
        { name: "Villa", icon: <FaHotel />, value: "villa" },
        { name: "Cabin", icon: <FaWarehouse />, value: "cabin" },
        { name: "Condo", icon: <FaCity />, value: "condo" },
    ]

    // Common amenities for quick selection with improved icons
    const amenities = [
        { name: "WiFi", icon: <FaWifi />, value: "wifi" },
        { name: "Pool", icon: <FaSwimmingPool />, value: "pool" },
        { name: "Gym", icon: <FaDumbbell />, value: "gym" },
        { name: "Parking", icon: <FaParking />, value: "parking" },
        { name: "AC", icon: <FaSnowflake />, value: "air conditioning" },
        { name: "Kitchen", icon: <MdKitchen />, value: "kitchen" },
        { name: "TV", icon: <MdTv />, value: "tv" },
        { name: "Washer", icon: <MdLocalLaundryService />, value: "washer" },
        { name: "BBQ", icon: <MdOutdoorGrill />, value: "bbq" },
        { name: "Pet Friendly", icon: <MdPets />, value: "pet friendly" },
    ]

    // Handle local filter changes
    const handleLocalFilterChange = (e) => {
        const { name, value } = e.target
        setLocalFilters((prev) => ({
            ...prev,
            [name]: value,
        }))
        setHasChanges(true)
    }

    // Toggle property type
    const togglePropertyType = (typeValue) => {
        setLocalFilters((prev) => ({
            ...prev,
            type: prev.type === typeValue ? "" : typeValue,
        }))
        setHasChanges(true)
    }

    // Toggle amenity in filter
    const toggleAmenity = (amenity) => {
        const currentAmenities = localFilters.amenities
            ? localFilters.amenities.split(",")
            : []
        let newAmenities

        if (currentAmenities.includes(amenity)) {
            newAmenities = currentAmenities.filter((a) => a !== amenity)
        } else {
            newAmenities = [...currentAmenities, amenity]
        }

        setLocalFilters((prev) => ({
            ...prev,
            amenities: newAmenities.join(","),
        }))
        setHasChanges(true)
    }

    // Apply filters and close modal with improved event handling
    const applyFilters = (e) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }

        // Add a small delay to prevent flickering
        setTimeout(() => {
            onFilterApply(localFilters)
            onClose()
        }, 10)
    }

    // Clear all filters
    const clearAllFilters = () => {
        const clearedFilters = {
            ...localFilters,
            type: "",
            minPrice: "",
            maxPrice: "",
            bedrooms: "",
            bathrooms: "",
            maxGuests: "",
            city: "",
            country: "",
            amenities: "",
        }
        setLocalFilters(clearedFilters)
        setPriceRange([0, 10000])
        setHasChanges(true)
    }

    // Toggle category expansion
    const toggleCategory = (category) => {
        setExpandedCategory(expandedCategory === category ? null : category)
    }

    // Count active filters
    const countActiveFilters = () => {
        let count = 0
        if (localFilters.type) count++
        if (localFilters.minPrice || localFilters.maxPrice) count++
        if (localFilters.bedrooms) count++
        if (localFilters.bathrooms) count++
        if (localFilters.maxGuests) count++
        if (localFilters.city) count++
        if (localFilters.country) count++
        if (localFilters.amenities) {
            count += localFilters.amenities.split(",").filter(Boolean).length
        }
        return count
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center justify-center w-full">
                    <span className="font-medium text-secondary-900">
                        Filters
                    </span>
                    {countActiveFilters() > 0 && (
                        <span className="ml-2 bg-secondary-100 text-secondary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {countActiveFilters()}
                        </span>
                    )}
                </div>
            }
            size="2xl"
            showCloseButton={true}
        >
            <div className="flex flex-col h-full">
                {/* Filter Categories */}
                <div className="flex flex-col divide-y divide-secondary-200 mt-4">
                    {/* Property Type Category - Airbnb Style */}
                    <div className="py-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-secondary-900">
                                Property Type
                            </h3>
                            <span className="text-secondary-500 text-sm">
                                {localFilters.type ? (
                                    <span className="text-secondary-800 font-medium capitalize">
                                        {localFilters.type}
                                    </span>
                                ) : (
                                    <span>Any type</span>
                                )}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {propertyTypes.map((type) => {
                                const isSelected =
                                    localFilters.type === type.value
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() =>
                                            togglePropertyType(type.value)
                                        }
                                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                                            isSelected
                                                ? "bg-secondary-50 border-2 border-secondary-900"
                                                : "bg-white border border-secondary-300 hover:border-secondary-500"
                                        }`}
                                    >
                                        <div
                                            className={`text-2xl mb-2 ${
                                                isSelected
                                                    ? "text-secondary-900"
                                                    : "text-secondary-500"
                                            }`}
                                        >
                                            {type.icon}
                                        </div>
                                        <span
                                            className={`text-sm ${
                                                isSelected
                                                    ? "font-medium text-secondary-900"
                                                    : "text-secondary-600"
                                            }`}
                                        >
                                            {type.name}
                                        </span>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-secondary-900 text-white rounded-full p-0.5">
                                                <FaCheck size={8} />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Price Range Category */}
                    <div className="py-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-secondary-900">
                                Price Range
                            </h3>
                            <span className="text-secondary-500 text-sm">
                                {localFilters.minPrice ||
                                localFilters.maxPrice ? (
                                    <span className="text-secondary-800 font-medium">
                                        {localFilters.minPrice
                                            ? formatPrice(localFilters.minPrice)
                                            : `${getCurrencySymbol()}0`}{" "}
                                        -{" "}
                                        {localFilters.maxPrice
                                            ? formatPrice(localFilters.maxPrice)
                                            : "Any"}
                                    </span>
                                ) : (
                                    <span>Any price</span>
                                )}
                            </span>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                            {/* Interactive price range slider using ReactSlider */}
                            <div className="mb-6 px-2">
                                <ReactSlider
                                    className="horizontal-slider"
                                    thumbClassName="thumb"
                                    trackClassName="track"
                                    value={priceRange}
                                    ariaLabel={[
                                        "Minimum price",
                                        "Maximum price",
                                    ]}
                                    ariaValuetext={(state) =>
                                        `${getCurrencySymbol()}${
                                            state.valueNow
                                        }`
                                    }
                                    pearling
                                    min={0}
                                    max={10000}
                                    minDistance={500}
                                    onChange={(value) => {
                                        setPriceRange(value)
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            minPrice: value[0].toString(),
                                            maxPrice: value[1].toString(),
                                        }))
                                        setHasChanges(true)
                                    }}
                                />
                            </div>

                            {/* Current price range display */}
                            <div className="mt-2 mb-4 text-center">
                                <span className="text-sm font-medium text-secondary-700">
                                    Current range: {getCurrencySymbol()}
                                    {formatPrice(priceRange[0])} -{" "}
                                    {getCurrencySymbol()}
                                    {formatPrice(priceRange[1])}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm text-secondary-600 mb-1">
                                        Minimum
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-secondary-500">
                                                {getCurrencySymbol()}
                                            </span>
                                        </div>
                                        <input
                                            type="number"
                                            name="minPrice"
                                            placeholder="0"
                                            value={localFilters.minPrice}
                                            onChange={(e) => {
                                                handleLocalFilterChange(e)
                                                const newMinPrice =
                                                    parseInt(e.target.value) ||
                                                    0

                                                // Ensure min price is not greater than max price
                                                if (
                                                    localFilters.maxPrice &&
                                                    newMinPrice >
                                                        parseInt(
                                                            localFilters.maxPrice
                                                        )
                                                ) {
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        maxPrice:
                                                            e.target.value,
                                                    }))
                                                    setPriceRange([
                                                        newMinPrice,
                                                        newMinPrice,
                                                    ])
                                                } else {
                                                    setPriceRange([
                                                        newMinPrice,
                                                        priceRange[1],
                                                    ])
                                                }
                                            }}
                                            min="0"
                                            className="w-full pl-7 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-secondary-200 focus:border-secondary-400"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-center">
                                    <div className="w-6 h-0.5 bg-secondary-300"></div>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm text-secondary-600 mb-1">
                                        Maximum
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-secondary-500">
                                                {getCurrencySymbol()}
                                            </span>
                                        </div>
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            placeholder="Any"
                                            value={localFilters.maxPrice}
                                            onChange={(e) => {
                                                handleLocalFilterChange(e)
                                                const newMaxPrice =
                                                    parseInt(e.target.value) ||
                                                    10000

                                                // Ensure max price is not less than min price
                                                if (
                                                    localFilters.minPrice &&
                                                    newMaxPrice <
                                                        parseInt(
                                                            localFilters.minPrice
                                                        )
                                                ) {
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        minPrice:
                                                            e.target.value,
                                                    }))
                                                    setPriceRange([
                                                        newMaxPrice,
                                                        newMaxPrice,
                                                    ])
                                                } else {
                                                    setPriceRange([
                                                        priceRange[0],
                                                        newMaxPrice,
                                                    ])
                                                }
                                            }}
                                            min={localFilters.minPrice || "0"}
                                            className="w-full pl-7 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-secondary-200 focus:border-secondary-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between text-sm text-secondary-500">
                                <span>{getCurrencySymbol()}0</span>
                                <span>{getCurrencySymbol()}2500</span>
                                <span>{getCurrencySymbol()}5000</span>
                                <span>{getCurrencySymbol()}7500</span>
                                <span>{getCurrencySymbol()}10000+</span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {[500, 1000, 2500, 5000, 7500].map((price) => (
                                    <button
                                        key={price}
                                        type="button"
                                        onClick={() => {
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                minPrice: "0",
                                                maxPrice: price.toString(),
                                            }))
                                            setPriceRange([0, price])
                                            setHasChanges(true)
                                        }}
                                        className={`px-3 py-1.5 text-sm rounded-full border ${
                                            localFilters.maxPrice ===
                                            price.toString()
                                                ? "bg-primary-50 border-primary-300 text-primary-700 font-medium"
                                                : "bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300"
                                        }`}
                                    >
                                        Under {getCurrencySymbol()}
                                        {price}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            minPrice: "",
                                            maxPrice: "",
                                        }))
                                        setPriceRange([0, 10000])
                                        setHasChanges(true)
                                    }}
                                    className={`px-3 py-1.5 text-sm rounded-full border ${
                                        !localFilters.minPrice &&
                                        !localFilters.maxPrice
                                            ? "bg-primary-50 border-primary-300 text-primary-700 font-medium"
                                            : "bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300"
                                    }`}
                                >
                                    Any price
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Rooms & Guests Category */}
                    <div className="py-4">
                        <button
                            type="button"
                            onClick={() => toggleCategory("rooms")}
                            className="w-full flex items-center justify-between py-2"
                        >
                            <h3 className="text-lg font-semibold text-secondary-900">
                                Rooms & Guests
                            </h3>
                            <div className="flex items-center">
                                <span className="text-secondary-500">
                                    {localFilters.bedrooms ||
                                    localFilters.bathrooms ||
                                    localFilters.maxGuests ? (
                                        <span className="text-primary-600 text-sm font-normal">
                                            {[
                                                localFilters.bedrooms &&
                                                    `${
                                                        localFilters.bedrooms
                                                    } bed${
                                                        localFilters.bedrooms !==
                                                        "1"
                                                            ? "s"
                                                            : ""
                                                    }`,
                                                localFilters.bathrooms &&
                                                    `${
                                                        localFilters.bathrooms
                                                    } bath${
                                                        localFilters.bathrooms !==
                                                        "1"
                                                            ? "s"
                                                            : ""
                                                    }`,
                                                localFilters.maxGuests &&
                                                    `${
                                                        localFilters.maxGuests
                                                    } guest${
                                                        localFilters.maxGuests !==
                                                        "1"
                                                            ? "s"
                                                            : ""
                                                    }`,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </span>
                                    ) : (
                                        <span className="text-secondary-400 text-sm font-normal">
                                            Any
                                        </span>
                                    )}
                                </span>
                                <svg
                                    className={`ml-2 w-5 h-5 text-secondary-400 transition-transform ${
                                        expandedCategory === "rooms"
                                            ? "transform rotate-180"
                                            : ""
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </button>

                        {expandedCategory === "rooms" && (
                            <div className="mt-4 bg-white p-4 rounded-xl border border-secondary-100 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label
                                            htmlFor="bedrooms"
                                            className="block text-secondary-700 font-medium mb-2"
                                        >
                                            Bedrooms
                                        </label>
                                        <select
                                            id="bedrooms"
                                            name="bedrooms"
                                            value={localFilters.bedrooms}
                                            onChange={handleLocalFilterChange}
                                            className="w-full rounded-lg border-secondary-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                        >
                                            <option value="">Any</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5+</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="bathrooms"
                                            className="block text-secondary-700 font-medium mb-2"
                                        >
                                            Bathrooms
                                        </label>
                                        <select
                                            id="bathrooms"
                                            name="bathrooms"
                                            value={localFilters.bathrooms}
                                            onChange={handleLocalFilterChange}
                                            className="w-full rounded-lg border-secondary-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                        >
                                            <option value="">Any</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4+</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="maxGuests"
                                            className="block text-secondary-700 font-medium mb-2"
                                        >
                                            Guests
                                        </label>
                                        <select
                                            id="maxGuests"
                                            name="maxGuests"
                                            value={localFilters.maxGuests}
                                            onChange={handleLocalFilterChange}
                                            className="w-full rounded-lg border-secondary-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                        >
                                            <option value="">Any</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                            <option value="9">9</option>
                                            <option value="10">10+</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Location Category */}
                    <div className="py-4">
                        <button
                            type="button"
                            onClick={() => toggleCategory("location")}
                            className="w-full flex items-center justify-between py-2"
                        >
                            <h3 className="text-lg font-semibold text-secondary-900">
                                Location
                            </h3>
                            <div className="flex items-center">
                                <span className="text-secondary-500">
                                    {localFilters.city ||
                                    localFilters.country ? (
                                        <span className="text-primary-600 text-sm font-normal">
                                            {[
                                                localFilters.city,
                                                localFilters.country,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </span>
                                    ) : (
                                        <span className="text-secondary-400 text-sm font-normal">
                                            Anywhere
                                        </span>
                                    )}
                                </span>
                                <svg
                                    className={`ml-2 w-5 h-5 text-secondary-400 transition-transform ${
                                        expandedCategory === "location"
                                            ? "transform rotate-180"
                                            : ""
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </button>

                        {expandedCategory === "location" && (
                            <div className="mt-4 bg-white p-4 rounded-xl border border-secondary-100 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="country"
                                            className="block text-secondary-700 font-medium mb-2"
                                        >
                                            Country
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaMapMarkerAlt className="text-primary-500" />
                                            </div>
                                            <input
                                                type="text"
                                                id="country"
                                                name="country"
                                                placeholder="Any country"
                                                value={localFilters.country}
                                                onChange={
                                                    handleLocalFilterChange
                                                }
                                                className="input-field pl-10 rounded-lg border-secondary-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="city"
                                            className="block text-secondary-700 font-medium mb-2"
                                        >
                                            City
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaMapMarkerAlt className="text-primary-500" />
                                            </div>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                placeholder="Any city"
                                                value={localFilters.city}
                                                onChange={
                                                    handleLocalFilterChange
                                                }
                                                className="input-field pl-10 rounded-lg border-secondary-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Amenities Category */}
                    <div className="py-4">
                        <button
                            type="button"
                            onClick={() => toggleCategory("amenities")}
                            className="w-full flex items-center justify-between py-2"
                        >
                            <h3 className="text-lg font-semibold text-secondary-900">
                                Amenities
                            </h3>
                            <div className="flex items-center">
                                <span className="text-secondary-500">
                                    {localFilters.amenities ? (
                                        <span className="text-primary-600 text-sm font-normal">
                                            {
                                                localFilters.amenities
                                                    .split(",")
                                                    .filter(Boolean).length
                                            }{" "}
                                            selected
                                        </span>
                                    ) : (
                                        <span className="text-secondary-400 text-sm font-normal">
                                            None selected
                                        </span>
                                    )}
                                </span>
                                <svg
                                    className={`ml-2 w-5 h-5 text-secondary-400 transition-transform ${
                                        expandedCategory === "amenities"
                                            ? "transform rotate-180"
                                            : ""
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </button>

                        {expandedCategory === "amenities" && (
                            <div className="mt-4 bg-white p-4 rounded-xl border border-secondary-100 shadow-sm">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {amenities.map((amenity) => {
                                        const isSelected =
                                            localFilters.amenities
                                                ? localFilters.amenities
                                                      .split(",")
                                                      .includes(amenity.value)
                                                : false
                                        return (
                                            <button
                                                key={amenity.value}
                                                type="button"
                                                onClick={() =>
                                                    toggleAmenity(amenity.value)
                                                }
                                                className={`flex items-center p-3 rounded-lg transition-all ${
                                                    isSelected
                                                        ? "bg-primary-50 text-primary-700 border border-primary-300 shadow-sm"
                                                        : "bg-white text-secondary-700 border border-secondary-200 hover:bg-secondary-50 hover:border-primary-200"
                                                }`}
                                            >
                                                <span className="mr-2 text-lg">
                                                    {amenity.icon}
                                                </span>
                                                <span className="text-sm">
                                                    {amenity.name}
                                                </span>
                                                {isSelected && (
                                                    <span className="ml-auto text-primary-600">
                                                        <FaCheck size={12} />
                                                    </span>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Spacer to prevent content from being hidden behind the fixed footer */}
                <div className="h-20"></div>

                {/* Action Buttons - Airbnb Style */}
                <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-secondary-200 p-4 flex items-center justify-between shadow-md">
                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-secondary-800 underline font-medium hover:text-black"
                    >
                        Clear all
                    </button>
                    <button
                        type="button"
                        onClick={(e) => applyFilters(e)}
                        className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary-800 transition-colors"
                    >
                        Show{" "}
                        {countActiveFilters() > 0
                            ? "filtered homes"
                            : "results"}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

FilterModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func,
    onFilterApply: PropTypes.func.isRequired,
    onClearFilters: PropTypes.func,
}

export default FilterModal
