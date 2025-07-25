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

            // Ensure files is always an array
            const fileArray = Array.isArray(files) ? files : [files]

            if (multiple) {
                // For multiple files
                if (previewImages.length + fileArray.length > maxFiles) {
                    setError(`You can only upload up to ${maxFiles} images.`)
                    return
                }

                // Check if any files are initial images (already uploaded)
                const initialFiles = fileArray.filter(
                    (file) => file.isInitial === true
                )
                const newFiles = fileArray.filter((file) => !file.isInitial)

                // Add initial files to both preview and uploaded arrays
                if (initialFiles.length > 0) {
                    // Extract URLs from initial files
                    const initialUrls = initialFiles.map((file) => file.url)

                    // Get existing URLs to avoid duplicates
                    const existingPreviewUrls = previewImages
                        .filter((item) => typeof item === "string")
                        .map((url) => url)

                    // Filter out duplicates
                    const uniqueInitialUrls = initialUrls.filter(
                        (url) => !existingPreviewUrls.includes(url)
                    )

                    if (uniqueInitialUrls.length > 0) {
                        // Create image objects for initial images
                        const initialImageObjects = uniqueInitialUrls.map(
                            (url) => ({
                                url,
                                publicId: "",
                                isInitial: true,
                            })
                        )

                        // Add to preview images
                        setPreviewImages((prev) => [
                            ...prev,
                            ...uniqueInitialUrls,
                        ])

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
                }

                // Add new files to preview only
                if (newFiles.length > 0) {
                    setPreviewImages((prev) => [...prev, ...newFiles])
                }
            } else {
                // For single file mode
                const file = fileArray[0]

                if (!file) return

                // Check if it's an initial image (already uploaded)
                if (file.isInitial) {
                    const initialImage = {
                        url: file.url,
                        publicId: "",
                        isInitial: true,
                    }

                    // For single file mode, we always replace the current selection
                    setPreviewImages([file.url])
                    setUploadedImages([initialImage])
                    setInitialImages([initialImage])
                } else {
                    // For new file, replace everything
                    setPreviewImages([file])
                    // Clear uploaded images since we're replacing with a new one
                    setUploadedImages([])
                    setInitialImages([])
                }
            }
        },
        [
            multiple,
            maxFiles,
            previewImages,
            setPreviewImages,
            setUploadedImages,
            setInitialImages,
            setError,
        ]
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

            if (typeof imageToRemove === "string") {
                // If it's a string URL (already uploaded), remove from uploaded images
                setUploadedImages((prev) =>
                    prev.filter((img) => img.url !== imageToRemove)
                )

                // Also remove from initial images
                setInitialImages((prev) =>
                    prev.filter((img) => img.url !== imageToRemove)
                )
            } else if (
                imageToRemove instanceof File &&
                imageToRemove.isInitial
            ) {
                // If it's a File object with isInitial flag, remove from uploaded and initial images
                const fileUrl = imageToRemove.url
                if (fileUrl) {
                    setUploadedImages((prev) =>
                        prev.filter((img) => img.url !== fileUrl)
                    )
                    setInitialImages((prev) =>
                        prev.filter((img) => img.url !== fileUrl)
                    )
                }
            }
            // For new files that haven't been uploaded yet, we don't need to remove anything from uploadedImages
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

            // If there are no new files to upload, return a standardized format of the current uploaded images
            if (filesToUpload.length === 0) {
                // Ensure all returned images have a consistent format
                const standardizedImages = uploadedImages.map((img) => ({
                    url: img.url,
                    publicId: img.publicId || "",
                    isInitial: true,
                }))
                return standardizedImages
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

                // Get existing URLs to avoid duplicates
                const existingUrls = initialImages.map((img) => img.url)

                // Filter out any newly uploaded images that might be duplicates
                const uniqueNewImages = newlyUploadedData.filter(
                    (img) => !existingUrls.includes(img.url)
                )

                // Set uploaded images to be initial images + new uploads
                // This prevents duplicating images on multiple uploads
                const updatedImages = [...initialImages, ...uniqueNewImages]
                setUploadedImages(updatedImages)

                // After upload, all images should be considered "initial" for future uploads
                setInitialImages(updatedImages)
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

                // Check if this image is already in initialImages
                const isDuplicate = initialImages.some(
                    (img) => img.url === uploadData.url
                )

                if (!isDuplicate) {
                    // Set uploaded images to be initial images + new upload
                    const updatedImages = [...initialImages, uploadData]
                    setUploadedImages(updatedImages)

                    // After upload, all images should be considered "initial" for future uploads
                    setInitialImages(updatedImages)
                }
            }

            // Replace file objects with URLs in preview
            const uploadedUrls = newlyUploadedData
                .map((img) => img.url)
                .filter(Boolean)

            // Create a new array where all File objects are replaced with their URLs
            setPreviewImages((prevPreviewImages) => {
                // First, create a mapping of File objects to their new URLs
                const fileToUrlMap = new Map()
                let urlIndex = 0

                // Map each File object to a URL
                prevPreviewImages.forEach((item) => {
                    if (
                        typeof item !== "string" &&
                        urlIndex < uploadedUrls.length
                    ) {
                        fileToUrlMap.set(item, uploadedUrls[urlIndex++])
                    }
                })

                // Now replace each File with its URL
                return prevPreviewImages.map((item) => {
                    if (typeof item === "string") return item
                    return fileToUrlMap.get(item) || item
                })
            })

            // Return all uploaded images with a consistent format
            const allUploadedImages = [...initialImages, ...newlyUploadedData]

            // Standardize the format of all images
            const standardizedImages = allUploadedImages.map((img) => ({
                url: img.url,
                publicId: img.publicId || "",
                isInitial: img.isInitial || false,
            }))

            // Remove any duplicates based on URL
            const uniqueImages = []
            const urls = new Set()

            standardizedImages.forEach((img) => {
                if (!urls.has(img.url)) {
                    urls.add(img.url)
                    uniqueImages.push(img)
                }
            })

            return uniqueImages
        } catch (err) {
            setError(err.message || "Failed to upload images")
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [
        multiple,
        previewImages,
        initialImages,
        uploadedImages,
        isProperty,
        setPreviewImages,
        setUploadedImages,
        setInitialImages,
        setIsLoading,
        setError,
    ])

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
