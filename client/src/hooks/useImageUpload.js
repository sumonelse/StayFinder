import { useState, useCallback } from "react"
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

    // Track which images are initial (already uploaded)
    const [initialImages, setInitialImages] = useState([])

    /**
     * Handle file selection
     * @param {File|Array<File>} files - Selected file(s)
     */
    const handleFileSelect = useCallback(
        (files) => {
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

                    // Add to preview images
                    setPreviewImages((prev) => [...prev, ...initialUrls])

                    // Create image objects for initial images
                    const initialImageObjects = initialUrls.map((url) => ({
                        url,
                        publicId: "",
                        isInitial: true,
                    }))

                    // Add to uploaded images
                    setUploadedImages((prev) => [
                        ...prev,
                        ...initialImageObjects,
                    ])

                    // Track these as initial images
                    setInitialImages((prev) => [
                        ...prev,
                        ...initialImageObjects,
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
                    const initialImage = {
                        url: file.url,
                        publicId: "",
                        isInitial: true,
                    }
                    setPreviewImages([file.url])
                    setUploadedImages([initialImage])
                    setInitialImages([initialImage])
                } else {
                    setPreviewImages([file])
                    // Clear uploaded images since we're replacing with a new one
                    setUploadedImages([])
                    setInitialImages([])
                }
            }
        },
        [multiple, maxFiles, previewImages]
    )

    /**
     * Remove a preview image
     * @param {number} index - Index of the image to remove
     */
    const removeImage = useCallback(
        (index) => {
            // Get the image being removed
            const imageToRemove = previewImages[index]

            // Remove from preview images
            setPreviewImages((prev) => prev.filter((_, i) => i !== index))

            // If it's a string URL (already uploaded), also remove from uploaded images
            if (typeof imageToRemove === "string") {
                setUploadedImages((prev) =>
                    prev.filter((img) => img.url !== imageToRemove)
                )

                // Also remove from initial images if it was an initial image
                setInitialImages((prev) =>
                    prev.filter((img) => img.url !== imageToRemove)
                )
            }
        },
        [previewImages]
    )

    /**
     * Upload images to the server
     * @returns {Promise<Array<Object>>} - Uploaded image data
     */
    const uploadImages = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Filter out already uploaded images (string URLs)
            const filesToUpload = previewImages.filter(
                (file) => typeof file !== "string"
            )

            // If there are no new files to upload, return empty array
            if (filesToUpload.length === 0) {
                console.log("No new files to upload, returning empty array")
                return []
            }

            let result
            let newlyUploadedData = []

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
                newlyUploadedData = result.data || []

                // Set uploaded images to be initial images + new uploads
                // This prevents duplicating images on multiple uploads
                setUploadedImages([...initialImages, ...newlyUploadedData])
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
                newlyUploadedData = [uploadData]

                // Set uploaded images to be initial images + new upload
                setUploadedImages([...initialImages, uploadData])
            }

            // Replace file objects with URLs in preview
            const uploadedUrls = newlyUploadedData
                .map((img) => img.url)
                .filter(Boolean)

            setPreviewImages((prev) =>
                prev.map((item) => {
                    if (typeof item === "string") return item
                    // Replace File objects with URLs
                    const url = uploadedUrls.shift()
                    return url || item
                })
            )

            // Return only the newly uploaded data
            console.log(
                "Upload complete, returning newly uploaded data:",
                newlyUploadedData
            )

            return newlyUploadedData
        } catch (err) {
            setError(err.message || "Failed to upload images")
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [multiple, previewImages, initialImages, isProperty])

    /**
     * Reset the upload state
     */
    const resetUpload = useCallback(() => {
        setPreviewImages([])
        setUploadedImages([])
        setInitialImages([])
        setError(null)
    }, [])

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
