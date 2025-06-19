import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import {
    FaMapMarkerAlt,
    FaBed,
    FaBath,
    FaDollarSign,
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

    // Reset local filters when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters({ ...filters })
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
        setHasChanges(true)
    }

    // Toggle category expansion
    const toggleCategory = (category) => {
        setExpandedCategory(expandedCategory === category ? null : category)
    }

    // Format price for display
    const formatPrice = (price) => {
        if (!price) return ""
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(price)
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
                <div className="flex items-center">
                    <FaFilter className="mr-2 text-primary-500" />
                    <span>Filters</span>
                    {countActiveFilters() > 0 && (
                        <span className="ml-2 bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
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
                <div className="flex flex-col divide-y divide-gray-200">
                    {/* Property Type Category */}
                    <div className="py-4">
                        <button
                            className="w-full flex items-center justify-between text-left font-medium text-gray-900 mb-2"
                            onClick={() => toggleCategory("propertyType")}
                        >
                            <div className="flex items-center">
                                <FaHome className="mr-2 text-primary-500" />
                                <span className="text-lg">Property Type</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-500">
                                    {localFilters.type ? (
                                        <span className="text-primary-600 text-sm font-normal capitalize">
                                            {localFilters.type}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm font-normal">
                                            Any type
                                        </span>
                                    )}
                                </span>
                                <svg
                                    className={`ml-2 w-5 h-5 text-gray-400 transition-transform ${
                                        expandedCategory === "propertyType"
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

                        {expandedCategory === "propertyType" && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                                                isSelected
                                                    ? "bg-primary-50 text-primary-700 border-2 border-primary-500 shadow-md"
                                                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-primary-200"
                                            }`}
                                        >
                                            <div
                                                className={`text-2xl mb-2 ${
                                                    isSelected
                                                        ? "text-primary-600"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {type.icon}
                                            </div>
                                            <span className="text-sm font-medium">
                                                {type.name}
                                            </span>
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-0.5">
                                                    <FaCheck size={10} />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Price Range Category */}
                    <div className="py-4">
                        <button
                            className="w-full flex items-center justify-between text-left font-medium text-gray-900 mb-2"
                            onClick={() => toggleCategory("priceRange")}
                        >
                            <div className="flex items-center">
                                <FaDollarSign className="mr-2 text-primary-500" />
                                <span className="text-lg">Price Range</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-500">
                                    {localFilters.minPrice ||
                                    localFilters.maxPrice ? (
                                        <span className="text-primary-600 text-sm font-normal">
                                            {localFilters.minPrice
                                                ? formatPrice(
                                                      localFilters.minPrice
                                                  )
                                                : "$0"}{" "}
                                            -{" "}
                                            {localFilters.maxPrice
                                                ? formatPrice(
                                                      localFilters.maxPrice
                                                  )
                                                : "Any"}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm font-normal">
                                            Any price
                                        </span>
                                    )}
                                </span>
                                <svg
                                    className={`ml-2 w-5 h-5 text-gray-400 transition-transform ${
                                        expandedCategory === "priceRange"
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

                        {expandedCategory === "priceRange" && (
                            <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaDollarSign className="text-primary-500" />
                                        </div>
                                        <input
                                            type="number"
                                            name="minPrice"
                                            placeholder="Min price"
                                            value={localFilters.minPrice}
                                            onChange={handleLocalFilterChange}
                                            className="input-field pl-8 rounded-lg border-gray-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                        />
                                    </div>
                                    <span className="text-gray-400">to</span>
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaDollarSign className="text-primary-500" />
                                        </div>
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            placeholder="Max price"
                                            value={localFilters.maxPrice}
                                            onChange={handleLocalFilterChange}
                                            className="input-field pl-8 rounded-lg border-gray-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 mb-2">
                                    <div className="relative h-2 bg-gray-200 rounded-full">
                                        <div
                                            className="absolute left-0 right-0 h-full bg-primary-500 rounded-full"
                                            style={{ width: "60%" }}
                                        ></div>
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full"></div>
                                        <div className="absolute left-[60%] top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between text-sm text-gray-500">
                                    <span>$0</span>
                                    <span>$500</span>
                                    <span>$1000</span>
                                    <span>$1500+</span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {[100, 200, 500, 1000, 1500].map(
                                        (price) => (
                                            <button
                                                key={price}
                                                type="button"
                                                onClick={() => {
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        maxPrice:
                                                            price.toString(),
                                                    }))
                                                    setHasChanges(true)
                                                }}
                                                className={`px-3 py-1.5 text-sm rounded-full border ${
                                                    localFilters.maxPrice ===
                                                    price.toString()
                                                        ? "bg-primary-50 border-primary-300 text-primary-700"
                                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                Under ${price}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rooms & Guests Category */}
                    <div className="py-4">
                        <button
                            className="w-full flex items-center justify-between text-left font-medium text-gray-900 mb-2"
                            onClick={() => toggleCategory("roomsGuests")}
                        >
                            <div className="flex items-center">
                                <FaUsers className="mr-2 text-primary-500" />
                                <span className="text-lg">Rooms & Guests</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-500">
                                    {localFilters.bedrooms ||
                                    localFilters.bathrooms ||
                                    localFilters.maxGuests ? (
                                        <span className="text-primary-600 text-sm font-normal">
                                            {localFilters.bedrooms
                                                ? `${localFilters.bedrooms}+ beds`
                                                : ""}
                                            {localFilters.bathrooms
                                                ? `${
                                                      localFilters.bedrooms
                                                          ? " · "
                                                          : ""
                                                  }${
                                                      localFilters.bathrooms
                                                  }+ baths`
                                                : ""}
                                            {localFilters.maxGuests
                                                ? `${
                                                      localFilters.bedrooms ||
                                                      localFilters.bathrooms
                                                          ? " · "
                                                          : ""
                                                  }${
                                                      localFilters.maxGuests
                                                  } guests`
                                                : ""}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm font-normal">
                                            Any
                                        </span>
                                    )}
                                </span>
                                <svg
                                    className={`ml-2 w-5 h-5 text-gray-400 transition-transform ${
                                        expandedCategory === "roomsGuests"
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

                        {expandedCategory === "roomsGuests" && (
                            <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label
                                            htmlFor="bedrooms"
                                            className="block text-gray-700 font-medium mb-2"
                                        >
                                            Bedrooms
                                        </label>
                                        <div className="flex gap-2">
                                            {[
                                                "Any",
                                                "1+",
                                                "2+",
                                                "3+",
                                                "4+",
                                                "5+",
                                            ].map((value, index) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => {
                                                        setLocalFilters(
                                                            (prev) => ({
                                                                ...prev,
                                                                bedrooms:
                                                                    index === 0
                                                                        ? ""
                                                                        : value.replace(
                                                                              "+",
                                                                              ""
                                                                          ),
                                                            })
                                                        )
                                                        setHasChanges(true)
                                                    }}
                                                    className={`flex-1 py-2 rounded-lg border ${
                                                        (index === 0 &&
                                                            !localFilters.bedrooms) ||
                                                        (index > 0 &&
                                                            localFilters.bedrooms ===
                                                                value.replace(
                                                                    "+",
                                                                    ""
                                                                ))
                                                            ? "bg-primary-50 border-primary-300 text-primary-700"
                                                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="bathrooms"
                                            className="block text-gray-700 font-medium mb-2"
                                        >
                                            Bathrooms
                                        </label>
                                        <div className="flex gap-2">
                                            {[
                                                "Any",
                                                "1+",
                                                "2+",
                                                "3+",
                                                "4+",
                                            ].map((value, index) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => {
                                                        setLocalFilters(
                                                            (prev) => ({
                                                                ...prev,
                                                                bathrooms:
                                                                    index === 0
                                                                        ? ""
                                                                        : value.replace(
                                                                              "+",
                                                                              ""
                                                                          ),
                                                            })
                                                        )
                                                        setHasChanges(true)
                                                    }}
                                                    className={`flex-1 py-2 rounded-lg border ${
                                                        (index === 0 &&
                                                            !localFilters.bathrooms) ||
                                                        (index > 0 &&
                                                            localFilters.bathrooms ===
                                                                value.replace(
                                                                    "+",
                                                                    ""
                                                                ))
                                                            ? "bg-primary-50 border-primary-300 text-primary-700"
                                                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="maxGuests"
                                            className="block text-gray-700 font-medium mb-2"
                                        >
                                            Guests
                                        </label>
                                        <div className="flex gap-2">
                                            {["Any", "2", "4", "6", "8+"].map(
                                                (value, index) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => {
                                                            setLocalFilters(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    maxGuests:
                                                                        index ===
                                                                        0
                                                                            ? ""
                                                                            : value.replace(
                                                                                  "+",
                                                                                  ""
                                                                              ),
                                                                })
                                                            )
                                                            setHasChanges(true)
                                                        }}
                                                        className={`flex-1 py-2 rounded-lg border ${
                                                            (index === 0 &&
                                                                !localFilters.maxGuests) ||
                                                            (index > 0 &&
                                                                localFilters.maxGuests ===
                                                                    value.replace(
                                                                        "+",
                                                                        ""
                                                                    ))
                                                                ? "bg-primary-50 border-primary-300 text-primary-700"
                                                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {value}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Location Category */}
                    <div className="py-4">
                        <button
                            className="w-full flex items-center justify-between text-left font-medium text-gray-900 mb-2"
                            onClick={() => toggleCategory("location")}
                        >
                            <div className="flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-primary-500" />
                                <span className="text-lg">Location</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-500">
                                    {localFilters.city ||
                                    localFilters.country ? (
                                        <span className="text-primary-600 text-sm font-normal">
                                            {localFilters.city &&
                                            localFilters.country
                                                ? `${localFilters.city}, ${localFilters.country}`
                                                : localFilters.city ||
                                                  localFilters.country}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm font-normal">
                                            Anywhere
                                        </span>
                                    )}
                                </span>
                                <svg
                                    className={`ml-2 w-5 h-5 text-gray-400 transition-transform ${
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
                            <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="country"
                                            className="block text-gray-700 font-medium mb-2"
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
                                                className="input-field pl-10 rounded-lg border-gray-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="city"
                                            className="block text-gray-700 font-medium mb-2"
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
                                                className="input-field pl-10 rounded-lg border-gray-200 focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 mb-2">
                                        Popular destinations
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            "New York",
                                            "Los Angeles",
                                            "Miami",
                                            "Chicago",
                                            "San Francisco",
                                            "Las Vegas",
                                        ].map((city) => (
                                            <button
                                                key={city}
                                                type="button"
                                                onClick={() => {
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        city,
                                                    }))
                                                    setHasChanges(true)
                                                }}
                                                className={`px-3 py-1.5 text-sm rounded-full border ${
                                                    localFilters.city === city
                                                        ? "bg-primary-50 border-primary-300 text-primary-700"
                                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Amenities Category */}
                    <div className="py-4">
                        <button
                            className="w-full flex items-center justify-between text-left font-medium text-gray-900 mb-2"
                            onClick={() => toggleCategory("amenities")}
                        >
                            <div className="flex items-center">
                                <IoIosRocket className="mr-2 text-primary-500" />
                                <span className="text-lg">Amenities</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-500">
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
                                        <span className="text-gray-400 text-sm font-normal">
                                            None selected
                                        </span>
                                    )}
                                </span>
                                <svg
                                    className={`ml-2 w-5 h-5 text-gray-400 transition-transform ${
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
                            <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
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
                                                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-primary-200"
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

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-primary-600 hover:text-primary-800 font-medium flex items-center"
                    >
                        <FaTimes className="mr-1" size={14} />
                        Clear all filters
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={(e) => applyFilters(e)}
                            className={`btn ${
                                hasChanges ? "btn-primary" : "btn-secondary"
                            }`}
                            disabled={!hasChanges}
                        >
                            Apply Filters
                            {countActiveFilters() > 0 && (
                                <span className="ml-2 bg-white text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {countActiveFilters()}
                                </span>
                            )}
                        </button>
                    </div>
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
