import { useEffect } from "react"
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
    } = useImageUpload({
        multiple: true,
        maxFiles: 10,
        isProperty: true,
    })

    // Set initial images if provided
    useEffect(() => {
        if (initialImages && initialImages.length > 0) {
            // If we have initial images, we consider them already uploaded
            // We need to modify the hook's internal state, but we can't directly
            // Instead, we'll use the handleFileSelect function with string URLs
            const imageUrls = initialImages.map((img) => img.url || img)

            // This is a workaround to set initial images in the hook
            // In a real app, you might want to add a setInitialImages function to the hook
            imageUrls.forEach((url) => {
                // Create a mock File object that the hook will recognize as already uploaded
                const mockFile = new File([""], "image.jpg", {
                    type: "image/jpeg",
                })
                Object.defineProperty(mockFile, "isInitial", { value: true })
                Object.defineProperty(mockFile, "url", { value: url })
                handleFileSelect([mockFile])
            })
        }
    }, [initialImages, handleFileSelect])

    // Handle upload button click
    const handleUpload = async () => {
        try {
            const result = await uploadImages()

            // If we have a propertyId, update the property with the new images
            if (propertyId) {
                try {
                    // Get the image URLs from the result
                    // Handle different possible formats of the result
                    const imageUrls = result
                        .map((img) => {
                            if (typeof img === "string") return img
                            return img.url || ""
                        })
                        .filter((url) => url)

                    // Update the property with the new images
                    await propertyService.updateProperty(propertyId, {
                        images: imageUrls,
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
                // Make sure we're passing the correct data
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
            <p className="text-sm text-gray-600 mb-4">
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
                        {uploadedImages.length}{" "}
                        {uploadedImages.length === 1 ? "image" : "images"}{" "}
                        uploaded successfully!
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
