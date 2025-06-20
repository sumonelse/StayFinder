import { useState } from "react"
import PropTypes from "prop-types"
import { FaChevronLeft, FaChevronRight, FaExpand } from "react-icons/fa"
import { Modal } from "../ui"

/**
 * Image gallery component for property images
 *
 * @param {Object} props - Component props
 * @param {Array} props.images - Array of image URLs or objects with url property
 * @param {string} props.alt - Alt text for images
 */
const ImageGallery = ({ images, alt }) => {
    const [selectedImage, setSelectedImage] = useState(0)
    const [showModal, setShowModal] = useState(false)

    // Get image URL from image object or string
    const getImageUrl = (image) => {
        return typeof image === "object" ? image.url : image
    }

    // Navigate to previous image
    const prevImage = (e) => {
        if (e) e.stopPropagation()
        setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    // Navigate to next image
    const nextImage = (e) => {
        if (e) e.stopPropagation()
        setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    // Open modal with full gallery
    const openGalleryModal = () => {
        setShowModal(true)
    }

    return (
        <>
            {/* Main gallery display */}
            <div className="mb-8 animate-fadeIn animation-delay-100">
                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-xl overflow-hidden">
                        {/* Main featured image */}
                        <div className="md:col-span-2 md:row-span-2 h-[400px] md:h-[500px] overflow-hidden relative group">
                            <img
                                src={
                                    getImageUrl(images[selectedImage]) ||
                                    "https://via.placeholder.com/800x600?text=No+Image"
                                }
                                alt={`${alt} - Featured`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Navigation arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                                        aria-label="Previous image"
                                    >
                                        <FaChevronLeft className="text-secondary-800" />
                                    </button>

                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                                        aria-label="Next image"
                                    >
                                        <FaChevronRight className="text-secondary-800" />
                                    </button>
                                </>
                            )}

                            {/* Expand button */}
                            <button
                                onClick={openGalleryModal}
                                className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                                aria-label="View all photos"
                            >
                                <FaExpand className="text-secondary-800" />
                            </button>
                        </div>

                        {/* Thumbnail grid - only show on medium screens and up */}
                        {images.length > 1 && (
                            <>
                                <div className="hidden md:block h-[245px] overflow-hidden rounded-tr-xl">
                                    {images[1] && (
                                        <img
                                            src={getImageUrl(images[1])}
                                            alt={`${alt} - 2`}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setSelectedImage(1)}
                                        />
                                    )}
                                </div>

                                <div className="hidden md:block h-[245px] overflow-hidden">
                                    {images[2] && (
                                        <img
                                            src={getImageUrl(images[2])}
                                            alt={`${alt} - 3`}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setSelectedImage(2)}
                                        />
                                    )}
                                </div>

                                <div className="hidden md:block h-[245px] overflow-hidden rounded-br-xl">
                                    {images[3] && (
                                        <div className="relative h-full">
                                            <img
                                                src={getImageUrl(images[3])}
                                                alt={`${alt} - 4`}
                                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() =>
                                                    setSelectedImage(3)
                                                }
                                            />
                                            {images.length > 4 && (
                                                <div
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                                                    onClick={openGalleryModal}
                                                >
                                                    <span className="text-white font-medium text-lg">
                                                        +{images.length - 4}{" "}
                                                        more
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* View all photos button - mobile only */}
                    <button
                        onClick={openGalleryModal}
                        className="md:hidden mt-4 flex items-center justify-center w-full py-2 px-4 border border-secondary-300 rounded-lg bg-white hover:bg-secondary-50 transition-colors"
                    >
                        <FaExpand className="mr-2" />
                        <span>View all photos</span>
                    </button>
                </div>
            </div>

            {/* Full gallery modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="All Photos"
                size="5xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="rounded-xl overflow-hidden shadow-md aspect-video"
                        >
                            <img
                                src={getImageUrl(image)}
                                alt={`${alt} - ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    )
}

ImageGallery.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                url: PropTypes.string.isRequired,
            }),
        ])
    ).isRequired,
    alt: PropTypes.string.isRequired,
}

export default ImageGallery
