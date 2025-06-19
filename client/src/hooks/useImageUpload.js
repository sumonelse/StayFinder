import { useState } from "react"
import { uploadService } from "../services/api"

/**
 * Custom hook for handling image uploads
 * @param {Object} options - Configuration options
 * @returns {Object} - Upload state and functions
 */
const useImageUpload = (options = {}) => {
    const { multiple = false, maxFiles = 10, isProperty = false } = options

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [uploadedImages, setUploadedImages] = useState([])
    const [previewImages, setPreviewImages] = useState([])

    /**
     * Handle file selection
     * @param {File|Array<File>} files - Selected file(s)
     */
    const handleFileSelect = (files) => {
        setError(null)

        if (multiple) {
            // For multiple files
            if (previewImages.length + files.length > maxFiles) {
                setError(`You can only upload up to ${maxFiles} images.`)
                return
            }

            // Check if any files are initial images (already uploaded)
            const initialFiles = files.filter((file) => file.isInitial)
            const newFiles = files.filter((file) => !file.isInitial)

            // Add initial files to both preview and uploaded arrays
            if (initialFiles.length > 0) {
                const initialUrls = initialFiles.map((file) => file.url)
                setPreviewImages((prev) => [...prev, ...initialUrls])
                setUploadedImages((prev) => [
                    ...prev,
                    ...initialUrls.map((url) => ({ url, publicId: "" })),
                ])
            }

            // Add new files to preview only
            if (newFiles.length > 0) {
                setPreviewImages((prev) => [...prev, ...newFiles])
            }
        } else {
            // For single file
            const file = Array.isArray(files) ? files[0] : files

            // Check if it's an initial image (already uploaded)
            if (file.isInitial) {
                setPreviewImages([file.url])
                setUploadedImages([{ url: file.url, publicId: "" }])
            } else {
                setPreviewImages([file])
            }
        }
    }

    /**
     * Remove a preview image
     * @param {number} index - Index of the image to remove
     */
    const removeImage = (index) => {
        setPreviewImages((prev) => prev.filter((_, i) => i !== index))

        // If the image was already uploaded, remove it from uploaded images as well
        if (index < uploadedImages.length) {
            setUploadedImages((prev) => prev.filter((_, i) => i !== index))
        }
    }

    /**
     * Upload images to the server
     * @returns {Promise<Array<Object>>} - Uploaded image data
     */
    const uploadImages = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Filter out already uploaded images
            const filesToUpload = previewImages.filter(
                (file) => typeof file !== "string"
            )

            if (filesToUpload.length === 0) {
                return uploadedImages
            }

            let result

            if (multiple) {
                // Upload multiple images
                if (isProperty) {
                    result = await uploadService.uploadPropertyImages(
                        filesToUpload
                    )
                } else {
                    result = await uploadService.uploadMultipleImages(
                        filesToUpload
                    )
                }

                // The server returns the data in the 'data' property
                const uploadData = result.data || []
                setUploadedImages((prev) => [...prev, ...uploadData])
            } else {
                // Upload single image
                if (isProperty) {
                    result = await uploadService.uploadPropertyImage(
                        filesToUpload[0]
                    )
                } else {
                    result = await uploadService.uploadSingleImage(
                        filesToUpload[0]
                    )
                }

                // For single image upload, the result is an object, not an array
                const uploadData = result.data || {}
                setUploadedImages([uploadData])
            }

            // Replace file objects with URLs in preview
            const uploadedData = multiple
                ? result.data || []
                : result.data || {}
            const uploadedUrls = multiple
                ? uploadedData.map((img) => img.url)
                : uploadedData.url
                ? [uploadedData.url]
                : []
            setPreviewImages((prev) =>
                prev.map((item) =>
                    typeof item === "string"
                        ? item
                        : uploadedUrls.shift() || item
                )
            )

            // Return the appropriate data format based on whether it's a single or multiple upload
            const returnData = multiple ? uploadedData : [uploadedData]

            // Log the data being returned for debugging
            console.log("Upload complete, returning data:", returnData)

            return returnData
        } catch (err) {
            setError(err.message || "Failed to upload images")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Reset the upload state
     */
    const resetUpload = () => {
        setPreviewImages([])
        setUploadedImages([])
        setError(null)
    }

    return {
        isLoading,
        error,
        previewImages,
        uploadedImages,
        handleFileSelect,
        removeImage,
        uploadImages,
        resetUpload,
    }
}

export default useImageUpload
