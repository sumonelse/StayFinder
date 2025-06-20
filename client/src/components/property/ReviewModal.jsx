import { useState } from "react"
import PropTypes from "prop-types"
import { FaStar } from "react-icons/fa"
import { Modal } from "../ui"

/**
 * Review modal component for adding reviews
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} props.propertyId - ID of the property being reviewed
 * @param {string} props.propertyName - Name of the property being reviewed
 * @param {Function} props.onSubmit - Function to call when review is submitted
 * @param {boolean} [props.isSubmitting=false] - Whether the submission is in progress
 */
const ReviewModal = ({
    isOpen,
    onClose,
    propertyId,
    propertyName,
    onSubmit,
    isSubmitting = false,
}) => {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [errors, setErrors] = useState({})

    // Reset form when modal is opened
    React.useEffect(() => {
        if (isOpen) {
            setRating(0)
            setHoverRating(0)
            setComment("")
            setErrors({})
        }
    }, [isOpen])

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

        onSubmit({
            propertyId,
            rating,
            comment,
        })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Review ${propertyName}`}
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Rating
                        </label>
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="text-2xl focus:outline-none p-1"
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
                            <span className="ml-2 text-secondary-700">
                                {rating > 0
                                    ? `${rating} star${rating > 1 ? "s" : ""}`
                                    : ""}
                            </span>
                        </div>
                        {errors.rating && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.rating}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label
                            htmlFor="comment"
                            className="block text-sm font-medium text-secondary-700 mb-2"
                        >
                            Comment
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className={`w-full rounded-lg border ${
                                errors.comment
                                    ? "border-red-300"
                                    : "border-secondary-300"
                            } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                            placeholder="Share your experience with this property..."
                        />
                        {errors.comment ? (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.comment}
                            </p>
                        ) : (
                            <p className="text-secondary-500 text-sm mt-1">
                                Minimum 10 characters
                            </p>
                        )}
                    </div>

                    {/* Submit button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-secondary-300 rounded-md shadow-sm text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    )
}

ReviewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    propertyId: PropTypes.string.isRequired,
    propertyName: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool,
}

export default ReviewModal
