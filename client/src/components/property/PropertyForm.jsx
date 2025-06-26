import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import PropTypes from "prop-types"
import PropertyImageUploader from "./PropertyImageUploader"
import LocationPicker from "./LocationPicker"

// Form validation schema
const propertySchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100),
    description: z
        .string()
        .min(20, "Description must be at least 20 characters")
        .max(2000),
    type: z.enum([
        "apartment",
        "house",
        "condo",
        "villa",
        "cabin",
        "cottage",
        "hotel",
        "other",
    ]),
    price: z.number().positive("Price must be positive"),
    pricePeriod: z.enum(["night", "week", "month"]),
    cleaningFee: z
        .number()
        .min(0, "Cleaning fee must be non-negative")
        .optional(),
    serviceFee: z
        .number()
        .min(0, "Service fee must be non-negative")
        .optional(),
    bedrooms: z.number().int().min(0),
    bathrooms: z.number().min(0),
    maxGuests: z.number().int().min(1, "Maximum guests must be at least 1"),
    address: z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State/Province is required"),
        zipCode: z.string().min(1, "Zip/Postal code is required"),
        country: z.string().min(1, "Country is required"),
    }),
    location: z.object({
        coordinates: z.array(z.number()).length(2),
    }),
    amenities: z.array(z.string()),
    rules: z
        .object({
            checkIn: z.string().optional(),
            checkOut: z.string().optional(),
            smoking: z.boolean().optional(),
            pets: z.boolean().optional(),
            parties: z.boolean().optional(),
            events: z.boolean().optional(),
            quietHours: z.string().optional(),
            additionalRules: z
                .array(
                    z.object({
                        title: z.string(),
                        description: z.string(),
                    })
                )
                .optional(),
        })
        .optional(),
})

/**
 * Property form component for creating and editing properties
 */
const PropertyForm = ({
    initialData = null,
    onSubmit,
    isLoading = false,
    authToken,
}) => {
    const [uploadedImages, setUploadedImages] = useState(
        initialData?.images || []
    )

    // Initialize form with default values or initial data
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(propertySchema),
        defaultValues: initialData || {
            title: "",
            description: "",
            type: "apartment",
            price: 0,
            pricePeriod: "night",
            cleaningFee: undefined,
            serviceFee: undefined,
            bedrooms: 1,
            bathrooms: 1,
            maxGuests: 2,
            address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
            },
            location: {
                coordinates: [0, 0], // [longitude, latitude]
            },
            amenities: [],
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
        },
    })

    // Handle form submission
    const handleFormSubmit = (data) => {
        // Add images to the form data
        const formData = {
            ...data,
            images: uploadedImages,
        }

        onSubmit(formData)
    }

    // Handle image upload completion
    const handleImagesUploaded = (newImages) => {
        // Combine existing images with newly uploaded ones
        setUploadedImages((prevImages) => {
            // Extract URLs from both existing and new images
            const existingUrls = prevImages
                ? prevImages.map((img) =>
                      typeof img === "string" ? img : img.url
                  )
                : []
            const newUrls = newImages.map((img) =>
                typeof img === "string" ? img : img.url
            )

            // Combine and remove duplicates
            const allUrls = [...existingUrls, ...newUrls]
            const uniqueUrls = [...new Set(allUrls)]

            console.log("PropertyForm - Existing images:", existingUrls)
            console.log("PropertyForm - New images:", newUrls)
            console.log("PropertyForm - Combined unique images:", uniqueUrls)

            return uniqueUrls
        })
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                    Basic Information
                </h2>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-secondary-700"
                        >
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            {...register("title")}
                            className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-secondary-700"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            {...register("description")}
                            className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Property Type */}
                    <div>
                        <label
                            htmlFor="type"
                            className="block text-sm font-medium text-secondary-700"
                        >
                            Property Type
                        </label>
                        <select
                            id="type"
                            {...register("type")}
                            className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                        >
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="condo">Condo</option>
                            <option value="villa">Villa</option>
                            <option value="cabin">Cabin</option>
                            <option value="cottage">Cottage</option>
                            <option value="hotel">Hotel</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.type && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.type.message}
                            </p>
                        )}
                    </div>

                    {/* Price */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium text-secondary-700"
                            >
                                Price
                            </label>
                            <input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                {...register("price", { valueAsNumber: true })}
                                className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.price.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="pricePeriod"
                                className="block text-sm font-medium text-secondary-700"
                            >
                                Price Period
                            </label>
                            <select
                                id="pricePeriod"
                                {...register("pricePeriod")}
                                className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                            >
                                <option value="night">Per Night</option>
                                <option value="week">Per Week</option>
                                <option value="month">Per Month</option>
                            </select>
                            {errors.pricePeriod && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.pricePeriod.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Additional Fees */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="cleaningFee"
                                className="block text-sm font-medium text-secondary-700"
                            >
                                Cleaning Fee (optional)
                            </label>
                            <input
                                id="cleaningFee"
                                type="number"
                                min="0"
                                step="0.01"
                                {...register("cleaningFee", {
                                    valueAsNumber: true,
                                    setValueAs: (v) =>
                                        v === "" ? undefined : parseFloat(v),
                                })}
                                className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                            />
                            {errors.cleaningFee && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.cleaningFee.message}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-secondary-500">
                                One-time fee charged to guests for cleaning the
                                property
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="serviceFee"
                                className="block text-sm font-medium text-secondary-700"
                            >
                                Service Fee (optional)
                            </label>
                            <input
                                id="serviceFee"
                                type="number"
                                min="0"
                                step="0.01"
                                {...register("serviceFee", {
                                    valueAsNumber: true,
                                    setValueAs: (v) =>
                                        v === "" ? undefined : parseFloat(v),
                                })}
                                className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                            />
                            {errors.serviceFee && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.serviceFee.message}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-secondary-500">
                                Additional fee charged to guests for each
                                booking
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Property Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Property Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Bedrooms */}
                    <div>
                        <label
                            htmlFor="bedrooms"
                            className="block text-sm font-medium text-secondary-700"
                        >
                            Bedrooms
                        </label>
                        <input
                            id="bedrooms"
                            type="number"
                            min="0"
                            {...register("bedrooms", { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                        />
                        {errors.bedrooms && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.bedrooms.message}
                            </p>
                        )}
                    </div>

                    {/* Bathrooms */}
                    <div>
                        <label
                            htmlFor="bathrooms"
                            className="block text-sm font-medium text-secondary-700"
                        >
                            Bathrooms
                        </label>
                        <input
                            id="bathrooms"
                            type="number"
                            min="0"
                            step="0.5"
                            {...register("bathrooms", { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                        />
                        {errors.bathrooms && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.bathrooms.message}
                            </p>
                        )}
                    </div>

                    {/* Max Guests */}
                    <div>
                        <label
                            htmlFor="maxGuests"
                            className="block text-sm font-medium text-secondary-700"
                        >
                            Maximum Guests
                        </label>
                        <input
                            id="maxGuests"
                            type="number"
                            min="1"
                            {...register("maxGuests", { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                        />
                        {errors.maxGuests && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.maxGuests.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Property Location */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    Property Location
                </h2>
                <p className="text-secondary-600 mb-4">
                    Use the map below to pinpoint your property's exact
                    location. You can search for an address or click directly on
                    the map.
                </p>

                <LocationPicker
                    initialLocation={watch("location")}
                    onLocationChange={(location) => {
                        setValue(
                            "location",
                            {
                                type: "Point",
                                coordinates: location.coordinates,
                            },
                            { shouldValidate: true }
                        )
                    }}
                    address={watch("address")}
                />

                {errors.location && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.location.message ||
                            "Please set a valid location"}
                    </p>
                )}
            </div>

            {/* Property Images */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Property Images</h2>
                <PropertyImageUploader
                    onImagesUploaded={handleImagesUploaded}
                    initialImages={initialData?.images || []}
                    token={authToken}
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading
                        ? "Saving..."
                        : initialData
                        ? "Update Property"
                        : "Create Property"}
                </button>
            </div>
        </form>
    )
}

PropertyForm.propTypes = {
    initialData: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    authToken: PropTypes.string.isRequired,
}

export default PropertyForm
