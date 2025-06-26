import { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { FaMapMarkerAlt } from "react-icons/fa"

/**
 * LocationMap component for displaying a property's location on a map
 * Uses Leaflet for map functionality
 */
const LocationMap = ({ coordinates, title, height = "300px" }) => {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerRef = useRef(null)

    useEffect(() => {
        // Load Leaflet CSS
        const linkEl = document.createElement("link")
        linkEl.rel = "stylesheet"
        linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        linkEl.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        linkEl.crossOrigin = ""
        document.head.appendChild(linkEl)

        // Dynamically import Leaflet to avoid SSR issues
        const loadMap = async () => {
            try {
                // Only import if coordinates are provided
                if (!coordinates || !coordinates[0] || !coordinates[1]) {
                    return
                }

                // Import Leaflet
                if (!window.L) {
                    const script = document.createElement("script")
                    script.src =
                        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                    script.integrity =
                        "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                    script.crossOrigin = ""

                    // Wait for script to load
                    await new Promise((resolve) => {
                        script.onload = resolve
                        document.head.appendChild(script)
                    })
                }

                const L = window.L

                // Wait a bit for the DOM to be ready
                setTimeout(() => {
                    try {
                        // Initialize map if it doesn't exist yet
                        if (!mapInstanceRef.current && mapRef.current) {
                            // Create map instance
                            mapInstanceRef.current = L.map(
                                mapRef.current
                            ).setView(
                                [coordinates[1], coordinates[0]], // [lat, lng]
                                13
                            )

                            // Add tile layer (OpenStreetMap)
                            L.tileLayer(
                                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                                {
                                    attribution:
                                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                }
                            ).addTo(mapInstanceRef.current)

                            // Add marker
                            markerRef.current = L.marker(
                                [coordinates[1], coordinates[0]],
                                {
                                    title: title || "Property Location",
                                }
                            ).addTo(mapInstanceRef.current)
                        } else if (mapInstanceRef.current) {
                            // Update existing map view and marker position
                            mapInstanceRef.current.setView(
                                [coordinates[1], coordinates[0]],
                                13
                            )
                            markerRef.current.setLatLng([
                                coordinates[1],
                                coordinates[0],
                            ])
                        }
                    } catch (error) {
                        console.error("Error initializing map:", error)
                    }
                }, 100)
            } catch (error) {
                console.error("Error loading map:", error)
            }
        }

        loadMap()

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
                markerRef.current = null
            }
            // Remove the CSS link
            if (linkEl.parentNode) {
                document.head.removeChild(linkEl)
            }
        }
    }, [coordinates, title])

    // If no coordinates, show placeholder
    if (!coordinates || !coordinates[0] || !coordinates[1]) {
        return (
            <div
                className="bg-secondary-50 rounded-xl flex items-center justify-center border border-secondary-100 overflow-hidden"
                style={{ height }}
            >
                <div className="text-center text-secondary-700 p-6">
                    <div className="bg-white p-3 rounded-full inline-block mb-4 shadow-sm">
                        <FaMapMarkerAlt
                            className="text-primary-500"
                            size={24}
                        />
                    </div>
                    <p className="font-medium mb-2">
                        Location information unavailable
                    </p>
                    <p className="text-sm">
                        The property location coordinates are not available.
                        This may happen if the host didn't set a location for
                        this property.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={mapRef}
            className="rounded-xl border border-secondary-100 overflow-hidden z-10"
            style={{ height }}
        ></div>
    )
}

LocationMap.propTypes = {
    coordinates: PropTypes.arrayOf(PropTypes.number),
    title: PropTypes.string,
    height: PropTypes.string,
}

export default LocationMap
