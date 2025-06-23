import PropTypes from "prop-types"
import { Modal } from "../ui"
import {
    FaWifi,
    FaSwimmingPool,
    FaParking,
    FaSnowflake,
    FaCoffee,
    FaTv,
    FaCheck,
    FaUtensils,
    FaLaptop,
    FaHome,
    FaMountain,
    FaUmbrellaBeach,
    FaPaw,
} from "react-icons/fa"

/**
 * Modal component for displaying all amenities
 */
const AmenitiesModal = ({ isOpen, onClose, amenities }) => {
    if (!amenities) return null

    // Map of amenity keys to their display names and icons
    const amenityMap = {
        wifi: { name: "WiFi", icon: FaWifi },
        pool: { name: "Swimming Pool", icon: FaSwimmingPool },
        parking: { name: "Free Parking", icon: FaParking },
        ac: { name: "Air Conditioning", icon: FaSnowflake },
        breakfast: { name: "Breakfast Included", icon: FaCoffee },
        tv: { name: "TV", icon: FaTv },
        kitchen: { name: "Kitchen", icon: FaUtensils },
        workspace: { name: "Workspace", icon: FaLaptop },
        cityView: { name: "City View", icon: FaHome },
        balcony: { name: "Balcony", icon: FaMountain },
        beachAccess: { name: "Beach Access", icon: FaUmbrellaBeach },
        pets: { name: "Pets Allowed", icon: FaPaw },
        // Add more amenities as needed
    }

    // Handle both array and object formats for amenities
    const allAmenities = Array.isArray(amenities)
        ? amenities.map((amenity) => ({
              name:
                  amenityMap[amenity]?.name ||
                  amenity.charAt(0).toUpperCase() + amenity.slice(1),
              icon: amenityMap[amenity]?.icon || FaCheck,
          }))
        : [
              ...Object.keys(amenities)
                  .filter((key) => amenities[key] === true && amenityMap[key])
                  .map((key) => ({
                      name: amenityMap[key].name,
                      icon: amenityMap[key].icon,
                  })),
              ...(amenities.custom || []).map((item) => ({
                  name: item,
                  icon: FaCheck,
              })),
          ]

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="All Amenities"
            size="lg"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAmenities.map((amenity, index) => (
                    <div
                        key={index}
                        className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                        <div className="bg-white p-2 rounded-full mr-3 text-primary-600">
                            <amenity.icon />
                        </div>
                        <span>{amenity.name}</span>
                    </div>
                ))}

                {allAmenities.length === 0 && (
                    <div className="col-span-2 text-center text-secondary-600 py-8">
                        No amenities listed for this property.
                    </div>
                )}
            </div>
        </Modal>
    )
}

AmenitiesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    amenities: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
}

export default AmenitiesModal
