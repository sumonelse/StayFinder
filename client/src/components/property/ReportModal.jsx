import { useState } from "react"
import PropTypes from "prop-types"
import { Modal } from "../ui"
import { FaExclamationTriangle, FaCheck } from "react-icons/fa"

/**
 * Modal component for reporting a property
 */
const ReportModal = ({ isOpen, onClose, propertyId }) => {
    const [reportReason, setReportReason] = useState("")
    const [reportDetails, setReportDetails] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const reportReasons = [
        "Inaccurate information",
        "Inappropriate content",
        "Suspicious listing",
        "Scam or fraud",
        "Property doesn't exist",
        "Other issue",
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        setTimeout(() => {
            console.log("Report submitted:", {
                propertyId,
                reason: reportReason,
                details: reportDetails,
            })
            setIsSubmitting(false)
            setSubmitted(true)

            // Reset form after 3 seconds and close modal
            setTimeout(() => {
                setReportReason("")
                setReportDetails("")
                setSubmitted(false)
                onClose()
            }, 3000)
        }, 1000)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Report this property"
            size="md"
        >
            {submitted ? (
                <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <FaCheck className="text-green-600 text-xl" />
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                        Thank you for your report
                    </h3>
                    <p className="text-secondary-600">
                        We've received your report and will review it as soon as
                        possible.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                            What's wrong with this property?
                        </label>
                        <select
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            required
                            className="w-full border border-secondary-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Select a reason</option>
                            {reportReasons.map((reason) => (
                                <option key={reason} value={reason}>
                                    {reason}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Additional details (optional)
                        </label>
                        <textarea
                            value={reportDetails}
                            onChange={(e) => setReportDetails(e.target.value)}
                            rows={4}
                            className="w-full border border-secondary-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Please provide any additional information that might help us understand the issue."
                        />
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-start">
                        <FaExclamationTriangle className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm text-yellow-700">
                            We take all reports seriously and will investigate
                            this property. Thank you for helping keep StayFinder
                            safe and trustworthy.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!reportReason || isSubmitting}
                            className={`px-4 py-2 rounded-lg text-white ${
                                !reportReason || isSubmitting
                                    ? "bg-secondary-400 cursor-not-allowed"
                                    : "bg-primary-600 hover:bg-primary-700"
                            }`}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    )
}

ReportModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    propertyId: PropTypes.string.isRequired,
}

export default ReportModal
