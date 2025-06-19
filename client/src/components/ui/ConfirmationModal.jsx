import React from "react"
import PropTypes from "prop-types"
import { FaExclamationTriangle } from "react-icons/fa"
import Modal from "./Modal"

/**
 * Confirmation modal component for confirming user actions
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} props.title - Modal title
 * @param {string} props.message - Confirmation message
 * @param {string} [props.confirmText="Confirm"] - Text for confirm button
 * @param {string} [props.cancelText="Cancel"] - Text for cancel button
 * @param {string} [props.confirmButtonType="danger"] - Button type for confirm button (primary, secondary, danger)
 * @param {Function} props.onConfirm - Function to call when action is confirmed
 */
const ConfirmationModal = ({
    isOpen,
    onClose,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmButtonType = "danger",
    onConfirm,
}) => {
    // Get button classes based on type
    const getButtonClasses = (type) => {
        switch (type) {
            case "primary":
                return "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white"
            case "secondary":
                return "bg-secondary-600 hover:bg-secondary-700 focus:ring-secondary-500 text-white"
            case "danger":
                return "bg-danger-600 hover:bg-danger-700 focus:ring-danger-500 text-white"
            default:
                return "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white"
        }
    }

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                    <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-secondary-700 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        type="button"
                        className="px-4 py-2 border border-secondary-300 rounded-md shadow-sm text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonClasses(
                            confirmButtonType
                        )}`}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    confirmButtonType: PropTypes.oneOf(["primary", "secondary", "danger"]),
    onConfirm: PropTypes.func.isRequired,
}

export default ConfirmationModal
