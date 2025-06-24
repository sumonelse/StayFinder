import React, { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { FaStar, FaArrowLeft, FaCheckCircle } from "react-icons/fa"
import {
    reviewService,
    propertyService,
    bookingService,
} from "../../services/api"
import { Button, Spinner, Alert } from "../../components/ui"
import { useAuth } from "../../context/AuthContext"

/**
 * Page for adding a new review
 */
const AddReviewPage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const propertyId = searchParams.get("propertyId")
    const bookingId = searchParams.get("bookingId")
    const { user } = useAuth()

    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState(false)

    // Redirect if no propertyId or bookingId
    useEffect(() => {
        if (!propertyId || !bookingId) {
            navigate("/bookings")
        }
    }, [propertyId, bookingId, navigate])

    // Fetch property details
    const {
        data: property,
        isLoading: propertyLoading,
        isError: propertyError,
    } = useQuery({
        queryKey: ["property", propertyId],
        queryFn: () => propertyService.getPropertyById(propertyId),
        enabled: !!propertyId,
    })

    // Fetch booking details
    const {
        data: booking,
        isLoading: bookingLoading,
        isError: bookingError,
    } = useQuery({
        queryKey: ["booking", bookingId],
        queryFn: () => bookingService.getBookingById(bookingId),
        enabled: !!bookingId,
    })

    // Check if user has already reviewed this booking
    const { data: existingReviews, isLoading: reviewsLoading } = useQuery({
        queryKey: ["propertyReviews", propertyId],
        queryFn: () => reviewService.getPropertyReviews(propertyId),
        enabled: !!propertyId && !!user,
    })

    const hasAlreadyReviewed = useMemo(() => {
        if (!existingReviews?.reviews || !user) return false
        return existingReviews.reviews.some(
            (review) =>
                review.reviewer?._id === user._id &&
                review.booking === bookingId
        )
    }, [existingReviews, user, bookingId])

    // Create review mutation
    const createReviewMutation = useMutation({
        mutationFn: (reviewData) => reviewService.createReview(reviewData),
        onSuccess: () => {
            setSuccess(true)
            // Reset form
            setRating(0)
            setComment("")
            setErrors({})

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate(`/bookings/${bookingId}`)
            }, 3000)
        },
        onError: (error) => {
            const errorMessage =
                error.response?.data?.message || "Error submitting review"
            setErrors({ submit: errorMessage })
        },
    })

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        if (rating === 0) {
            newErrors.rating = "Please select a rating"
        }

        if (!comment.trim()) {
            newErrors.comment = "Please enter a comment"
        } else if (comment.trim().length < 10) {
            newErrors.comment = "Comment must be at least 10 characters"
        } else if (comment.trim().length > 1000) {
            newErrors.comment = "Comment cannot exceed 1000 characters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        createReviewMutation.mutate({
            propertyId,
            bookingId,
            rating,
            comment,
        })
    }

    // Loading state
    if (propertyLoading || bookingLoading || reviewsLoading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="flex justify-center">
                    <Spinner size="lg" />
                </div>
            </div>
        )
    }

    // Error state
    if (propertyError || bookingError) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <Alert
                    type="error"
                    title="Error loading data"
                    message="We couldn't load the necessary information. Please try again later."
                />
                <div className="mt-6 text-center">
                    <Button
                        onClick={() => navigate("/bookings")}
                        variant="outline"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to bookings
                    </Button>
                </div>
            </div>
        )
    }

    // Already reviewed state
    if (hasAlreadyReviewed) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-white p-8 rounded-xl border border-secondary-100 shadow-md text-center">
                    <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
                    <h1 className="text-2xl font-bold text-secondary-900 mb-3">
                        You've already reviewed this stay
                    </h1>
                    <p className="text-secondary-600 mb-6">
                        You can only submit one review per booking. Thank you
                        for sharing your experience!
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button
                            onClick={() => navigate(`/bookings/${bookingId}`)}
                            variant="outline"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to booking
                        </Button>
                        <Button
                            onClick={() =>
                                navigate(`/properties/${propertyId}`)
                            }
                        >
                            View property
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Success state
    if (success) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-white p-8 rounded-xl border border-secondary-100 shadow-md text-center">
                    <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
                    <h1 className="text-2xl font-bold text-secondary-900 mb-3">
                        Review submitted successfully!
                    </h1>
                    <p className="text-secondary-600 mb-6">
                        Thank you for sharing your experience. Your review helps
                        other travelers make informed decisions.
                    </p>
                    <p className="text-secondary-500 mb-6">
                        Redirecting you back to your booking...
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button
                            onClick={() => navigate(`/bookings/${bookingId}`)}
                            variant="outline"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to booking
                        </Button>
                        <Button
                            onClick={() =>
                                navigate(`/properties/${propertyId}`)
                            }
                        >
                            View property
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Back button */}
            <div className="mb-6">
                <Button
                    variant="text"
                    onClick={() => navigate(`/bookings/${bookingId}`)}
                    className="text-secondary-700 hover:text-primary-600"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to booking
                </Button>
            </div>

            <div className="bg-white p-8 rounded-xl border border-secondary-100 shadow-md">
                <h1 className="text-2xl font-bold text-secondary-900 mb-6">
                    Review your stay at {property?.title}
                </h1>

                {/* Property summary */}
                <div className="flex items-center mb-8 p-4 bg-secondary-50 rounded-lg border border-secondary-100">
                    <div className="w-20 h-20 rounded-lg overflow-hidden mr-4">
                        <img
                            src={
                                property?.images[0]?.url ||
                                "/placeholder-property.jpg"
                            }
                            alt={property?.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-medium text-secondary-900">
                            {property?.title}
                        </h3>
                        <p className="text-secondary-600 text-sm">
                            {property?.address?.city},{" "}
                            {property?.address?.state},{" "}
                            {property?.address?.country}
                        </p>
                        <p className="text-secondary-500 text-sm mt-1">
                            {new Date(booking?.checkIn).toLocaleDateString()} -{" "}
                            {new Date(booking?.checkOut).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {errors.submit && (
                        <Alert
                            type="error"
                            title="Error"
                            message={errors.submit}
                            className="mb-6"
                        />
                    )}

                    <div className="space-y-6">
                        {/* Rating */}
                        <div>
                            <label className="block text-lg font-medium text-secondary-900 mb-3">
                                How would you rate your stay?
                            </label>
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() =>
                                            setHoverRating(star)
                                        }
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="text-3xl focus:outline-none p-1"
                                    >
                                        <FaStar
                                            className={`${
                                                star <= (hoverRating || rating)
                                                    ? "text-yellow-500"
                                                    : "text-secondary-300"
                                            } transition-colors`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-3 text-secondary-700 text-lg">
                                    {rating > 0
                                        ? `${rating} star${
                                              rating > 1 ? "s" : ""
                                          }`
                                        : ""}
                                </span>
                            </div>
                            {errors.rating && (
                                <p className="text-red-600 text-sm mt-2">
                                    {errors.rating}
                                </p>
                            )}
                        </div>

                        {/* Comment */}
                        <div>
                            <label
                                htmlFor="comment"
                                className="block text-lg font-medium text-secondary-900 mb-3"
                            >
                                Share your experience
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={6}
                                className={`w-full rounded-lg border ${
                                    errors.comment
                                        ? "border-red-300"
                                        : "border-secondary-300"
                                } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                placeholder="What did you like or dislike? How was the location? Would you recommend it to other travelers?"
                            />
                            <div className="flex justify-between mt-2">
                                {errors.comment ? (
                                    <p className="text-red-600 text-sm">
                                        {errors.comment}
                                    </p>
                                ) : (
                                    <p className="text-secondary-500 text-sm">
                                        Minimum 10 characters, maximum 1000
                                    </p>
                                )}
                                <p className="text-secondary-500 text-sm">
                                    {comment.length}/1000
                                </p>
                            </div>
                        </div>

                        {/* Submit button */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="button"
                                onClick={() =>
                                    navigate(`/bookings/${bookingId}`)
                                }
                                variant="outline"
                                className="mr-3"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createReviewMutation.isPending}
                            >
                                {createReviewMutation.isPending ? (
                                    <>
                                        <Spinner size="sm" className="mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Review"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddReviewPage
