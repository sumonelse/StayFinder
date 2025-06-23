import PropTypes from "prop-types"
import { Modal } from "../ui"
import { FaHome } from "react-icons/fa"

/**
 * Modal component for displaying the full property description
 */
const DescriptionModal = ({ isOpen, onClose, description, title }) => {
    if (!description) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="About this place"
            size="lg"
        >
            <div className="space-y-4">
                {title && (
                    <h3 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                        <FaHome className="mr-2 text-primary-500" />
                        {title}
                    </h3>
                )}
                <div className="text-secondary-700 leading-relaxed whitespace-pre-line">
                    {description}
                </div>
            </div>
        </Modal>
    )
}

DescriptionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    description: PropTypes.string.isRequired,
    title: PropTypes.string,
}

export default DescriptionModal
