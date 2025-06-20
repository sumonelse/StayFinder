import PropTypes from "prop-types"
import { FaTrash, FaExclamationTriangle } from "react-icons/fa"
import { ConfirmationModal } from "../ui"

/**
 * Delete confirmation modal component
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} props.itemType - Type of item being deleted (e.g., "property", "booking")
 * @param {string} props.itemName - Name of the item being deleted
 * @param {Function} props.onConfirm - Function to call when deletion is confirmed
 * @param {boolean} [props.isDeleting=false] - Whether the deletion is in progress
 */
const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    itemType,
    itemName,
    onConfirm,
    isDeleting = false,
}) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Delete ${itemType}`}
            message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
            confirmText={isDeleting ? "Deleting..." : "Delete"}
            cancelText="Cancel"
            confirmButtonType="danger"
            onConfirm={onConfirm}
        />
    )
}

DeleteConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    itemType: PropTypes.string.isRequired,
    itemName: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isDeleting: PropTypes.bool,
}

export default DeleteConfirmationModal
