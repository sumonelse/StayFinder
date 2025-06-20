import { useState } from "react"
import PropTypes from "prop-types"
import {
    FaFacebook,
    FaTwitter,
    FaWhatsapp,
    FaEnvelope,
    FaLink,
    FaCheck,
} from "react-icons/fa"
import { Modal } from "../ui"

/**
 * Share modal component for sharing properties
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} props.title - Property title
 * @param {string} props.url - URL to share
 */
const ShareModal = ({ isOpen, onClose, title, url }) => {
    const [copied, setCopied] = useState(false)

    // Copy link to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    // Generate share URLs
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
        )}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
        )}&text=${encodeURIComponent(`Check out this property: ${title}`)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
            `Check out this property: ${title} ${url}`
        )}`,
        email: `mailto:?subject=${encodeURIComponent(
            `Check out this property: ${title}`
        )}&body=${encodeURIComponent(
            `I found this property on StayFinder and thought you might be interested: ${url}`
        )}`,
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Share this property"
            size="md"
        >
            <div className="space-y-6">
                <p className="text-secondary-700">
                    Share this property with friends and family
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <a
                        href={shareUrls.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors"
                    >
                        <FaFacebook className="text-primary-600 text-2xl mb-2" />
                        <span className="text-sm text-secondary-700">
                            Facebook
                        </span>
                    </a>

                    <a
                        href={shareUrls.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors"
                    >
                        <FaTwitter className="text-primary-400 text-2xl mb-2" />
                        <span className="text-sm text-secondary-700">
                            Twitter
                        </span>
                    </a>

                    <a
                        href={shareUrls.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors"
                    >
                        <FaWhatsapp className="text-green-500 text-2xl mb-2" />
                        <span className="text-sm text-secondary-700">
                            WhatsApp
                        </span>
                    </a>

                    <a
                        href={shareUrls.email}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors"
                    >
                        <FaEnvelope className="text-secondary-600 text-2xl mb-2" />
                        <span className="text-sm text-secondary-700">
                            Email
                        </span>
                    </a>
                </div>

                <div className="mt-6">
                    <label
                        htmlFor="share-url"
                        className="block text-sm font-medium text-secondary-700 mb-2"
                    >
                        Property Link
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            id="share-url"
                            value={url}
                            readOnly
                            className="flex-1 rounded-l-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                            onClick={copyToClipboard}
                            className={`px-4 py-2 rounded-r-lg flex items-center justify-center ${
                                copied
                                    ? "bg-green-600 text-white"
                                    : "bg-primary-600 hover:bg-primary-700 text-white"
                            }`}
                        >
                            {copied ? (
                                <>
                                    <FaCheck className="mr-2" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <FaLink className="mr-2" />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

ShareModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
}

export default ShareModal
