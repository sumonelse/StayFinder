import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import PropTypes from "prop-types"
import ProfilePictureUploader from "./ProfilePictureUploader"

// Form validation schema
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
})

/**
 * User profile form component
 */
const ProfileForm = ({ initialData, onSubmit, isLoading = false }) => {
    const [profilePicture, setProfilePicture] = useState(
        initialData?.profilePicture || ""
    )

    // Initialize form with default values or initial data
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: initialData || {
            name: "",
            email: "",
            phone: "",
            bio: "",
        },
    })

    // Handle form submission
    const handleFormSubmit = (data) => {
        // Add profile picture to the form data
        const formData = {
            ...data,
            profilePicture,
        }

        onSubmit(formData)
    }

    // Handle profile picture upload
    const handleProfilePictureUploaded = (imageUrl) => {
        setProfilePicture(imageUrl)
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                    Profile Information
                </h2>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Picture */}
                    <div className="md:w-1/3 flex justify-center">
                        <ProfilePictureUploader
                            currentImage={profilePicture}
                            onImageUploaded={handleProfilePictureUploaded}
                        />
                    </div>

                    {/* Profile Details */}
                    <div className="md:w-2/3 space-y-4">
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-secondary-700"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                {...register("name")}
                                className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-secondary-700"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register("email")}
                                className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-secondary-700"
                            >
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                {...register("phone")}
                                className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

                        {/* Bio */}
                        <div>
                            <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-secondary-700"
                            >
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                rows={4}
                                {...register("bio")}
                                className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-secondary-500 focus:ring-secondary-500"
                                placeholder="Tell others about yourself..."
                            />
                            {errors.bio && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.bio.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading ? "Saving..." : "Update Profile"}
                </button>
            </div>
        </form>
    )
}

ProfileForm.propTypes = {
    initialData: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    authToken: PropTypes.string.isRequired,
}

export default ProfileForm
