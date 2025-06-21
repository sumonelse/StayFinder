import { useState, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa"

/**
 * Map component for selecting property location
 * Uses Leaflet for map functionality
 */
const LocationPicker = ({
    initialLocation = { coordinates: [0, 0] },
    onLocationChange,
    address = {},
}) => {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerRef = useRef(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState(initialLocation)
    const [geocodeResults, setGeocodeResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    // Initialize map when component mounts
    useEffect(() => {
        // Load Leaflet CSS
        const linkEl = document.createElement("link")
        linkEl.rel = "stylesheet"
        linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(linkEl)

        // Load Leaflet JS
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        script.crossOrigin = ""
        script.onload = () => setIsMapLoaded(true)
        document.head.appendChild(script)

        return () => {
            document.head.removeChild(linkEl)
            document.head.removeChild(script)
        }
    }, [])

    // Initialize map once Leaflet is loaded
    useEffect(() => {
        if (!isMapLoaded || !mapRef.current) return

        const L = window.L
        if (!L) return

        // Get initial coordinates
        const [lng, lat] = initialLocation.coordinates || [0, 0]

        // Create map instance
        const map = L.map(mapRef.current).setView([lat, lng], 13)

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        // Add marker at initial position
        const marker = L.marker([lat, lng], {
            draggable: true,
        }).addTo(map)

        // Update coordinates when marker is dragged
        marker.on("dragend", function (e) {
            const position = marker.getLatLng()
            const newCoordinates = [position.lng, position.lat]
            setSelectedLocation({ coordinates: newCoordinates })
            if (onLocationChange) {
                onLocationChange({ coordinates: newCoordinates })
            }
        })

        // Update coordinates when map is clicked
        map.on("click", function (e) {
            marker.setLatLng(e.latlng)
            const newCoordinates = [e.latlng.lng, e.latlng.lat]
            setSelectedLocation({ coordinates: newCoordinates })
            if (onLocationChange) {
                onLocationChange({ coordinates: newCoordinates })
            }
        })

        // Store refs for cleanup
        mapInstanceRef.current = map
        markerRef.current = marker

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
                markerRef.current = null
            }
        }
    }, [isMapLoaded, initialLocation, onLocationChange])

    // Update marker position when initialLocation changes
    useEffect(() => {
        if (!markerRef.current || !mapInstanceRef.current) return

        const [lng, lat] = initialLocation.coordinates || [0, 0]
        markerRef.current.setLatLng([lat, lng])
        mapInstanceRef.current.setView([lat, lng], 13)
    }, [initialLocation])

    // Handle search
    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)

        try {
            // Use Nominatim for geocoding (free OpenStreetMap geocoding service)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery
                )}`
            )
            const data = await response.json()

            setGeocodeResults(data)
            setIsSearching(false)

            // If we got results, center the map on the first one
            if (data.length > 0) {
                const result = data[0]
                const newCoordinates = [
                    parseFloat(result.lon),
                    parseFloat(result.lat),
                ]

                if (markerRef.current && mapInstanceRef.current) {
                    markerRef.current.setLatLng([result.lat, result.lon])
                    mapInstanceRef.current.setView([result.lat, result.lon], 13)
                }

                setSelectedLocation({ coordinates: newCoordinates })
                if (onLocationChange) {
                    onLocationChange({ coordinates: newCoordinates })
                }
            }
        } catch (error) {
            console.error("Geocoding error:", error)
            setIsSearching(false)
        }
    }

    // Handle selecting a search result
    const handleSelectLocation = (result) => {
        const newCoordinates = [parseFloat(result.lon), parseFloat(result.lat)]

        if (markerRef.current && mapInstanceRef.current) {
            markerRef.current.setLatLng([result.lat, result.lon])
            mapInstanceRef.current.setView([result.lat, result.lon], 13)
        }

        setSelectedLocation({ coordinates: newCoordinates })
        setGeocodeResults([])
        setSearchQuery("")

        if (onLocationChange) {
            onLocationChange({ coordinates: newCoordinates })
        }
    }

    // Try to geocode the address when it changes
    useEffect(() => {
        const geocodeAddress = async () => {
            if (
                !address ||
                !address.street ||
                !address.city ||
                !address.country
            )
                return

            const addressString = `${address.street}, ${address.city}, ${
                address.state || ""
            }, ${address.country}`
            setSearchQuery(addressString)

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        addressString
                    )}`
                )
                const data = await response.json()

                if (data.length > 0) {
                    const result = data[0]
                    const newCoordinates = [
                        parseFloat(result.lon),
                        parseFloat(result.lat),
                    ]

                    if (markerRef.current && mapInstanceRef.current) {
                        markerRef.current.setLatLng([result.lat, result.lon])
                        mapInstanceRef.current.setView(
                            [result.lat, result.lon],
                            13
                        )
                    }

                    setSelectedLocation({ coordinates: newCoordinates })
                    if (onLocationChange) {
                        onLocationChange({ coordinates: newCoordinates })
                    }
                }
            } catch (error) {
                console.error("Address geocoding error:", error)
            }
        }

        geocodeAddress()
    }, [address, onLocationChange])

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-2">
                <form onSubmit={handleSearch} className="flex">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a location"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        disabled={isSearching}
                    >
                        {isSearching ? "Searching..." : "Search"}
                    </button>
                </form>

                {/* Search results */}
                {geocodeResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                        <ul className="py-1">
                            {geocodeResults.map((result) => (
                                <li
                                    key={result.place_id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                                    onClick={() => handleSelectLocation(result)}
                                >
                                    <FaMapMarkerAlt className="text-primary-500 mt-1 mr-2 flex-shrink-0" />
                                    <span>{result.display_name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Map container */}
            <div
                ref={mapRef}
                className="h-96 rounded-lg border border-gray-300 shadow-sm"
                style={{ background: "#f0f0f0" }}
            >
                {!isMapLoaded && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">Loading map...</p>
                    </div>
                )}
            </div>

            {/* Selected coordinates display */}
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="text-sm text-gray-700 font-medium">
                    Selected coordinates:
                </p>
                <p className="text-gray-900">
                    Longitude: {selectedLocation.coordinates[0].toFixed(6)},
                    Latitude: {selectedLocation.coordinates[1].toFixed(6)}
                </p>
            </div>
        </div>
    )
}

LocationPicker.propTypes = {
    initialLocation: PropTypes.shape({
        coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
    }),
    onLocationChange: PropTypes.func.isRequired,
    address: PropTypes.shape({
        street: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        country: PropTypes.string,
        zipCode: PropTypes.string,
    }),
}

export default LocationPicker
