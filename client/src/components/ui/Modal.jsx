import React, { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { FaTimes } from "react-icons/fa"
import ReactDOM from "react-dom"

/**
 * Modal component for displaying content in an overlay
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.size="md"] - Modal size (sm, md, lg, xl, full)
 * @param {boolean} [props.closeOnOverlayClick=true] - Whether to close modal when clicking overlay
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close button
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    closeOnOverlayClick = true,
    showCloseButton = true,
}) => {
    const modalRef = useRef(null)

    // Handle escape key press
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscKey)
            document.body.style.overflow = "hidden" // Prevent scrolling when modal is open
        }

        return () => {
            document.removeEventListener("keydown", handleEscKey)
            document.body.style.overflow = "" // Restore scrolling when modal is closed
        }
    }, [isOpen, onClose])

    // Handle click outside modal with improved event handling
    const handleOverlayClick = (e) => {
        // Prevent event from propagating further
        e.preventDefault()
        e.stopPropagation()

        if (
            closeOnOverlayClick &&
            modalRef.current &&
            !modalRef.current.contains(e.target)
        ) {
            // Add a small delay to prevent flickering
            setTimeout(() => {
                onClose()
            }, 10)
        }
    }

    // Get modal width based on size
    const getModalWidth = () => {
        switch (size) {
            case "sm":
                return "max-w-sm"
            case "md":
                return "max-w-md"
            case "lg":
                return "max-w-lg"
            case "xl":
                return "max-w-xl"
            case "2xl":
                return "max-w-2xl"
            case "3xl":
                return "max-w-3xl"
            case "4xl":
                return "max-w-4xl"
            case "5xl":
                return "max-w-5xl"
            case "full":
                return "max-w-full"
            default:
                return "max-w-md"
        }
    }

    if (!isOpen) return null

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity overflow-y-auto"
            onClick={handleOverlayClick}
            onMouseDown={(e) => e.stopPropagation()}
            aria-modal="true"
            role="dialog"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                className={`${getModalWidth()} w-full bg-white rounded-2xl shadow-xl transform transition-all duration-300 ease-in-out animate-scaleIn my-8 max-h-[90vh] flex flex-col`}
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
                        <h3
                            id="modal-title"
                            className="text-lg font-semibold text-black"
                        >
                            {title}
                        </h3>
                        {showCloseButton && (
                            <button
                                type="button"
                                className="text-secondary-400 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-black rounded-full p-2 hover:bg-secondary-100 transition-colors"
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <FaTimes size={16} />
                            </button>
                        )}
                    </div>
                )}
                <div
                    className={`${
                        title ? "p-6" : "p-6"
                    } overflow-y-auto flex-1`}
                >
                    {!title && showCloseButton && (
                        <button
                            type="button"
                            className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-black rounded-full p-2 hover:bg-secondary-100 transition-colors z-10"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <FaTimes size={16} />
                        </button>
                    )}
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    size: PropTypes.oneOf([
        "sm",
        "md",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
        "5xl",
        "full",
    ]),
    closeOnOverlayClick: PropTypes.bool,
    showCloseButton: PropTypes.bool,
}

export default Modal
