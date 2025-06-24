import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
    FaStar,
    FaArrowLeft,
    FaExclamationCircle,
    FaFlag,
    FaReply,
} from "react-icons/fa"
import { reviewService, propertyService } from "../../services/api"
import { Pagination, Button, Spinner, Alert } from "../../components/ui"
import { formatDate } from "../../utils/dateUtils"
import { useAuth } from "../../context/AuthContext"
import ReportReviewModal from "../../components/property/ReportReviewModal"
import HostResponseModal from "../../components/property/HostResponseModal"

/**
 * Page to display all reviews for a property
 */
const PropertyReviewsPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [reportModalOpen, setReportModalOpen] = useState(false)
    const [responseModalOpen, setResponseModalOpen] = useState(false)
    const [selectedReview, setSelectedReview] = useState(null)

    // Fetch property details
    const {
        data: property,
        isLoading: propertyLoading,
        isError: propertyError,
    } = useQuery({
        queryKey: ["property", id],
        queryFn: () => propertyService.getPropertyById(id),
    })

    // Fetch property reviews with pagination
    const {
        data: reviewsData,
        isLoading: reviewsLoading,
        isError: reviewsError,
        refetch: refetchReviews,
    } = useQuery({
        queryKey: ["propertyReviews", id, page, limit],
        queryFn: () => reviewService.getPropertyReviews(id, { page, limit }),
    })

    // Handle page change
    const handlePageChange = (newPage) => {
        setPage(newPage)
        window.scrollTo(0, 0)
    }

    // Handle report review
    const handleReportClick = (review) => {
        setSelectedReview(review)
        setReportModalOpen(true)
    }

    // Handle respond to review
    const handleRespondClick = (review) => {
        setSelectedReview(review)
        setResponseModalOpen(true)
    }

    // Handle report submission
    const handleReportSubmit = async (reason) => {
        try {
            await reviewService.reportReview(selectedReview._id, { reason })
            setReportModalOpen(false)
            setSelectedReview(null)
            // Show success message
            alert("Review reported successfully")
        } catch (error) {
            console.error("Error reporting review:", error)
            alert(error.response?.data?.message || "Error reporting review")
        }
    }

    // Handle response submission
    const handleResponseSubmit = async (text) => {
        try {
            await reviewService.respondToReview(selectedReview._id, { text })
            setResponseModalOpen(false)
            setSelectedReview(null)
            // Refetch reviews to show the new response
            refetchReviews()
        } catch (error) {
            console.error("Error responding to review:", error)
            alert(error.response?.data?.message || "Error responding to review")
        }
    }

    // Check if user is the property host
    const isHost = user && property && user._id === property.host._id

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Back button */}
            <div className="mb-6">
                <Button
                    variant="text"
                    onClick={() => navigate(`/properties/${id}`)}
                    className="text-secondary-700 hover:text-primary-600"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to property
                </Button>
            </div>

            {/* Header */}
            {propertyLoading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-secondary-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/4 mb-8"></div>
                </div>
            ) : propertyError ? (
                <Alert
                    type="error"
                    title="Error loading property"
                    message="Please try again later or contact support if the problem persists."
                />
            ) : (
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                        Reviews for {property.title}
                    </h1>
                    <div className="flex items-center text-secondary-700">
                        <FaStar className="text-yellow-500 mr-1" />
                        <span className="font-medium">
                            {property.avgRating
                                ? property.avgRating.toFixed(1)
                                : "No rating"}{" "}
                            · {property.reviewCount} reviews
                        </span>
                    </div>
                </div>
            )}

            {/* Reviews list */}
            {reviewsLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : reviewsError ? (
                <Alert
                    type="error"
                    title="Error loading reviews"
                    message="Please try again later or contact support if the problem persists."
                />
            ) : reviewsData?.reviews?.length > 0 ? (
                <div className="space-y-8">
                    {reviewsData.reviews.map((review) => (
                        <div
                            key={review._id}
                            className="bg-white p-6 rounded-xl border border-secondary-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start mb-4">
                                <div className="mr-4">
                                    {review.reviewer?.profilePicture ? (
                                        <img
                                            src={review.reviewer.profilePicture}
                                            alt={review.reviewer.name}
                                            className="h-14 w-14 rounded-full object-cover border border-secondary-100 shadow-sm"
                                        />
                                    ) : (
                                        <div className="h-14 w-14 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center border border-primary-50 shadow-sm">
                                            <span className="font-medium text-xl">
                                                {review.reviewer?.name
                                                    ?.charAt(0)
                                                    .toUpperCase() || "G"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-secondary-900 text-lg">
                                                {review.reviewer?.name ||
                                                    "Guest"}
                                            </div>
                                            <div className="text-secondary-500 text-sm">
                                                {formatDate(review.createdAt)}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {user &&
                                                user._id !==
                                                    review.reviewer?._id && (
                                                    <Button
                                                        variant="text"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleReportClick(
                                                                review
                                                            )
                                                        }
                                                        className="text-secondary-500 hover:text-red-600"
                                                        title="Report this review"
                                                    >
                                                        <FaFlag />
                                                    </Button>
                                                )}
                                            {isHost && !review.response && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleRespondClick(
                                                            review
                                                        )
                                                    }
                                                    className="text-primary-600"
                                                >
                                                    <FaReply className="mr-1" />
                                                    Respond
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center my-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar
                                                    key={i}
                                                    className={
                                                        i < review.rating
                                                            ? "text-yellow-500"
                                                            : "text-secondary-300"
                                                    }
                                                    size={16}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-secondary-700 leading-relaxed mt-2">
                                        {review.comment}
                                    </p>

                                    {/* Host response */}
                                    {review.response &&
                                        review.response.text && (
                                            <div className="mt-4 bg-secondary-50 p-4 rounded-lg border border-secondary-100">
                                                <div className="font-medium text-secondary-900 mb-1">
                                                    Response from host
                                                </div>
                                                <div className="text-secondary-500 text-sm mb-2">
                                                    {formatDate(
                                                        review.response.date
                                                    )}
                                                </div>
                                                <p className="text-secondary-700">
                                                    {review.response.text}
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {reviewsData.pagination &&
                        reviewsData.pagination.pages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <Pagination
                                    currentPage={reviewsData.pagination.page}
                                    totalPages={reviewsData.pagination.pages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-xl border border-secondary-100 text-center">
                    <FaExclamationCircle className="mx-auto text-secondary-400 text-4xl mb-4" />
                    <h3 className="text-xl font-medium text-secondary-900 mb-2">
                        No reviews yet
                    </h3>
                    <p className="text-secondary-600 mb-6">
                        This property doesn't have any reviews yet.
                    </p>
                    <Link
                        to={`/properties/${id}`}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to property
                    </Link>
                </div>
            )}

            {/* Report Review Modal */}
            {reportModalOpen && selectedReview && (
                <ReportReviewModal
                    isOpen={reportModalOpen}
                    onClose={() => {
                        setReportModalOpen(false)
                        setSelectedReview(null)
                    }}
                    onSubmit={handleReportSubmit}
                    reviewId={selectedReview._id}
                />
            )}

            {/* Host Response Modal */}
            {responseModalOpen && selectedReview && (
                <HostResponseModal
                    isOpen={responseModalOpen}
                    onClose={() => {
                        setResponseModalOpen(false)
                        setSelectedReview(null)
                    }}
                    onSubmit={handleResponseSubmit}
                    reviewId={selectedReview._id}
                />
            )}
        </div>
    )
}

export default PropertyReviewsPage
