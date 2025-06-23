import BaseController from "./base.controller.js"
import { Property, Booking, User, Review } from "../models/index.js"

/**
 * Controller for admin-related routes
 */
class AdminController extends BaseController {
    /**
     * Get dashboard statistics
     * @route GET /api/admin/dashboard
     */
    async getDashboardStats(req, res) {
        try {
            const [
                totalProperties,
                pendingProperties,
                approvedProperties,
                totalBookings,
                pendingBookings,
                confirmedBookings,
                totalUsers,
                totalHosts,
                totalRevenue,
                recentBookings,
                recentProperties,
            ] = await Promise.all([
                Property.countDocuments(),
                Property.countDocuments({ isApproved: false }),
                Property.countDocuments({ isApproved: true }),
                Booking.countDocuments(),
                Booking.countDocuments({ status: "pending" }),
                Booking.countDocuments({ status: "confirmed" }),
                User.countDocuments({ role: { $in: ["user", "host"] } }),
                User.countDocuments({ role: "host" }),
                Booking.aggregate([
                    { $match: { status: "confirmed", paymentStatus: "paid" } },
                    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
                ]),
                Booking.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate("property", "title")
                    .populate("guest", "name email"),
                Property.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate("host", "name email"),
            ])

            const stats = {
                properties: {
                    total: totalProperties,
                    pending: pendingProperties,
                    approved: approvedProperties,
                },
                bookings: {
                    total: totalBookings,
                    pending: pendingBookings,
                    confirmed: confirmedBookings,
                },
                users: {
                    total: totalUsers,
                    hosts: totalHosts,
                },
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                },
                recent: {
                    bookings: recentBookings,
                    properties: recentProperties,
                },
            }

            return this.sendSuccess(res, stats)
        } catch (error) {
            return this.sendError(res, error.message, 500)
        }
    }

    /**
     * Get all properties with admin details
     * @route GET /api/admin/properties
     */
    async getProperties(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                search,
                sortBy = "createdAt",
                sortOrder = "desc",
            } = req.query

            // Build filter
            const filter = {}
            if (status === "pending") filter.isApproved = false
            if (status === "approved") filter.isApproved = true
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { "address.city": { $regex: search, $options: "i" } },
                    { "address.state": { $regex: search, $options: "i" } },
                ]
            }

            // Build sort
            const sort = {}
            sort[sortBy] = sortOrder === "desc" ? -1 : 1

            const skip = (Number(page) - 1) * Number(limit)
            const total = await Property.countDocuments(filter)

            const properties = await Property.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate("host", "name email profilePicture")
                .lean()

            return this.sendSuccess(res, {
                properties,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            })
        } catch (error) {
            return this.sendError(res, error.message, 500)
        }
    }

    /**
     * Approve or reject a property
     * @route PATCH /api/admin/properties/:id/approval
     */
    async updatePropertyApproval(req, res) {
        try {
            const { id } = req.params
            const { isApproved, rejectionReason } = req.body

            const property = await Property.findById(id)
            if (!property) {
                return this.sendError(res, "Property not found", 404)
            }

            property.isApproved = isApproved
            if (!isApproved && rejectionReason) {
                property.rejectionReason = rejectionReason
            }

            await property.save()

            return this.sendSuccess(
                res,
                { property },
                `Property ${isApproved ? "approved" : "rejected"} successfully`
            )
        } catch (error) {
            return this.sendError(res, error.message, 500)
        }
    }

    /**
     * Get all bookings with admin details
     * @route GET /api/admin/bookings
     */
    async getBookings(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                paymentStatus,
                search,
                sortBy = "createdAt",
                sortOrder = "desc",
            } = req.query

            // Build filter
            const filter = {}
            if (status) filter.status = status
            if (paymentStatus) filter.paymentStatus = paymentStatus

            // Build sort
            const sort = {}
            sort[sortBy] = sortOrder === "desc" ? -1 : 1

            const skip = (Number(page) - 1) * Number(limit)
            const total = await Booking.countDocuments(filter)

            let query = Booking.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate("property", "title address images")
                .populate("guest", "name email profilePicture")
                .populate("host", "name email profilePicture")

            // Add search functionality
            if (search) {
                const searchRegex = new RegExp(search, "i")
                const searchFilter = {
                    $or: [
                        { "property.title": searchRegex },
                        { "guest.name": searchRegex },
                        { "guest.email": searchRegex },
                        { "host.name": searchRegex },
                        { "host.email": searchRegex },
                    ],
                }
                query = query.find(searchFilter)
            }

            const bookings = await query

            return this.sendSuccess(res, {
                bookings,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            })
        } catch (error) {
            return this.sendError(res, error.message, 500)
        }
    }

    /**
     * Get all users with admin details
     * @route GET /api/admin/users
     */
    async getUsers(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                role,
                search,
                sortBy = "createdAt",
                sortOrder = "desc",
            } = req.query

            // Build filter
            const filter = { role: { $ne: "admin" } } // Exclude other admins
            if (role) filter.role = role
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ]
            }

            // Build sort
            const sort = {}
            sort[sortBy] = sortOrder === "desc" ? -1 : 1

            const skip = (Number(page) - 1) * Number(limit)
            const total = await User.countDocuments(filter)

            const users = await User.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .select("-password")
                .lean()

            // Add additional stats for each user
            const usersWithStats = await Promise.all(
                users.map(async (user) => {
                    const stats = {}
                    if (user.role === "host") {
                        stats.propertiesCount = await Property.countDocuments({
                            host: user._id,
                        })
                        stats.bookingsReceived = await Booking.countDocuments({
                            host: user._id,
                        })
                    } else {
                        stats.bookingsMade = await Booking.countDocuments({
                            guest: user._id,
                        })
                    }
                    return { ...user, stats }
                })
            )

            return this.sendSuccess(res, {
                users: usersWithStats,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            })
        } catch (error) {
            return this.sendError(res, error.message, 500)
        }
    }

    /**
     * Update user status (ban/unban)
     * @route PATCH /api/admin/users/:id/status
     */
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params
            const { isActive, reason } = req.body

            const user = await User.findById(id)
            if (!user) {
                return this.sendError(res, "User not found", 404)
            }

            if (user.role === "admin") {
                return this.sendError(res, "Cannot modify admin users", 403)
            }

            user.isActive = isActive
            if (!isActive && reason) {
                user.suspensionReason = reason
            }

            await user.save()

            return this.sendSuccess(
                res,
                { user: { ...user.toJSON(), password: undefined } },
                `User ${isActive ? "activated" : "suspended"} successfully`
            )
        } catch (error) {
            return this.sendError(res, error.message, 500)
        }
    }

    /**
     * Delete a property (admin only)
     * @route DELETE /api/admin/properties/:id
     */
    async deleteProperty(req, res) {
        try {
            const { id } = req.params

            const property = await Property.findById(id)
            if (!property) {
                return this.sendError(res, "Property not found", 404)
            }

            // Check if there are any active bookings
            const activeBookings = await Booking.countDocuments({
                property: id,
                status: { $in: ["pending", "confirmed"] },
                checkOutDate: { $gte: new Date() },
            })

            if (activeBookings > 0) {
                return this.sendError(
                    res,
                    "Cannot delete property with active bookings",
                    400
                )
            }

            await Property.findByIdAndDelete(id)

            return this.sendSuccess(res, {}, "Property deleted successfully")
        } catch (error) {
            return this.sendError(res, error.message, 500)
        }
    }

    /**
     * Get reviews with admin details
     * @route GET /api/admin/reviews
     */
    async getReviews(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = "createdAt",
                sortOrder = "desc",
            } = req.query

            // Build sort
            const sort = {}
            sort[sortBy] = sortOrder === "desc" ? -1 : 1

            const skip = (Number(page) - 1) * Number(limit)
            const total = await Review.countDocuments()

            const reviews = await Review.find()
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate("user", "name email profilePicture")
                .populate("property", "title address images")
                .populate("booking", "checkInDate checkOutDate")
                .lean()

            return this.sendSuccess(res, {
                reviews,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            })
        } catch (error) {
            return this.sendError(res, error.message, 500)
        }
    }

    /**
     * Delete a review (admin only)
     * @route DELETE /api/admin/reviews/:id
     */
    async deleteReview(req, res) {
        try {
            const { id } = req.params

            const review = await Review.findById(id)
            if (!review) {
                return this.sendError(res, "Review not found", 404)
            }

            await Review.findByIdAndDelete(id)

            return this.sendSuccess(res, {}, "Review deleted successfully")
        } catch (error) {
            return this.sendError(res, error.message, 500)
        }
    }
}

// Create and export a singleton instance
const adminController = new AdminController()

// Bind all methods to the instance to preserve 'this' context
Object.getOwnPropertyNames(AdminController.prototype)
    .filter((method) => method !== "constructor")
    .forEach((method) => {
        adminController[method] = adminController[method].bind(adminController)
    })

export default adminController
