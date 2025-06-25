import { useState } from "react"
import PropTypes from "prop-types"
import { FiUpload, FiX } from "react-icons/fi"
import { uploadService } from "../../services/api/"
import { authService } from "../../services/api/"
import { useAuth } from "../../context/AuthContext"

/**
 * Component for uploading and managing a user's profile picture
 */
const ProfilePictureUploader = ({
    currentImage,
    onImageUploaded,
    className = "",
}) => {
    const { updateProfile } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [previewImage, setPreviewImage] = useState(currentImage || "")

    /**
     * Handle file selection
     * @param {Event} e - File input change event
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0]

        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.")
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError("Image size should be less than 2MB.")
            return
        }

        setError(null)

        // Create a preview
        const reader = new FileReader()
        reader.onload = () => {
            setPreviewImage(reader.result)
        }
        reader.readAsDataURL(file)

        // Upload the image
        handleUpload(file)
    }

    /**
     * Upload the image to the server
     * @param {File} file - The image file to upload
     */
    const handleUpload = async (file) => {
        try {
            setIsLoading(true)

            // Upload the image to Cloudinary
            const result = await uploadService.uploadSingleImage(file)
            const imageUrl = result.data.url

            // Save the image URL to the user profile in the backend
            try {
                // Only update the profilePicture field
                await updateProfile({
                    profilePicture: imageUrl,
                })
                console.log("Profile picture updated in backend successfully")
            } catch (updateError) {
                console.error(
                    "Failed to update profile picture in backend:",
                    updateError
                )
                // Continue anyway since the image was uploaded to Cloudinary
            }

            // Notify parent component
            if (onImageUploaded) {
                // Make sure we're passing the correct URL from the response
                onImageUploaded(imageUrl)

                // Log the result for debugging
                // console.log("Image upload successful:", result.data)
            }

            setError(null)
        } catch (err) {
            setError(err.message || "Failed to upload image")
            console.error("Upload failed:", err)
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Remove the current profile picture
     */
    const handleRemove = () => {
        setPreviewImage("")

        // Notify parent component
        if (onImageUploaded) {
            onImageUploaded("")
        }
    }

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="relative w-32 h-32 mb-4">
                {previewImage ? (
                    <>
                        <img
                            src={previewImage}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full border-2 border-secondary-200"
                        />
                        <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            onClick={handleRemove}
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <div className="w-full h-full rounded-full bg-secondary-200 flex items-center justify-center">
                        <span className="text-secondary-500 text-4xl">?</span>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            <label className="cursor-pointer px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
                <FiUpload className="inline-block mr-2" />
                {isLoading ? "Uploading..." : "Upload Photo"}
            </label>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <p className="text-xs text-secondary-500 mt-2">
                JPG, PNG or GIF. Max size 2MB.
            </p>
        </div>
    )
}

ProfilePictureUploader.propTypes = {
    currentImage: PropTypes.string,
    onImageUploaded: PropTypes.func,
    className: PropTypes.string,
}

export default ProfilePictureUploader
