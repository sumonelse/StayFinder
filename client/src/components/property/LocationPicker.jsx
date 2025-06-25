import { useState, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa"
import api from "../../services/api/axios"

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
    const [isGettingCurrentLocation, setIsGettingCurrentLocation] =
        useState(false)

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

    // Get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }

        setIsGettingCurrentLocation(true)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords

                // Update map and marker
                if (markerRef.current && mapInstanceRef.current) {
                    markerRef.current.setLatLng([latitude, longitude])
                    mapInstanceRef.current.setView([latitude, longitude], 13)
                }

                // Set the new coordinates
                const newCoordinates = [longitude, latitude]
                setSelectedLocation({ coordinates: newCoordinates })

                // Notify parent component
                if (onLocationChange) {
                    onLocationChange({ coordinates: newCoordinates })
                }

                // Try to get address from coordinates (reverse geocoding)
                try {
                    const data = await api.get(`/geocode/search`, {
                        params: {
                            q: `${latitude},${longitude}`,
                            reverse: true,
                        },
                    })

                    if (data && data.display_name) {
                        setSearchQuery(data.display_name)
                    }
                } catch (error) {
                    console.error("Reverse geocoding error:", error)
                }

                setIsGettingCurrentLocation(false)
            },
            (error) => {
                console.error("Error getting current location:", error)
                alert(`Error getting your location: ${error.message}`)
                setIsGettingCurrentLocation(false)
            },
            { enableHighAccuracy: true }
        )
    }

    // Handle search
    const handleSearch = async (e) => {
        // Make sure to prevent default to avoid parent form submission
        e.preventDefault()
        e.stopPropagation() // Stop event propagation to parent forms

        if (!searchQuery.trim()) return

        setIsSearching(true)

        try {
            // Use Axios with our backend proxy for geocoding
            const data = await api.get(`/geocode/search`, {
                params: { q: searchQuery },
            })

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
                // Use Axios with our backend proxy for geocoding
                const data = await api.get(`/geocode/search`, {
                    params: { q: addressString },
                })

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
                {/* Use div instead of form to avoid nested form issues */}
                <div className="flex">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-secondary-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a location"
                            className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-l-md focus:outline-none focus:ring-secondary-500 focus:border-secondary-500"
                            onKeyDown={(e) => {
                                // Handle Enter key press
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleSearch(e)
                                }
                            }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                        disabled={isSearching}
                    >
                        {isSearching ? "Searching..." : "Search"}
                    </button>
                </div>

                {/* Current location button */}
                <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="mt-2 flex items-center justify-center px-4 py-2 border border-secondary-300 bg-secondary-50 rounded-md text-sm text-secondary-700 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 transition-colors w-full"
                    disabled={isGettingCurrentLocation}
                >
                    <FaMapMarkerAlt className="mr-2" />
                    {isGettingCurrentLocation
                        ? "Getting your location..."
                        : "Use my current location as property location"}
                </button>

                {/* Search results */}
                {geocodeResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-secondary-200 max-h-60 overflow-auto">
                        <ul className="py-1">
                            {geocodeResults.map((result) => (
                                <li
                                    key={result.place_id}
                                    className="px-4 py-2 hover:bg-secondary-100 cursor-pointer flex items-start"
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
                className="h-96 rounded-lg border border-secondary-300 shadow-sm"
                style={{ background: "#f0f0f0" }}
            >
                {!isMapLoaded && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-secondary-500">Loading map...</p>
                    </div>
                )}
            </div>

            {/* Selected coordinates display */}
            <div className="bg-secondary-50 p-3 rounded-md border border-secondary-200">
                <p className="text-sm text-secondary-700 font-medium">
                    Selected coordinates:
                </p>
                <p className="text-secondary-900">
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
