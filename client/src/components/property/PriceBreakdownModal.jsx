import PropTypes from "prop-types"
import { FaInfoCircle } from "react-icons/fa"
import { Modal } from "../ui"
import { formatPrice } from "../../utils/currency"

/**
 * Modal component for displaying detailed price breakdown
 */
const PriceBreakdownModal = ({ isOpen, onClose, bookingPrice }) => {
    if (!bookingPrice) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Price Breakdown"
            size="md"
        >
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-secondary-100">
                    <span className="font-medium text-secondary-900">
                        Your booking details
                    </span>
                    <span className="text-sm text-secondary-600">
                        {bookingPrice.nights}{" "}
                        {bookingPrice.nights === 1 ? "night" : "nights"}
                    </span>
                </div>

                <div className="space-y-3 text-secondary-700">
                    <div className="flex justify-between items-center">
                        <span className="flex items-center">
                            {formatPrice(bookingPrice.pricePerNight)} x{" "}
                            {bookingPrice.nights}{" "}
                            {bookingPrice.nights === 1 ? "night" : "nights"}
                            <FaInfoCircle
                                className="ml-1 text-secondary-400 cursor-help"
                                size={12}
                                title={`Base rate per ${bookingPrice.pricePeriod}`}
                            />
                        </span>
                        <span>{formatPrice(bookingPrice.subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="flex items-center">
                            Cleaning fee
                            <FaInfoCircle
                                className="ml-1 text-secondary-400 cursor-help"
                                size={12}
                                title="One-time fee charged by host to cover the cost of cleaning their space"
                            />
                        </span>
                        <span>{formatPrice(bookingPrice.cleaningFee)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="flex items-center">
                            Service fee
                            <FaInfoCircle
                                className="ml-1 text-secondary-400 cursor-help"
                                size={12}
                                title="This helps us run our platform and offer services like 24/7 support"
                            />
                        </span>
                        <span>{formatPrice(bookingPrice.serviceFee)}</span>
                    </div>

                    <hr className="my-2 border-secondary-100" />

                    <div className="flex justify-between font-bold text-lg text-secondary-900">
                        <span>Total</span>
                        <span>{formatPrice(bookingPrice.total)}</span>
                    </div>
                </div>

                <div className="mt-4 text-sm text-secondary-600 bg-secondary-50 p-3 rounded-lg">
                    <p>
                        You won't be charged yet. Payment will be processed when
                        you complete your booking.
                    </p>
                </div>
            </div>
        </Modal>
    )
}

PriceBreakdownModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    bookingPrice: PropTypes.shape({
        nights: PropTypes.number.isRequired,
        subtotal: PropTypes.number.isRequired,
        cleaningFee: PropTypes.number.isRequired,
        serviceFee: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
        pricePerNight: PropTypes.number.isRequired,
        pricePeriod: PropTypes.string.isRequired,
    }),
}

export default PriceBreakdownModal
