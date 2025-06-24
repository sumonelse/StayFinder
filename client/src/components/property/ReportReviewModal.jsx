import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { FaFlag } from "react-icons/fa"
import { Modal, Button, Spinner } from "../ui"

/**
 * Modal for reporting a review
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} props.reviewId - ID of the review being reported
 * @param {Function} props.onSubmit - Function to call when report is submitted
 */
const ReportReviewModal = ({ isOpen, onClose, reviewId, onSubmit }) => {
    const [reason, setReason] = useState("")
    const [otherReason, setOtherReason] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Predefined report reasons
    const reportReasons = [
        "Inappropriate content",
        "Fake review",
        "Spam",
        "Offensive language",
        "Not relevant to the property",
        "Other",
    ]

    // Reset form when modal is opened
    useEffect(() => {
        if (isOpen) {
            setReason("")
            setOtherReason("")
            setError("")
        }
    }, [isOpen])

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate form
        if (!reason) {
            setError("Please select a reason")
            return
        }

        if (reason === "Other" && !otherReason.trim()) {
            setError("Please provide details for 'Other' reason")
            return
        }

        setIsSubmitting(true)

        try {
            // Call the onSubmit function with the reason
            const finalReason = reason === "Other" ? otherReason : reason
            await onSubmit(finalReason)
            onClose()
        } catch (error) {
            setError("Failed to submit report. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Report Review"
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-secondary-800">
                        <div className="flex items-center mb-2">
                            <FaFlag className="text-yellow-600 mr-2" />
                            <span className="font-medium">
                                Why are you reporting this review?
                            </span>
                        </div>
                        <p className="text-sm">
                            Reported reviews are sent to our moderation team for
                            review. Reviews that violate our guidelines will be
                            removed.
                        </p>
                    </div>

                    {/* Report reasons */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Select a reason
                        </label>
                        <div className="space-y-2">
                            {reportReasons.map((option) => (
                                <div key={option} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={option}
                                        name="reportReason"
                                        value={option}
                                        checked={reason === option}
                                        onChange={() => setReason(option)}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                                    />
                                    <label
                                        htmlFor={option}
                                        className="ml-2 block text-secondary-700"
                                    >
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Other reason textarea */}
                    {reason === "Other" && (
                        <div>
                            <label
                                htmlFor="otherReason"
                                className="block text-sm font-medium text-secondary-700 mb-2"
                            >
                                Please provide details
                            </label>
                            <textarea
                                id="otherReason"
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Please explain why you're reporting this review..."
                            />
                        </div>
                    )}

                    {/* Error message */}
                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    {/* Submit button */}
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="mr-3"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Report"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    )
}

ReportReviewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    reviewId: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
}

export default ReportReviewModal
