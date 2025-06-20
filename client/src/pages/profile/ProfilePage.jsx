import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaLock,
    FaCheckCircle,
} from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"
import { authService } from "../../services/api"
import ProfilePictureUploader from "../../components/user/ProfilePictureUploader"

/**
 * Profile page component
 * Allows users to view and update their profile information
 */
const ProfilePage = () => {
    const navigate = useNavigate()
    const { user, updateProfile, logout } = useAuth()

    // Form state
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
        },
        bio: user?.bio || "",
        profilePicture: user?.profilePicture || "",
    })

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    // UI state
    const [activeTab, setActiveTab] = useState("profile")
    const [errors, setErrors] = useState({})
    const [successMessage, setSuccessMessage] = useState("")

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data) => authService.updateProfile(data),
        onSuccess: () => {
            setSuccessMessage("Profile updated successfully")
            setTimeout(() => setSuccessMessage(""), 3000)
        },
        onError: (error) => {
            setErrors({
                form: error.message || "Failed to update profile",
            })
        },
    })

    // Change password mutation
    const changePasswordMutation = useMutation({
        mutationFn: (data) => authService.updateProfile({ password: data }),
        onSuccess: () => {
            setSuccessMessage("Password changed successfully")
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            setTimeout(() => setSuccessMessage(""), 3000)
        },
        onError: (error) => {
            setErrors({
                password: error.message || "Failed to change password",
            })
        },
    })

    // Handle profile form input changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target

        if (name.includes(".")) {
            // Handle nested objects (address)
            const [parent, child] = name.split(".")
            setProfileData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }))
        } else {
            setProfileData((prev) => ({
                ...prev,
                [name]: value,
            }))
        }

        // Clear related errors
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }))
        }
    }

    // Handle password form input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Clear related errors
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }))
        }
    }

    // Validate profile form
    const validateProfileForm = () => {
        const newErrors = {}

        if (!profileData.name.trim()) {
            newErrors.name = "Name is required"
        }

        if (!profileData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
            newErrors.email = "Email is invalid"
        }

        if (profileData.phone && !/^\+?[0-9]{10,15}$/.test(profileData.phone)) {
            newErrors.phone = "Phone number is invalid"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Validate password form
    const validatePasswordForm = () => {
        const newErrors = {}

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = "Current password is required"
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = "New password is required"
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters"
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password"
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle profile form submission
    const handleProfileSubmit = (e) => {
        e.preventDefault()

        if (!validateProfileForm()) {
            return
        }

        // Only send the allowed fields to the backend
        const allowedFields = {
            name: profileData.name,
            phone: profileData.phone || "",
            bio: profileData.bio || "",
            profilePicture: profileData.profilePicture || "",
        }

        updateProfileMutation.mutate(allowedFields)
    }

    // Handle password form submission
    const handlePasswordSubmit = (e) => {
        e.preventDefault()

        if (!validatePasswordForm()) {
            return
        }

        changePasswordMutation.mutate({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
        })
    }

    // Handle account deletion
    const handleDeleteAccount = () => {
        if (
            window.confirm(
                "Are you sure you want to delete your account? This action cannot be undone."
            )
        ) {
            // Implement account deletion logic
            // After successful deletion, log out the user
            logout()
            navigate("/")
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

            {/* Success message */}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
                    <FaCheckCircle className="mr-2" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`px-6 py-3 text-sm font-medium ${
                            activeTab === "profile"
                                ? "border-b-2 border-primary-500 text-primary-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Profile Information
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium ${
                            activeTab === "security"
                                ? "border-b-2 border-primary-500 text-primary-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setActiveTab("security")}
                    >
                        Security
                    </button>
                </div>

                {/* Profile tab */}
                {activeTab === "profile" && (
                    <div className="p-6">
                        <form onSubmit={handleProfileSubmit}>
                            {/* General error message */}
                            {errors.form && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                    <p>{errors.form}</p>
                                </div>
                            )}

                            {/* Profile Picture */}
                            <div className="mb-6 flex justify-center">
                                <ProfilePictureUploader
                                    currentImage={profileData.profilePicture}
                                    onImageUploaded={(imageUrl) => {
                                        setProfileData((prev) => ({
                                            ...prev,
                                            profilePicture: imageUrl,
                                        }))
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleProfileChange}
                                            className={`w-full pl-10 pr-3 py-2 border ${
                                                errors.name
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            className={`w-full pl-10 pr-3 py-2 border ${
                                                errors.email
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaPhone className="text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                            placeholder="e.g., +1234567890"
                                            className={`w-full pl-10 pr-3 py-2 border ${
                                                errors.phone
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-3">
                                    Address Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="address.street"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Street Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaMapMarkerAlt className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="address.street"
                                                name="address.street"
                                                value={
                                                    profileData.address.street
                                                }
                                                onChange={handleProfileChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="address.city"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            id="address.city"
                                            name="address.city"
                                            value={profileData.address.city}
                                            onChange={handleProfileChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="address.state"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            State/Province
                                        </label>
                                        <input
                                            type="text"
                                            id="address.state"
                                            name="address.state"
                                            value={profileData.address.state}
                                            onChange={handleProfileChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="address.zipCode"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Zip/Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            id="address.zipCode"
                                            name="address.zipCode"
                                            value={profileData.address.zipCode}
                                            onChange={handleProfileChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="address.country"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            id="address.country"
                                            name="address.country"
                                            value={profileData.address.country}
                                            onChange={handleProfileChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mb-6">
                                <label
                                    htmlFor="bio"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    About You
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows="4"
                                    value={profileData.bio}
                                    onChange={handleProfileChange}
                                    placeholder="Tell others about yourself..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                ></textarea>
                                <p className="mt-1 text-sm text-gray-500">
                                    This information will be displayed on your
                                    public profile.
                                </p>
                            </div>

                            {/* Submit button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={updateProfileMutation.isLoading}
                                    className="bg-primary-600 text-white py-2 px-6 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:bg-primary-300"
                                >
                                    {updateProfileMutation.isLoading
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Security tab */}
                {activeTab === "security" && (
                    <div className="p-6">
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">
                                Change Password
                            </h2>

                            <form onSubmit={handlePasswordSubmit}>
                                {/* Password error message */}
                                {errors.password && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                        <p>{errors.password}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Current password */}
                                    <div>
                                        <label
                                            htmlFor="currentPassword"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                id="currentPassword"
                                                name="currentPassword"
                                                value={
                                                    passwordData.currentPassword
                                                }
                                                onChange={handlePasswordChange}
                                                className={`w-full pl-10 pr-3 py-2 border ${
                                                    errors.currentPassword
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                            />
                                        </div>
                                        {errors.currentPassword && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.currentPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* New password */}
                                    <div>
                                        <label
                                            htmlFor="newPassword"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className={`w-full pl-10 pr-3 py-2 border ${
                                                    errors.newPassword
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                            />
                                        </div>
                                        {errors.newPassword && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.newPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm password */}
                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={
                                                    passwordData.confirmPassword
                                                }
                                                onChange={handlePasswordChange}
                                                className={`w-full pl-10 pr-3 py-2 border ${
                                                    errors.confirmPassword
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                            />
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={
                                            changePasswordMutation.isLoading
                                        }
                                        className="bg-primary-600 text-white py-2 px-6 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:bg-primary-300"
                                    >
                                        {changePasswordMutation.isLoading
                                            ? "Changing..."
                                            : "Change Password"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Account deletion */}
                        <div className="border-t border-gray-200 pt-6">
                            <h2 className="text-xl font-semibold mb-4 text-red-600">
                                Delete Account
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Once you delete your account, there is no going
                                back. Please be certain.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                className="bg-red-600 text-white py-2 px-6 rounded-md font-medium hover:bg-red-700 transition-colors"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePage
