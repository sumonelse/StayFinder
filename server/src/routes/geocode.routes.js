import express from "express"
import axios from "axios"

const router = express.Router()

/**
 * @route   GET /api/geocode/search
 * @desc    Proxy for Nominatim geocoding search
 * @access  Public
 */
router.get("/search", async (req, res) => {
    try {
        const { q } = req.query

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Query parameter 'q' is required",
            })
        }

        // Add a user agent as required by Nominatim's usage policy
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
