import { useState, useRef, useEffect } from "react"
import PropTypes from "prop-types"
import { FiUpload, FiX } from "react-icons/fi"

/**
 * Reusable component for image uploads
 */
const ImageUploader = ({
    multiple = false,
    onChange,
    maxFiles = 10,
    maxSize = 5, // in MB
    className = "",
    previewImages = [],
    onRemoveImage,
}) => {
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState("")
    const [objectUrls, setObjectUrls] = useState({})
    const inputRef = useRef(null)

    // Handle file selection
    const handleFiles = (files) => {
        setError("")

        // Convert FileList to Array
        const fileArray = Array.from(files)

        // Check number of files
        if (multiple && fileArray.length > maxFiles) {
            setError(`You can only upload up to ${maxFiles} files at once.`)
            return
        }

        // Check file sizes
        const oversizedFiles = fileArray.filter(
            (file) => file.size > maxSize * 1024 * 1024
        )
        if (oversizedFiles.length > 0) {
            setError(`Some files exceed the ${maxSize}MB limit.`)
            return
        }

        // Check file types
        const invalidFiles = fileArray.filter(
            (file) => !file.type.startsWith("image/")
        )
        if (invalidFiles.length > 0) {
            setError("Only image files are allowed.")
            return
        }

        // Pass valid files to parent component
        onChange(multiple ? fileArray : fileArray[0])
    }

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    // Handle drop event
    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }

    // Handle click to open file dialog
    const handleClick = () => {
        inputRef.current.click()
    }

    // Handle file input change
    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
        }
    }

    // Create and manage object URLs for File objects
    useEffect(() => {
        const newObjectUrls = {}

        // Create object URLs for File objects
        previewImages.forEach((image, index) => {
            if (typeof image !== "string" && image instanceof File) {
                // Check if we already have an object URL for this file
                if (!objectUrls[index]) {
                    newObjectUrls[index] = URL.createObjectURL(image)
                } else {
                    // Keep the existing object URL
                    newObjectUrls[index] = objectUrls[index]
                }
            }
        })

        // Revoke any object URLs that are no longer needed
        Object.entries(objectUrls).forEach(([index, url]) => {
            if (!newObjectUrls[index]) {
                URL.revokeObjectURL(url)
            }
        })

        // Update state with new object URLs
        setObjectUrls(newObjectUrls)

        // Clean up all object URLs when component unmounts
        return () => {
            Object.values(newObjectUrls).forEach((url) =>
                URL.revokeObjectURL(url)
            )
        }
    }, [previewImages, objectUrls])

    return (
        <div className={`w-full ${className}`}>
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    dragActive
                        ? "border-secondary-500 bg-secondary-50"
                        : "border-secondary-300 hover:border-secondary-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    className="hidden"
                    onChange={handleChange}
                />

                <FiUpload className="w-10 h-10 text-secondary-400 mb-2" />
                <p className="text-sm text-secondary-600 text-center">
                    Drag & drop {multiple ? "images" : "an image"} here, or
                    click to select {multiple ? "files" : "a file"}
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                    {multiple ? `Up to ${maxFiles} images, ` : ""}Maximum{" "}
                    {maxSize}MB per file
                </p>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {/* Preview images */}
            {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previewImages.map((image, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={
                                    typeof image === "string"
                                        ? image
                                        : objectUrls[index] || ""
                                }
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                            />
                            {onRemoveImage && (
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onRemoveImage(index)
                                    }}
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

ImageUploader.propTypes = {
    multiple: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    maxFiles: PropTypes.number,
    maxSize: PropTypes.number,
    className: PropTypes.string,
    previewImages: PropTypes.array,
    onRemoveImage: PropTypes.func,
}

export default ImageUploader
