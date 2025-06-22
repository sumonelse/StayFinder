import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
    FaArrowLeft,
    FaHome,
    FaMapMarkerAlt,
    FaRupeeSign,
    FaImage,
    FaList,
    FaCheck,
    FaTimes,
    FaSpinner,
    FaClipboardList,
} from "react-icons/fa"
import { propertyService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import PropertyImageUploader from "../../components/property/PropertyImageUploader"

/**
 * Property form page component
 * Used for both adding and editing properties
 */
const PropertyFormPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const isEditMode = !!id

    console.log("PropertyFormPage rendered, isEditMode:", isEditMode, "id:", id)

    // Form state
    const [propertyData, setPropertyData] = useState({
        title: "",
        description: "",
        type: "apartment",
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
        },
        price: "",
        pricePeriod: "night", // Changed from "nightly" to "night" to match backend expectations
        cleaningFee: "",
        serviceFee: "",
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 1,
        amenities: [],
        images: [],
        isAvailable: true,
        rules: {
            checkIn: "3:00 PM",
            checkOut: "11:00 AM",
            smoking: false,
            pets: false,
            parties: false,
            events: false,
            quietHours: "10:00 PM - 7:00 AM",
            additionalRules: [],
        },
        // Add location field which is required by the backend
        location: {
            type: "Point",
            coordinates: [0, 0], // Default coordinates, should be updated with actual location
        },
    })

    // UI state
    const [errors, setErrors] = useState({})
    const [currentStep, setCurrentStep] = useState(1)
    const [imageFiles, setImageFiles] = useState([])
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)

    // Amenities options
    const amenitiesOptions = [
        { id: "wifi", label: "WiFi" },
        { id: "kitchen", label: "Kitchen" },
        { id: "ac", label: "Air Conditioning" },
        { id: "heating", label: "Heating" },
        { id: "tv", label: "TV" },
        { id: "parking", label: "Free Parking" },
        { id: "pool", label: "Swimming Pool" },
        { id: "gym", label: "Gym" },
        { id: "washer", label: "Washer" },
        { id: "dryer", label: "Dryer" },
        { id: "workspace", label: "Workspace" },
        { id: "pets", label: "Pets Allowed" },
        { id: "breakfast", label: "Breakfast" },
        { id: "fireplace", label: "Fireplace" },
        { id: "balcony", label: "Balcony" },
        { id: "beachfront", label: "Beachfront" },
        { id: "mountainView", label: "Mountain View" },
        { id: "cityView", label: "City View" },
    ]

    // Fetch property data if in edit mode
    const {
        data: propertyDetails,
        isLoading: propertyLoading,
        isError: propertyError,
    } = useQuery({
        queryKey: ["property", id],
        queryFn: () => propertyService.getPropertyById(id),
        enabled: isEditMode,
    })

    // Use useEffect to update form data when property details are loaded
    useEffect(() => {
        if (isEditMode && propertyDetails) {
            console.log("Property data fetched:", propertyDetails)

            // Ensure all required fields are present in the data
            setPropertyData({
                ...propertyData, // Keep default values for any missing fields
                ...propertyDetails, // Override with fetched data

                // Convert numeric values to strings for form inputs
                price: propertyDetails.price?.toString() || "",
                cleaningFee: propertyDetails.cleaningFee?.toString() || "",
                serviceFee: propertyDetails.serviceFee?.toString() || "",

                // Ensure nested objects are properly structured
                address: {
                    ...propertyData.address,
                    ...(propertyDetails.address || {}),
                },

                rules: {
                    ...propertyData.rules,
                    ...(propertyDetails.rules || {}),
                    // Ensure additionalRules is an array
                    additionalRules:
                        propertyDetails.rules?.additionalRules || [],
                },

                // Ensure location is properly structured
                location: propertyDetails.location || propertyData.location,

                // Ensure images is an array
                images: Array.isArray(propertyDetails.images)
                    ? propertyDetails.images
                    : [],
            })
        }
    }, [isEditMode, propertyDetails])

    // Create property mutation
    const createPropertyMutation = useMutation({
        mutationFn: (data) => propertyService.createProperty(data),
        onSuccess: (data) => {
            navigate(`/host/properties/${data._id}`, {
                state: { success: true },
            })
        },
        onError: (error) => {
            setErrors({
                form: error.message || "Failed to create property",
            })
            window.scrollTo(0, 0)
        },
    })

    // Update property mutation
    const updatePropertyMutation = useMutation({
        mutationFn: (data) => {
            console.log("Sending update data:", data)
            return propertyService.updateProperty(id, data)
        },
        onSuccess: (data) => {
            console.log("Update successful:", data)
            navigate(`/host/properties/${id}`, {
                state: { success: true },
            })
        },
        onError: (error) => {
            console.error("Update failed:", error)
            setErrors({
                form: error.message || "Failed to update property",
            })
            window.scrollTo(0, 0)
        },
    })

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target

        if (name.includes(".")) {
            // Handle nested objects (address)
            const [parent, child] = name.split(".")
            setPropertyData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }))
        } else {
            setPropertyData((prev) => ({
                ...prev,
                [name]: value,
            }))
        }

        // Clear related errors
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }))
        }
    }

    // Handle number input changes
    const handleNumberChange = (e) => {
        const { name, value } = e.target
        const numValue = value === "" ? "" : parseInt(value, 10)

        setPropertyData((prev) => ({
            ...prev,
            [name]: numValue,
        }))

        // Clear related errors
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }))
        }
    }

    // Handle price input changes
    const handlePriceChange = (e) => {
        const { name, value } = e.target
        const numValue = value === "" ? "" : parseFloat(value)

        setPropertyData((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Clear related errors
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }))
        }
    }

    // Handle amenities changes
    const handleAmenityChange = (amenityId) => {
        setPropertyData((prev) => {
            const amenities = [...prev.amenities]

            if (amenities.includes(amenityId)) {
                return {
                    ...prev,
                    amenities: amenities.filter((id) => id !== amenityId),
                }
            } else {
                return {
                    ...prev,
                    amenities: [...amenities, amenityId],
                }
            }
        })
    }

    // Handle images uploaded through PropertyImageUploader
    const handleImagesUploaded = (uploadedImages) => {
        setPropertyData((prev) => ({
            ...prev,
            images: uploadedImages,
        }))

        // Clear any image-related errors
        if (errors.images) {
            setErrors((prev) => ({
                ...prev,
                images: undefined,
            }))
        }
    }

    // Handle rule change for boolean values
    const handleRuleChange = (ruleName) => {
        setPropertyData((prev) => ({
            ...prev,
            rules: {
                ...prev.rules,
                [ruleName]: !prev.rules[ruleName],
            },
        }))
    }

    // Handle rule change for text values
    const handleRuleTextChange = (ruleName, value) => {
        setPropertyData((prev) => ({
            ...prev,
            rules: {
                ...prev.rules,
                [ruleName]: value,
            },
        }))

        // Clear related errors
        if (errors[ruleName]) {
            setErrors((prev) => ({
                ...prev,
                [ruleName]: undefined,
            }))
        }
    }

    // Add additional rule
    const handleAddAdditionalRule = () => {
        setPropertyData((prev) => ({
            ...prev,
            rules: {
                ...prev.rules,
                additionalRules: [
                    ...prev.rules.additionalRules,
                    { title: "", description: "" },
                ],
            },
        }))
    }

    // Update additional rule
    const handleUpdateAdditionalRule = (index, field, value) => {
        setPropertyData((prev) => {
            const additionalRules = [...prev.rules.additionalRules]
            additionalRules[index] = {
                ...additionalRules[index],
                [field]: value,
            }

            return {
                ...prev,
                rules: {
                    ...prev.rules,
                    additionalRules,
                },
            }
        })
    }

    // Remove additional rule
    const handleRemoveAdditionalRule = (index) => {
        setPropertyData((prev) => {
            const additionalRules = [...prev.rules.additionalRules]
            additionalRules.splice(index, 1)

            return {
                ...prev,
                rules: {
                    ...prev.rules,
                    additionalRules,
                },
            }
        })
    }

    // Validate form for current step
    const validateCurrentStep = () => {
        const newErrors = {}

        if (currentStep === 1) {
            // Basic information validation
            if (!propertyData.title.trim()) {
                newErrors.title = "Title is required"
            }

            if (!propertyData.description.trim()) {
                newErrors.description = "Description is required"
            } else if (propertyData.description.length < 50) {
                newErrors.description =
                    "Description should be at least 50 characters"
            }

            if (!propertyData.type) {
                newErrors.type = "Property type is required"
            }
        } else if (currentStep === 2) {
            // Location validation
            if (!propertyData.address.street.trim()) {
                newErrors["address.street"] = "Street address is required"
            }

            if (!propertyData.address.city.trim()) {
                newErrors["address.city"] = "City is required"
            }

            if (!propertyData.address.country.trim()) {
                newErrors["address.country"] = "Country is required"
            }
        } else if (currentStep === 3) {
            // Details validation
            if (!propertyData.price) {
                newErrors.price = "Price is required"
            } else if (
                isNaN(parseFloat(propertyData.price)) ||
                parseFloat(propertyData.price) <= 0
            ) {
                newErrors.price = "Price must be a positive number"
            }

            if (
                propertyData.cleaningFee &&
                (isNaN(parseFloat(propertyData.cleaningFee)) ||
                    parseFloat(propertyData.cleaningFee) < 0)
            ) {
                newErrors.cleaningFee =
                    "Cleaning fee must be a non-negative number"
            }

            if (
                propertyData.serviceFee &&
                (isNaN(parseFloat(propertyData.serviceFee)) ||
                    parseFloat(propertyData.serviceFee) < 0)
            ) {
                newErrors.serviceFee =
                    "Service fee must be a non-negative number"
            }

            if (propertyData.bedrooms < 1) {
                newErrors.bedrooms = "At least 1 bedroom is required"
            }

            if (propertyData.bathrooms < 0.5) {
                newErrors.bathrooms = "At least 0.5 bathroom is required"
            }

            if (propertyData.maxGuests < 1) {
                newErrors.maxGuests = "At least 1 guest is required"
            }
        } else if (currentStep === 4) {
            // Images validation
            if (propertyData.images.length === 0) {
                newErrors.images = "At least one image is required"
            }
        } else if (currentStep === 5) {
            // Amenities validation - no specific validation needed
        } else if (currentStep === 6) {
            // Rules validation
            if (!propertyData.rules.checkIn) {
                newErrors.checkIn = "Check-in time is required"
            }
            if (!propertyData.rules.checkOut) {
                newErrors.checkOut = "Check-out time is required"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle next step
    const handleNextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep((prev) => prev + 1)
            window.scrollTo(0, 0)
        }
    }

    // Handle previous step
    const handlePrevStep = () => {
        setCurrentStep((prev) => prev - 1)
        window.scrollTo(0, 0)
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateCurrentStep()) {
            return
        }

        // Log the current property data for debugging
        console.log("Submitting property data:", propertyData)

        // Images are now handled by the PropertyImageUploader component
        // and already stored in propertyData.images

        // Prepare data for submission
        const submissionData = {
            ...propertyData,
            price: parseFloat(propertyData.price || 0),
            // Make sure pricePeriod is one of the allowed values
            pricePeriod: propertyData.pricePeriod || "night",
            // Ensure location is properly formatted
            location: propertyData.location || {
                type: "Point",
                coordinates: [0, 0], // Default coordinates if none provided
            },
            // Make sure images are in the correct format (array of objects with url property)
            images: Array.isArray(propertyData.images)
                ? propertyData.images.map((img) => {
                      // If img is already an object with url property, return it as is
                      if (typeof img === "object" && img.url) {
                          return img
                      }
                      // If img is a string (URL), convert it to the required object format
                      return { url: img, caption: "" }
                  })
                : [],
            // Convert fees to numbers if they exist
            cleaningFee: propertyData.cleaningFee
                ? parseFloat(propertyData.cleaningFee)
                : undefined,
            serviceFee: propertyData.serviceFee
                ? parseFloat(propertyData.serviceFee)
                : undefined,
            // Ensure address is properly formatted
            address: propertyData.address || {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
            },
            // Include rules
            rules: propertyData.rules || {
                checkIn: "3:00 PM",
                checkOut: "11:00 AM",
                smoking: false,
                pets: false,
                parties: false,
                events: false,
                quietHours: "10:00 PM - 7:00 AM",
                additionalRules: [],
            },
            // Include isAvailable field
            isAvailable: propertyData.isAvailable,
        }

        // Submit form
        if (isEditMode) {
            updatePropertyMutation.mutate(submissionData)
        } else {
            createPropertyMutation.mutate(submissionData)
        }
    }

    // Loading state
    if (isEditMode && propertyLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center mb-4">
                    <FaSpinner className="animate-spin text-primary-600 mr-2 text-xl" />
                    <h2 className="text-xl font-semibold">
                        Loading property data...
                    </h2>
                </div>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="h-96 bg-gray-200 rounded mb-6"></div>
                </div>
            </div>
        )
    }

    // Error state
    if (isEditMode && propertyError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex items-center">
                        <FaTimes className="text-red-500 mr-2" />
                        <p className="text-red-700">
                            Error loading property data. Please try again later.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/host/properties")}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        Back to Properties
                    </button>
                </div>
            </div>
        )
    }

    // Error state
    if (isEditMode && propertyError) {
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
            {/* Back button and title */}
            <div className="mb-6">
                <button
                    onClick={() => navigate("/host/properties")}
                    className="flex items-center text-primary-600 hover:text-primary-800 mb-2"
                >
                    <FaArrowLeft className="mr-2" />
                    <span>Back to properties</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-800">
                    {isEditMode ? "Edit Property" : "Add New Property"}
                </h1>
            </div>

            {/* Form error message */}
            {errors.form && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p>{errors.form}</p>
                </div>
            )}

            {/* Progress steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div
                        className={`flex items-center ${
                            currentStep >= 1
                                ? "text-primary-600"
                                : "text-gray-400"
                        }`}
                    >
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                currentStep >= 1
                                    ? "bg-primary-100"
                                    : "bg-gray-100"
                            } mr-2`}
                        >
                            <FaHome />
                        </div>
                        <span className="hidden md:inline">Basic Info</span>
                    </div>
                    <div className="flex-1 h-1 mx-2 bg-gray-200">
                        <div
                            className="h-1 bg-primary-600"
                            style={{
                                width: `${currentStep > 1 ? "100%" : "0%"}`,
                            }}
                        ></div>
                    </div>
                    <div
                        className={`flex items-center ${
                            currentStep >= 2
                                ? "text-primary-600"
                                : "text-gray-400"
                        }`}
                    >
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                currentStep >= 2
                                    ? "bg-primary-100"
                                    : "bg-gray-100"
                            } mr-2`}
                        >
                            <FaMapMarkerAlt />
                        </div>
                        <span className="hidden md:inline">Location</span>
                    </div>
                    <div className="flex-1 h-1 mx-2 bg-gray-200">
                        <div
                            className="h-1 bg-primary-600"
                            style={{
                                width: `${currentStep > 2 ? "100%" : "0%"}`,
                            }}
                        ></div>
                    </div>
                    <div
                        className={`flex items-center ${
                            currentStep >= 3
                                ? "text-primary-600"
                                : "text-gray-400"
                        }`}
                    >
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                currentStep >= 3
                                    ? "bg-primary-100"
                                    : "bg-gray-100"
                            } mr-2`}
                        >
                            <FaRupeeSign />
                        </div>
                        <span className="hidden md:inline">Details</span>
                    </div>
                    <div className="flex-1 h-1 mx-2 bg-gray-200">
                        <div
                            className="h-1 bg-primary-600"
                            style={{
                                width: `${currentStep > 3 ? "100%" : "0%"}`,
                            }}
                        ></div>
                    </div>
                    <div
                        className={`flex items-center ${
                            currentStep >= 4
                                ? "text-primary-600"
                                : "text-gray-400"
                        }`}
                    >
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                currentStep >= 4
                                    ? "bg-primary-100"
                                    : "bg-gray-100"
                            } mr-2`}
                        >
                            <FaImage />
                        </div>
                        <span className="hidden md:inline">Photos</span>
                    </div>
                    <div className="flex-1 h-1 mx-2 bg-gray-200">
                        <div
                            className="h-1 bg-primary-600"
                            style={{
                                width: `${currentStep > 4 ? "100%" : "0%"}`,
                            }}
                        ></div>
                    </div>
                    <div
                        className={`flex items-center ${
                            currentStep >= 5
                                ? "text-primary-600"
                                : "text-gray-400"
                        }`}
                    >
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                currentStep >= 5
                                    ? "bg-primary-100"
                                    : "bg-gray-100"
                            } mr-2`}
                        >
                            <FaList />
                        </div>
                        <span className="hidden md:inline">Amenities</span>
                    </div>
                    <div className="flex-1 h-1 mx-2 bg-gray-200">
                        <div
                            className="h-1 bg-primary-600"
                            style={{
                                width: `${currentStep > 5 ? "100%" : "0%"}`,
                            }}
                        ></div>
                    </div>
                    <div
                        className={`flex items-center ${
                            currentStep >= 6
                                ? "text-primary-600"
                                : "text-gray-400"
                        }`}
                    >
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                currentStep >= 6
                                    ? "bg-primary-100"
                                    : "bg-gray-100"
                            } mr-2`}
                        >
                            <FaClipboardList />
                        </div>
                        <span className="hidden md:inline">House Rules</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Basic Information
                            </h2>

                            <div className="mb-4">
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Property Title*
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={propertyData.title}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${
                                        errors.title
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    placeholder="e.g., Cozy Apartment in Downtown"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Description*
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="6"
                                    value={propertyData.description}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${
                                        errors.description
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    placeholder="Describe your property in detail..."
                                ></textarea>
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Minimum 50 characters. Provide a detailed
                                    description of your property.
                                </p>
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="type"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Property Type*
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={propertyData.type}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${
                                        errors.type
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                >
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                    <option value="cabin">Cabin</option>
                                    <option value="condo">Condo</option>
                                    <option value="studio">Studio</option>
                                    <option value="hotel">Hotel Room</option>
                                </select>
                                {errors.type && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.type}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Location
                            </h2>

                            <div className="mb-4">
                                <label
                                    htmlFor="address.street"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Street Address*
                                </label>
                                <input
                                    type="text"
                                    id="address.street"
                                    name="address.street"
                                    value={propertyData.address.street}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${
                                        errors["address.street"]
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    placeholder="e.g., 123 Main St"
                                />
                                {errors["address.street"] && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors["address.street"]}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label
                                        htmlFor="address.city"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        City*
                                    </label>
                                    <input
                                        type="text"
                                        id="address.city"
                                        name="address.city"
                                        value={propertyData.address.city}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${
                                            errors["address.city"]
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                        placeholder="e.g., New York"
                                    />
                                    {errors["address.city"] && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors["address.city"]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="address.state"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        State/Province
                                    </label>
                                    <input
                                        type="text"
                                        id="address.state"
                                        name="address.state"
                                        value={propertyData.address.state}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g., NY"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label
                                        htmlFor="address.zipCode"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Zip/Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        id="address.zipCode"
                                        name="address.zipCode"
                                        value={propertyData.address.zipCode}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g., 10001"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="address.country"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Country*
                                    </label>
                                    <input
                                        type="text"
                                        id="address.country"
                                        name="address.country"
                                        value={propertyData.address.country}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${
                                            errors["address.country"]
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                        placeholder="e.g., United States"
                                    />
                                    {errors["address.country"] && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors["address.country"]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {currentStep === 3 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Property Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label
                                        htmlFor="price"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Price*
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaRupeeSign className="text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            min="0"
                                            step="0.01"
                                            value={propertyData.price}
                                            onChange={handlePriceChange}
                                            className={`w-full pl-8 pr-3 py-2 border ${
                                                errors.price
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                            placeholder="e.g., 100"
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="pricePeriod"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Price Period
                                    </label>
                                    <select
                                        id="pricePeriod"
                                        name="pricePeriod"
                                        value={propertyData.pricePeriod}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="nightly">
                                            Per Night
                                        </option>
                                        <option value="weekly">Per Week</option>
                                        <option value="monthly">
                                            Per Month
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label
                                        htmlFor="cleaningFee"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Cleaning Fee
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaRupeeSign className="text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            id="cleaningFee"
                                            name="cleaningFee"
                                            min="0"
                                            step="0.01"
                                            value={propertyData.cleaningFee}
                                            onChange={handlePriceChange}
                                            className={`w-full pl-8 pr-3 py-2 border ${
                                                errors.cleaningFee
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                            placeholder="e.g., 50"
                                        />
                                    </div>
                                    {errors.cleaningFee && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.cleaningFee}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="serviceFee"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Service Fee
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaRupeeSign className="text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            id="serviceFee"
                                            name="serviceFee"
                                            min="0"
                                            step="0.01"
                                            value={propertyData.serviceFee}
                                            onChange={handlePriceChange}
                                            className={`w-full pl-8 pr-3 py-2 border ${
                                                errors.serviceFee
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                            placeholder="e.g., 30"
                                        />
                                    </div>
                                    {errors.serviceFee && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.serviceFee}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label
                                        htmlFor="bedrooms"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Bedrooms*
                                    </label>
                                    <input
                                        type="number"
                                        id="bedrooms"
                                        name="bedrooms"
                                        min="0"
                                        value={propertyData.bedrooms}
                                        onChange={handleNumberChange}
                                        className={`w-full px-3 py-2 border ${
                                            errors.bedrooms
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    />
                                    {errors.bedrooms && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.bedrooms}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="bathrooms"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Bathrooms*
                                    </label>
                                    <input
                                        type="number"
                                        id="bathrooms"
                                        name="bathrooms"
                                        min="0"
                                        step="0.5"
                                        value={propertyData.bathrooms}
                                        onChange={handleNumberChange}
                                        className={`w-full px-3 py-2 border ${
                                            errors.bathrooms
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    />
                                    {errors.bathrooms && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.bathrooms}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="maxGuests"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Max Guests*
                                    </label>
                                    <input
                                        type="number"
                                        id="maxGuests"
                                        name="maxGuests"
                                        min="1"
                                        value={propertyData.maxGuests}
                                        onChange={handleNumberChange}
                                        className={`w-full px-3 py-2 border ${
                                            errors.maxGuests
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    />
                                    {errors.maxGuests && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.maxGuests}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isAvailable"
                                        name="isAvailable"
                                        checked={propertyData.isAvailable}
                                        onChange={(e) =>
                                            setPropertyData((prev) => ({
                                                ...prev,
                                                isAvailable: e.target.checked,
                                            }))
                                        }
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="isAvailable"
                                        className="ml-2 block text-sm text-gray-700"
                                    >
                                        Property is available for booking
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Photos */}
                    {currentStep === 4 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Property Photos
                            </h2>

                            {errors.images && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    <p>{errors.images}</p>
                                </div>
                            )}

                            {/* Using PropertyImageUploader component */}
                            <PropertyImageUploader
                                onImagesUploaded={handleImagesUploaded}
                                initialImages={propertyData.images}
                                token={user?.token}
                                className="mb-6"
                            />

                            {propertyData.images.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium mb-3">
                                        Current Images
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {propertyData.images.map(
                                            (image, index) => (
                                                <div
                                                    key={index}
                                                    className="relative group"
                                                >
                                                    <img
                                                        src={
                                                            typeof image ===
                                                            "object"
                                                                ? image.url
                                                                : image
                                                        }
                                                        alt={`Property ${
                                                            index + 1
                                                        }`}
                                                        className="w-full h-32 object-cover rounded-md"
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Amenities */}
                    {currentStep === 5 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Amenities
                            </h2>

                            <p className="text-gray-600 mb-4">
                                Select the amenities that your property offers
                                to guests.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                                {amenitiesOptions.map((amenity) => (
                                    <div
                                        key={amenity.id}
                                        className="flex items-center"
                                    >
                                        <input
                                            type="checkbox"
                                            id={`amenity-${amenity.id}`}
                                            checked={propertyData.amenities.includes(
                                                amenity.id
                                            )}
                                            onChange={() =>
                                                handleAmenityChange(amenity.id)
                                            }
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor={`amenity-${amenity.id}`}
                                            className="ml-2 block text-sm text-gray-700"
                                        >
                                            {amenity.label}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                >
                                    Next: House Rules
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 6: House Rules */}
                    {currentStep === 6 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                House Rules
                            </h2>

                            <p className="text-gray-600 mb-4">
                                Set the rules for your property to help guests
                                understand what is allowed.
                            </p>

                            <div className="space-y-6">
                                {/* Check-in and Check-out times */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Check-in time
                                        </label>
                                        <input
                                            type="text"
                                            value={propertyData.rules.checkIn}
                                            onChange={(e) =>
                                                handleRuleTextChange(
                                                    "checkIn",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g. 3:00 PM - 8:00 PM"
                                            className={`w-full px-3 py-2 border ${
                                                errors.checkIn
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                        />
                                        {errors.checkIn && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.checkIn}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Check-out time
                                        </label>
                                        <input
                                            type="text"
                                            value={propertyData.rules.checkOut}
                                            onChange={(e) =>
                                                handleRuleTextChange(
                                                    "checkOut",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g. 11:00 AM"
                                            className={`w-full px-3 py-2 border ${
                                                errors.checkOut
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                        />
                                        {errors.checkOut && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.checkOut}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Quiet hours */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quiet hours
                                    </label>
                                    <input
                                        type="text"
                                        value={propertyData.rules.quietHours}
                                        onChange={(e) =>
                                            handleRuleTextChange(
                                                "quietHours",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. 10:00 PM - 7:00 AM"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {/* Boolean rules */}
                                <div className="space-y-3">
                                    <h3 className="text-md font-medium text-gray-800">
                                        What's allowed?
                                    </h3>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="smoking"
                                            checked={propertyData.rules.smoking}
                                            onChange={() =>
                                                handleRuleChange("smoking")
                                            }
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor="smoking"
                                            className="ml-2 block text-sm text-gray-700"
                                        >
                                            Smoking allowed
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="pets"
                                            checked={propertyData.rules.pets}
                                            onChange={() =>
                                                handleRuleChange("pets")
                                            }
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor="pets"
                                            className="ml-2 block text-sm text-gray-700"
                                        >
                                            Pets allowed
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="parties"
                                            checked={propertyData.rules.parties}
                                            onChange={() =>
                                                handleRuleChange("parties")
                                            }
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor="parties"
                                            className="ml-2 block text-sm text-gray-700"
                                        >
                                            Parties allowed
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="events"
                                            checked={propertyData.rules.events}
                                            onChange={() =>
                                                handleRuleChange("events")
                                            }
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor="events"
                                            className="ml-2 block text-sm text-gray-700"
                                        >
                                            Events allowed
                                        </label>
                                    </div>
                                </div>

                                {/* Additional rules */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-md font-medium text-gray-800">
                                            Additional rules
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleAddAdditionalRule}
                                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                        >
                                            + Add rule
                                        </button>
                                    </div>

                                    {propertyData.rules.additionalRules
                                        .length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">
                                            No additional rules added yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {propertyData.rules.additionalRules.map(
                                                (rule, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-gray-200 rounded-md p-3"
                                                    >
                                                        <div className="flex justify-between mb-2">
                                                            <input
                                                                type="text"
                                                                value={
                                                                    rule.title
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateAdditionalRule(
                                                                        index,
                                                                        "title",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Rule title"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mr-2"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveAdditionalRule(
                                                                        index
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            value={
                                                                rule.description
                                                            }
                                                            onChange={(e) =>
                                                                handleUpdateAdditionalRule(
                                                                    index,
                                                                    "description",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Rule description"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                            rows={2}
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <p className="text-gray-600 mb-4">
                                    Review your property details before
                                    submitting. You can go back to previous
                                    steps to make changes.
                                </p>

                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            createPropertyMutation.isLoading ||
                                            updatePropertyMutation.isLoading ||
                                            isUploading
                                        }
                                        className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-300 flex items-center"
                                    >
                                        {createPropertyMutation.isLoading ||
                                        updatePropertyMutation.isLoading ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2" />
                                                {isEditMode
                                                    ? "Updating..."
                                                    : "Creating..."}
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck className="mr-2" />
                                                {isEditMode
                                                    ? "Update Property"
                                                    : "Create Property"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons (except for last step) */}
                    {currentStep < 6 && (
                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                onClick={handlePrevStep}
                                disabled={currentStep === 1}
                                className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${
                                    currentStep === 1 ? "invisible" : ""
                                }`}
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default PropertyFormPage
