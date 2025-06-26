import React, { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import ImageUploader from "../common/ImageUploader"
import useImageUpload from "../../hooks/useImageUpload"
import { propertyService } from "../../services/api"

/**
 * Component for handling property image uploads
 */
const PropertyImageUploader = ({
    onImagesUploaded,
    initialImages = [],
    className = "",
    propertyId = null, // Add propertyId prop to update existing property
}) => {
    const {
        isLoading,
        error,
        previewImages,
        uploadedImages,
        handleFileSelect,
        removeImage,
        uploadImages,
        resetUpload,
    } = useImageUpload({
        multiple: true,
        maxFiles: 10,
        isProperty: true,
    })

    // Track the previous initialImages for comparison
    const prevInitialImagesRef = useRef([])

    // Set initial images if provided
    useEffect(() => {
        // Skip if initialImages is empty
        if (!initialImages || initialImages.length === 0) {
            return
        }

        // Check if initialImages have changed
        const prevUrls = prevInitialImagesRef.current.map(
            (img) => img.url || img
        )
        const currentUrls = initialImages.map((img) => img.url || img)

        // Only process if the URLs have changed
        const hasChanged =
            prevUrls.length !== currentUrls.length ||
            !prevUrls.every((url) => currentUrls.includes(url))

        if (hasChanged) {
            console.log(
                "PropertyImageUploader - Initial images changed, resetting state"
            )

            // Update the ref with current initialImages
            prevInitialImagesRef.current = [...initialImages]

            // Reset the state
            resetUpload()

            console.log(
                "PropertyImageUploader - Setting initial images:",
                initialImages
            )

            // Extract URLs from initialImages
            const imageUrls = initialImages.map((img) => img.url || img)
            console.log(
                "PropertyImageUploader - Extracted image URLs:",
                imageUrls
            )

            // Create mock File objects for each URL
            const mockFiles = imageUrls.map((url) => {
                const mockFile = new File([""], "image.jpg", {
                    type: "image/jpeg",
                })
                Object.defineProperty(mockFile, "isInitial", { value: true })
                Object.defineProperty(mockFile, "url", { value: url })
                return mockFile
            })

            // Add all initial images at once
            handleFileSelect(mockFiles)
        }
    }, [initialImages, handleFileSelect, resetUpload])

    // Handle upload button click
    const handleUpload = async () => {
        try {
            console.log("Before upload - uploadedImages:", uploadedImages)
            console.log("Before upload - previewImages:", previewImages)
            const result = await uploadImages()
            console.log("After upload - result:", result)

            console.log("After upload - uploadedImages:", uploadedImages)

            // If we have a propertyId, update the property with the new images
            if (propertyId) {
                try {
                    // Get all image URLs from the uploadedImages state
                    // This includes both initial images and newly uploaded ones
                    const allImageUrls = uploadedImages
                        .map((img) => {
                            if (typeof img === "string") return img
                            return img.url || ""
                        })
                        .filter((url) => url)

                    // Remove any duplicate URLs that might have been created
                    const uniqueImageUrls = [...new Set(allImageUrls)]

                    console.log(
                        "PropertyImageUploader - All image URLs:",
                        allImageUrls
                    )
                    console.log(
                        "PropertyImageUploader - Unique image URLs:",
                        uniqueImageUrls
                    )

                    // Update the property with all images
                    await propertyService.updateProperty(propertyId, {
                        images: uniqueImageUrls,
                    })

                    console.log(
                        "Property images updated in backend successfully"
                    )
                } catch (updateError) {
                    console.error(
                        "Failed to update property images in backend:",
                        updateError
                    )
                    // Continue anyway since the images were uploaded to Cloudinary
                }
            }

            // Notify parent component about uploaded images
            if (onImagesUploaded) {
                // result contains only newly uploaded images
                onImagesUploaded(result)

                // Log the result for debugging
                console.log("Property images upload successful:", result)
            }
        } catch (err) {
            console.error("Upload failed:", err)
        }
    }

    return (
        <div className={className}>
            <h3 className="text-lg font-medium mb-2">Property Images</h3>
            <p className="text-sm text-secondary-600 mb-4">
                Upload high-quality images of your property. You can upload up
                to 10 images.
            </p>

            <ImageUploader
                multiple={true}
                onChange={handleFileSelect}
                maxFiles={10}
                maxSize={5}
                previewImages={previewImages}
                onRemoveImage={removeImage}
            />

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="mt-4">
                <button
                    type="button"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                    onClick={handleUpload}
                    disabled={isLoading || previewImages.length === 0}
                >
                    {isLoading ? "Uploading..." : "Upload Images"}
                </button>

                {uploadedImages.length > 0 && (
                    <p className="text-green-600 text-sm mt-2">
                        {/* Show the number of images that have been uploaded */}
                        {previewImages.length}{" "}
                        {previewImages.length === 1 ? "image" : "images"} ready
                        to use!
                    </p>
                )}
            </div>
        </div>
    )
}

PropertyImageUploader.propTypes = {
    onImagesUploaded: PropTypes.func,
    initialImages: PropTypes.array,
    className: PropTypes.string,
    propertyId: PropTypes.string, // Add propertyId prop type
}

export default PropertyImageUploader
