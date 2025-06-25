import PropTypes from "prop-types"
import Modal from "../ui/Modal"
import PropertyRules from "./PropertyRules"

/**
 * Modal component for displaying house rules
 */
const HouseRulesModal = ({ isOpen, onClose, rules = {} }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="House rules" size="lg">
            <div className="max-h-96 overflow-y-auto">
                <PropertyRules
                    rules={rules}
                    showAll={true}
                    className="text-sm"
                />
            </div>

            <div className="mt-6 pt-4 border-t border-secondary-200">
                <p className="text-sm text-secondary-600 leading-relaxed">
                    By proceeding with this booking, you agree to follow the
                    house rules set by the host.
                </p>
            </div>
        </Modal>
    )
}

HouseRulesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    rules: PropTypes.object,
}

export default HouseRulesModal
