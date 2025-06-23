import express from "express"
import axios from "axios"

const router = express.Router()

/**
 * @route   GET /api/geocode/search
 * @desc    Proxy for Nominatim geocoding search and reverse geocoding
 * @access  Public
 */
/**
 * @route   GET /api/geocode/search
 * @desc    Proxy for Nominatim geocoding search and reverse geocoding
 * @access  Public
 */
router.get("/search", async (req, res) => {
    try {
        const { q, reverse } = req.query

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Query parameter 'q' is required",
            })
        }

        // Check if this is a reverse geocoding request (coordinates to address)
        if (reverse === "true") {
            // Parse and validate coordinates from query
            const coords = q.split(",").map((coord) => parseFloat(coord.trim()))

            if (coords.length !== 2 || coords.some(isNaN)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid coordinates format. Expected: 'lat,lon'",
                })
            }

            const [lat, lon] = coords

            // Validate coordinate ranges
            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Coordinates out of valid range. Latitude: -90 to 90, Longitude: -180 to 180",
                })
            }

            // Perform reverse geocoding
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse`,
                {
                    params: {
                        format: "json",
                        lat,
                        lon,
                        zoom: 18,
                        addressdetails: 1,
                    },
                    headers: {
                        "User-Agent": "StayFinder_App/1.0",
                    },
                }
            )

            return res.json(response.data)
        }

        // Regular forward geocoding (address to coordinates)
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search`,
            {
                params: {
                    format: "json",
                    q,
                    limit: 5,
                },
                headers: {
                    "User-Agent": "StayFinder_App/1.0",
                },
            }
        )

        res.json(response.data)
    } catch (error) {
        console.error("Geocoding proxy error:", error.message)

        // Handle specific axios errors
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: `External API error: ${error.response.statusText}`,
            })
        }

        // Handle network/timeout errors
        if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
            return res.status(503).json({
                success: false,
                message: "Geocoding service temporarily unavailable",
            })
        }

        // Generic error fallback
        res.status(500).json({
            success: false,
            message: "Error fetching geocoding data",
        })
    }
})

export default router
