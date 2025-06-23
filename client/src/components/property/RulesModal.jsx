import PropTypes from "prop-types"
import { Modal } from "../ui"
import {
    FaClock,
    FaSmokingBan,
    FaPaw,
    FaRegCommentDots,
    FaExclamationTriangle,
    FaCheck,
    FaTimes,
} from "react-icons/fa"

/**
 * Modal component for displaying all property rules
 */
const RulesModal = ({ isOpen, onClose, rules }) => {
    if (!rules) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="House Rules" size="lg">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                        <FaClock className="mt-0.5 mr-2 text-primary-500 flex-shrink-0" />
                        <div>
                            <span className="font-medium">Check-in:</span>{" "}
                            {rules.checkIn || "Flexible"}
                        </div>
                    </div>

                    <div className="flex items-start">
                        <FaClock className="mt-0.5 mr-2 text-primary-500 flex-shrink-0" />
                        <div>
                            <span className="font-medium">Checkout:</span>{" "}
                            {rules.checkOut || "Flexible"}
                        </div>
                    </div>

                    <div className="flex items-start">
                        <FaSmokingBan className="mt-0.5 mr-2 text-primary-500 flex-shrink-0" />
                        <div>
                            <span className="font-medium">Smoking:</span>{" "}
                            {rules.smoking ? "Allowed" : "Not allowed"}
                        </div>
                    </div>

                    <div className="flex items-start">
                        <FaPaw className="mt-0.5 mr-2 text-primary-500 flex-shrink-0" />
                        <div>
                            <span className="font-medium">Pets:</span>{" "}
                            {rules.pets ? "Allowed" : "Not allowed"}
                        </div>
                    </div>

                    <div className="flex items-start">
                        <FaRegCommentDots className="mt-0.5 mr-2 text-primary-500 flex-shrink-0" />
                        <div>
                            <span className="font-medium">Parties:</span>{" "}
                            {rules.parties ? "Allowed" : "Not allowed"}
                        </div>
                    </div>
                </div>

                {rules.additionalRules && rules.additionalRules.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-medium text-lg mb-3">
                            Additional Rules
                        </h3>
                        <ul className="space-y-2">
                            {rules.additionalRules.map((rule, index) => (
                                <li key={index} className="flex items-start">
                                    <FaExclamationTriangle className="mt-0.5 mr-2 text-yellow-500 flex-shrink-0" />
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="bg-secondary-50 p-4 rounded-lg mt-4">
                    <p className="text-sm text-secondary-700">
                        By booking this property, you agree to follow all house
                        rules and understand that the host may charge additional
                        fees or cancel your reservation if rules are violated.
                    </p>
                </div>
            </div>
        </Modal>
    )
}

RulesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    rules: PropTypes.object,
}

export default RulesModal
