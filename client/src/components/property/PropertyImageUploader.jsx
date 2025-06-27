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

        // Normalize URLs for comparison
        const normalizeUrl = (img) =>
            typeof img === "string" ? img : img.url || ""

        // Extract URLs from initialImages
        const currentUrls = initialImages.map(normalizeUrl).filter(Boolean)

        // Extract URLs from previous initialImages
        const prevUrls = prevInitialImagesRef.current
            .map(normalizeUrl)
            .filter(Boolean)

        // Check if the arrays have the same length and all URLs match
        const hasChanged =
            currentUrls.length !== prevUrls.length ||
            !currentUrls.every((url) => prevUrls.includes(url)) ||
            !prevUrls.every((url) => currentUrls.includes(url))

        if (hasChanged) {
            // Update the ref with current initialImages
            prevInitialImagesRef.current = [...initialImages]

            // Reset the state
            resetUpload()

            // Create mock File objects for each URL
            const mockFiles = currentUrls.map((url) => {
                // Create a mock file object with the URL and isInitial flag
                const mockFile = new File([""], "image.jpg", {
                    type: "image/jpeg",
                })

                // Use defineProperty to ensure these properties are properly set
                Object.defineProperty(mockFile, "isInitial", {
                    value: true,
                    writable: false,
                    enumerable: true,
                })

                Object.defineProperty(mockFile, "url", {
                    value: url,
                    writable: false,
                    enumerable: true,
                })

                return mockFile
            })

            // Add all initial images at once
            handleFileSelect(mockFiles)
        }
    }, [initialImages, handleFileSelect, resetUpload])

    // Handle upload button click
    const handleUpload = async () => {
        try {
            // Upload the images - this returns all uploaded images (both initial and newly uploaded)
            const allUploadedImages = await uploadImages()

            // If we have a propertyId, update the property with the new images
            if (propertyId) {
                try {
                    // Extract URLs from all uploaded images (now in standardized format)
                    const allImageUrls = allUploadedImages
                        .map((img) => img.url)
                        .filter(Boolean)

                    // Remove any duplicate URLs that might have been created
                    const uniqueImageUrls = [...new Set(allImageUrls)]

                    // Update the property with all images
                    await propertyService.updateProperty(propertyId, {
                        images: uniqueImageUrls,
                    })
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
                // Pass all uploaded images to the parent component
                onImagesUploaded(allUploadedImages)
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
