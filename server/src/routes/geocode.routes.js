import express from "express"
import axios from "axios"

const router = express.Router()

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
            // Parse coordinates from query
            let lat, lon

            // Check if q contains coordinates in format "lat,lon"
            if (q.includes(",")) {
                ;[lat, lon] = q
                    .split(",")
                    .map((coord) => parseFloat(coord.trim()))
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid coordinates format for reverse geocoding",
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
        res.status(500).json({
            success: false,
            message: "Error fetching geocoding data",
        })
    }
})

export default router
