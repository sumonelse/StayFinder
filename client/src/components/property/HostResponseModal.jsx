import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { FaReply } from "react-icons/fa"
import { Modal, Button, Spinner } from "../ui"

/**
 * Modal for hosts to respond to reviews
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} props.reviewId - ID of the review being responded to
 * @param {Function} props.onSubmit - Function to call when response is submitted
 */
const HostResponseModal = ({ isOpen, onClose, reviewId, onSubmit }) => {
    const [response, setResponse] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset form when modal is opened
    useEffect(() => {
        if (isOpen) {
            setResponse("")
            setError("")
        }
    }, [isOpen])

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate form
        if (!response.trim()) {
            setError("Please enter a response")
            return
        }

        if (response.trim().length > 1000) {
            setError("Response cannot exceed 1000 characters")
            return
        }

        setIsSubmitting(true)

        try {
            // Call the onSubmit function with the response
            await onSubmit(response)
            onClose()
        } catch (error) {
            setError("Failed to submit response. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Respond to Review"
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 text-secondary-800">
                        <div className="flex items-center mb-2">
                            <FaReply className="text-primary-600 mr-2" />
                            <span className="font-medium">Host Response</span>
                        </div>
                        <p className="text-sm">
                            Your response will be publicly visible alongside the
                            guest's review. This is your opportunity to thank
                            the guest or address any concerns they raised.
                        </p>
                    </div>

                    {/* Response textarea */}
                    <div>
                        <label
                            htmlFor="response"
                            className="block text-sm font-medium text-secondary-700 mb-2"
                        >
                            Your response
                        </label>
                        <textarea
                            id="response"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={5}
                            className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Thank you for your feedback..."
                        />
                        <div className="flex justify-between mt-2">
                            <p className="text-secondary-500 text-sm">
                                Maximum 1000 characters
                            </p>
                            <p className="text-secondary-500 text-sm">
                                {response.length}/1000
                            </p>
                        </div>
                    </div>

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
                                "Post Response"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    )
}

HostResponseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    reviewId: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
}

export default HostResponseModal
