import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Range } from "react-range"
import "./FilterModal.css"
import {
    FaMapMarkerAlt,
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
} from "react-icons/fa"
import {
    MdOutdoorGrill,
    MdPets,
    MdLocalLaundryService,
    MdTv,
    MdKitchen,
} from "react-icons/md"
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
    // Price slider constants
    const PRICE_MIN = 0
    const PRICE_MAX = 50000
    const PRICE_STEP = 50
    // Local state for filters (to avoid applying changes immediately)
    const [localFilters, setLocalFilters] = useState({ ...filters })
    // Track which category is expanded
    const [expandedCategory, setExpandedCategory] = useState("propertyType")
    // Track if any changes were made
    const [hasChanges, setHasChanges] = useState(false)
    // Track validation errors
    const [priceErrors, setPriceErrors] = useState({ min: "", max: "" })

    // Price range state for the slider
    const [priceRange, setPriceRange] = useState([
        parseInt(localFilters.minPrice) || PRICE_MIN,
        parseInt(localFilters.maxPrice) || PRICE_MAX,
    ])

    // Reset local filters when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters({ ...filters })
            setPriceRange([
                parseInt(filters.minPrice) || PRICE_MIN,
                parseInt(filters.maxPrice) || PRICE_MAX,
            ])
            setHasChanges(false)
            setPriceErrors({ min: "", max: "" })
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

    // Helper function to constrain price values and validate
    const validateAndConstrainPrice = (
        value,
        min = PRICE_MIN,
        max = PRICE_MAX
    ) => {
        if (value === "" || value === null || value === undefined) {
            return { value: min, error: "" }
        }

        const numValue = parseInt(value) || 0
        let error = ""

        if (numValue < min) {
            error = `Minimum value is ${getCurrencySymbol()}${min.toLocaleString()}`
        } else if (numValue > max) {
            error = `Maximum value is ${getCurrencySymbol()}${max.toLocaleString()}`
        }

        const constrainedValue = Math.max(min, Math.min(max, numValue))
        return { value: constrainedValue, error }
    }

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
        setPriceRange([PRICE_MIN, PRICE_MAX])
        setPriceErrors({ min: "", max: "" })
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
                <div className="flex flex-col items-center justify-center w-full">
                    <div className="flex items-center">
                        <span className="font-medium text-secondary-900">
                            Filters
                        </span>
                        {countActiveFilters() > 0 && (
                            <span className="ml-2 bg-secondary-100 text-secondary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                {countActiveFilters()}
                            </span>
                        )}
                    </div>
                    {(priceErrors.min || priceErrors.max) && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full">
                            ⚠️ Price range: {getCurrencySymbol()}
                            {PRICE_MIN.toLocaleString()} - {getCurrencySymbol()}
                            {PRICE_MAX.toLocaleString()}
                        </div>
                    )}
                </div>
            }
            size="2xl"
            showCloseButton={true}
        >
            <div className="flex flex-col h-full">
                {/* Filter Categories */}
                <div className="flex flex-col divide-y divide-secondary-200">
                    {/* Property Type Category - Airbnb Style */}
                    <div className="pb-2">
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
                            {/* Interactive price range slider using react-range */}
                            <div className="mb-6 px-2">
                                {/* Safe Range component with error boundary */}
                                {(() => {
                                    try {
                                        // Ensure values are within bounds
                                        const safeValues = [
                                            Math.max(
                                                PRICE_MIN,
                                                Math.min(
                                                    PRICE_MAX,
                                                    priceRange[0]
                                                )
                                            ),
                                            Math.max(
                                                PRICE_MIN,
                                                Math.min(
                                                    PRICE_MAX,
                                                    priceRange[1]
                                                )
                                            ),
                                        ]

                                        return (
                                            <Range
                                                values={safeValues}
                                                step={PRICE_STEP}
                                                min={PRICE_MIN}
                                                max={PRICE_MAX}
                                                onChange={(values) => {
                                                    setPriceRange(values)
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        minPrice:
                                                            values[0].toString(),
                                                        maxPrice:
                                                            values[1].toString(),
                                                    }))
                                                    setHasChanges(true)
                                                }}
                                                renderTrack={({
                                                    props,
                                                    children,
                                                }) => (
                                                    <div
                                                        onMouseDown={
                                                            props.onMouseDown
                                                        }
                                                        onTouchStart={
                                                            props.onTouchStart
                                                        }
                                                        style={{
                                                            ...props.style,
                                                            height: "36px",
                                                            display: "flex",
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <div
                                                            ref={props.ref}
                                                            className="range-track"
                                                            style={{
                                                                height: "8px",
                                                                width: "100%",
                                                                borderRadius:
                                                                    "4px",
                                                                background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${
                                                                    ((priceRange[0] -
                                                                        PRICE_MIN) /
                                                                        (PRICE_MAX -
                                                                            PRICE_MIN)) *
                                                                    100
                                                                }%, #4f46e5 ${
                                                                    ((priceRange[0] -
                                                                        PRICE_MIN) /
                                                                        (PRICE_MAX -
                                                                            PRICE_MIN)) *
                                                                    100
                                                                }%, #4f46e5 ${
                                                                    ((priceRange[1] -
                                                                        PRICE_MIN) /
                                                                        (PRICE_MAX -
                                                                            PRICE_MIN)) *
                                                                    100
                                                                }%, #e5e7eb ${
                                                                    ((priceRange[1] -
                                                                        PRICE_MIN) /
                                                                        (PRICE_MAX -
                                                                            PRICE_MIN)) *
                                                                    100
                                                                }%, #e5e7eb 100%)`,
                                                                alignSelf:
                                                                    "center",
                                                            }}
                                                        >
                                                            {children}
                                                        </div>
                                                    </div>
                                                )}
                                                renderThumb={({
                                                    props,
                                                    isDragged,
                                                }) => (
                                                    <div
                                                        {...props}
                                                        className={`range-thumb ${
                                                            isDragged
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        style={{
                                                            ...props.style,
                                                            height: "24px",
                                                            width: "24px",
                                                            borderRadius: "50%",
                                                            backgroundColor:
                                                                "white",
                                                            border: "2px solid #4f46e5",
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                            alignItems:
                                                                "center",
                                                            boxShadow: isDragged
                                                                ? "0 0 0 5px rgba(79, 70, 229, 0.2)"
                                                                : "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                            cursor: "pointer",
                                                            outline: "none",
                                                        }}
                                                        aria-label={
                                                            props.key === 0
                                                                ? "Minimum price"
                                                                : "Maximum price"
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                width: "6px",
                                                                height: "6px",
                                                                backgroundColor:
                                                                    "#4f46e5",
                                                                borderRadius:
                                                                    "50%",
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            />
                                        )
                                    } catch (error) {
                                        console.error(
                                            "Range component error:",
                                            error
                                        )
                                        return (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                                <div className="text-red-600 text-sm font-medium mb-2">
                                                    Price Range Error
                                                </div>
                                                <div className="text-red-500 text-xs mb-3">
                                                    Please enter values between{" "}
                                                    {getCurrencySymbol()}
                                                    {PRICE_MIN.toLocaleString()}{" "}
                                                    and {getCurrencySymbol()}
                                                    {PRICE_MAX.toLocaleString()}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setPriceRange([
                                                            PRICE_MIN,
                                                            PRICE_MAX,
                                                        ])
                                                        setLocalFilters(
                                                            (prev) => ({
                                                                ...prev,
                                                                minPrice: "",
                                                                maxPrice: "",
                                                            })
                                                        )
                                                        setPriceErrors({
                                                            min: "",
                                                            max: "",
                                                        })
                                                    }}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                                >
                                                    Reset Range
                                                </button>
                                            </div>
                                        )
                                    }
                                })()}
                            </div>

                            {/* Current price range display */}
                            <div className="mt-2 mb-4 text-center">
                                <span className="text-sm font-medium text-secondary-700">
                                    Current range: {getCurrencySymbol()}
                                    {Math.max(
                                        PRICE_MIN,
                                        Math.min(PRICE_MAX, priceRange[0])
                                    ).toLocaleString()}{" "}
                                    - {getCurrencySymbol()}
                                    {Math.max(
                                        PRICE_MIN,
                                        Math.min(PRICE_MAX, priceRange[1])
                                    ).toLocaleString()}
                                </span>
                                <div className="text-xs text-secondary-500 mt-1">
                                    Range: {getCurrencySymbol()}
                                    {PRICE_MIN} - {getCurrencySymbol()}
                                    {PRICE_MAX}
                                </div>
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
                                                const inputValue =
                                                    e.target.value
                                                handleLocalFilterChange(e)

                                                if (inputValue === "") {
                                                    setPriceRange([
                                                        PRICE_MIN,
                                                        priceRange[1],
                                                    ])
                                                    return
                                                }

                                                // Clear previous error
                                                setPriceErrors((prev) => ({
                                                    ...prev,
                                                    min: "",
                                                }))

                                                const validation =
                                                    validateAndConstrainPrice(
                                                        inputValue,
                                                        PRICE_MIN,
                                                        PRICE_MAX
                                                    )

                                                // Set error if validation failed
                                                if (validation.error) {
                                                    setPriceErrors((prev) => ({
                                                        ...prev,
                                                        min: validation.error,
                                                    }))
                                                }
                                                const currentMaxPrice =
                                                    parseInt(
                                                        localFilters.maxPrice
                                                    ) || PRICE_MAX

                                                // Ensure min price is not greater than max price
                                                if (
                                                    validation.value >
                                                    currentMaxPrice
                                                ) {
                                                    const constrainedMax =
                                                        Math.max(
                                                            validation.value,
                                                            currentMaxPrice
                                                        )
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        minPrice:
                                                            validation.value.toString(),
                                                        maxPrice:
                                                            constrainedMax.toString(),
                                                    }))
                                                    setPriceRange([
                                                        validation.value,
                                                        constrainedMax,
                                                    ])
                                                } else {
                                                    setPriceRange([
                                                        validation.value,
                                                        priceRange[1],
                                                    ])
                                                }
                                            }}
                                            min={PRICE_MIN}
                                            max={PRICE_MAX}
                                            onBlur={(e) => {
                                                const value =
                                                    parseInt(e.target.value) ||
                                                    0
                                                if (value > PRICE_MAX) {
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        minPrice:
                                                            PRICE_MAX.toString(),
                                                    }))
                                                    setPriceRange([
                                                        PRICE_MAX,
                                                        Math.max(
                                                            PRICE_MAX,
                                                            priceRange[1]
                                                        ),
                                                    ])
                                                } else if (value < PRICE_MIN) {
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        minPrice:
                                                            PRICE_MIN.toString(),
                                                    }))
                                                    setPriceRange([
                                                        PRICE_MIN,
                                                        priceRange[1],
                                                    ])
                                                }
                                            }}
                                            className={`w-full pl-7 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-200 ${
                                                priceErrors.min
                                                    ? "border-red-300 focus:border-red-400"
                                                    : "border-secondary-300 focus:border-secondary-400"
                                            }`}
                                        />
                                        {priceErrors.min && (
                                            <div className="mt-1 text-xs text-red-600">
                                                {priceErrors.min}
                                            </div>
                                        )}
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
                                                const inputValue =
                                                    e.target.value
                                                handleLocalFilterChange(e)

                                                if (inputValue === "") {
                                                    setPriceRange([
                                                        priceRange[0],
                                                        PRICE_MAX,
                                                    ])
                                                    return
                                                }

                                                // Clear previous error
                                                setPriceErrors((prev) => ({
                                                    ...prev,
                                                    max: "",
                                                }))

                                                const validation =
                                                    validateAndConstrainPrice(
                                                        inputValue,
                                                        PRICE_MIN,
                                                        PRICE_MAX
                                                    )

                                                // Set error if validation failed
                                                if (validation.error) {
                                                    setPriceErrors((prev) => ({
                                                        ...prev,
                                                        max: validation.error,
                                                    }))
                                                }
                                                const currentMinPrice =
                                                    parseInt(
                                                        localFilters.minPrice
                                                    ) || PRICE_MIN

                                                // Ensure max price is not less than min price
                                                if (
                                                    validation.value <
                                                    currentMinPrice
                                                ) {
                                                    const constrainedMin =
                                                        Math.min(
                                                            validation.value,
                                                            currentMinPrice
                                                        )
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        minPrice:
                                                            constrainedMin.toString(),
                                                        maxPrice:
                                                            validation.value.toString(),
                                                    }))
                                                    setPriceRange([
                                                        constrainedMin,
                                                        validation.value,
                                                    ])
                                                } else {
                                                    setPriceRange([
                                                        priceRange[0],
                                                        validation.value,
                                                    ])
                                                }
                                            }}
                                            min={
                                                localFilters.minPrice ||
                                                PRICE_MIN
                                            }
                                            max={PRICE_MAX}
                                            onBlur={(e) => {
                                                const value =
                                                    parseInt(e.target.value) ||
                                                    PRICE_MAX
                                                if (value > PRICE_MAX) {
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        maxPrice:
                                                            PRICE_MAX.toString(),
                                                    }))
                                                    setPriceRange([
                                                        priceRange[0],
                                                        PRICE_MAX,
                                                    ])
                                                } else if (value < PRICE_MIN) {
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        maxPrice:
                                                            PRICE_MIN.toString(),
                                                    }))
                                                    setPriceRange([
                                                        Math.min(
                                                            PRICE_MIN,
                                                            priceRange[0]
                                                        ),
                                                        PRICE_MIN,
                                                    ])
                                                }
                                            }}
                                            className={`w-full pl-7 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-200 ${
                                                priceErrors.max
                                                    ? "border-red-300 focus:border-red-400"
                                                    : "border-secondary-300 focus:border-secondary-400"
                                            }`}
                                        />
                                        {priceErrors.max && (
                                            <div className="mt-1 text-xs text-red-600">
                                                {priceErrors.max}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between text-sm text-secondary-500">
                                <span>
                                    {getCurrencySymbol()}
                                    {PRICE_MIN}
                                </span>
                                <span>
                                    {getCurrencySymbol()}
                                    {PRICE_MAX * 0.25}
                                </span>
                                <span>
                                    {getCurrencySymbol()}
                                    {PRICE_MAX * 0.5}
                                </span>
                                <span>
                                    {getCurrencySymbol()}
                                    {PRICE_MAX * 0.75}
                                </span>
                                <span>
                                    {getCurrencySymbol()}
                                    {PRICE_MAX}+
                                </span>
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
                                                ? "bg-secondary-50 border-secondary-300 text-secondary-700 font-medium"
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
                                        setPriceRange([PRICE_MIN, PRICE_MAX])
                                        setPriceErrors({ min: "", max: "" })
                                        setHasChanges(true)
                                    }}
                                    className={`px-3 py-1.5 text-sm rounded-full border ${
                                        !localFilters.minPrice &&
                                        !localFilters.maxPrice
                                            ? "bg-secondary-50 border-secondary-300 text-secondary-700 font-medium"
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
                                            className="w-full rounded-lg border-secondary-200 focus:border-secondary-400 focus:ring focus:ring-secondary-200 focus:ring-opacity-50"
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
                                            className="w-full rounded-lg border-secondary-200 focus:border-secondary-400 focus:ring focus:ring-secondary-200 focus:ring-opacity-50"
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
                                            className="w-full rounded-lg border-secondary-200 focus:border-secondary-400 focus:ring focus:ring-secondary-200 focus:ring-opacity-50"
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
                                                <FaMapMarkerAlt className="text-secondary-500" />
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
                                                className="input-field pl-10 rounded-lg border-secondary-200 focus:border-secondary-400 focus:ring focus:ring-secondary-200 focus:ring-opacity-50"
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
                                                <FaMapMarkerAlt className="text-secondary-500" />
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
                                                className="input-field pl-10 rounded-lg border-secondary-200 focus:border-secondary-400 focus:ring focus:ring-secondary-200 focus:ring-opacity-50"
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
                                                        ? "bg-secondary-50 text-secondary-700 border border-secondary-300 shadow-sm"
                                                        : "bg-white text-secondary-700 border border-secondary-200 hover:bg-secondary-50 hover:border-secondary-200"
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
                <div className="h-10"></div>

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
