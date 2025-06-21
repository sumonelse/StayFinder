import nodemailer from "nodemailer"

/**
 * Service for handling email notifications
 */
class NotificationService {
    constructor() {
        this.transporter = null
        this.isConfigured = false
        this.init()
    }

    /**
     * Initialize email transporter
     */
    init() {
        try {
            const {
                EMAIL_USER,
                EMAIL_PASS,
                EMAIL_SERVICE,
                EMAIL_HOST,
                EMAIL_PORT,
            } = process.env

            if (!EMAIL_USER || !EMAIL_PASS) {
                console.warn(
                    "⚠️  Email configuration missing. Email notifications disabled."
                )
                this.isConfigured = false
                return
            }

            // Parse port (env vars are strings)
            const port = EMAIL_PORT ? parseInt(EMAIL_PORT, 10) : 587
            const secure = port === 465 // true for 465, false otherwise

            this.transporter = nodemailer.createTransport({
                service: EMAIL_SERVICE || undefined,
                host: EMAIL_HOST || "smtp.gmail.com",
                port,
                secure,
                auth: {
                    user: EMAIL_USER,
                    pass: EMAIL_PASS, // App password if using Gmail
                },
                // recommended: auto-verify connection
                tls: {
                    rejectUnauthorized: false,
                },
            })

            // Verify connection configuration
            this.transporter.verify((err, success) => {
                if (err) {
                    console.error("❌ Email service verification failed:", err)
                    this.isConfigured = false
                } else {
                    console.log("✅ Email service configured and verified")
                    this.isConfigured = true
                }
            })
        } catch (error) {
            console.error("❌ Error configuring email service:", error.message)
            this.isConfigured = false
        }
    }

    /**
     * Send email
     * @param {Object} mailOptions - Email options
     */
    async sendEmail(mailOptions) {
        if (!this.isConfigured) {
            console.warn("Email service not configured. Skipping email send.")
            return { success: false, reason: "Email service not configured" }
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"StayFinder" <${process.env.EMAIL_USER}>`,
                ...mailOptions,
            })

            console.log("✅ Email sent successfully:", info.messageId)
            return { success: true, messageId: info.messageId }
        } catch (error) {
            console.error("❌ Error sending email:", error.message)
            return { success: false, error: error.message }
        }
    }

    /**
     * Send booking confirmation email to guest
     * @param {Object} booking - Booking object
     * @param {Object} property - Property object
     * @param {Object} guest - Guest object
     */
    async sendBookingConfirmation(booking, property, guest) {
        const checkInDate = new Date(booking.checkInDate).toLocaleDateString()
        const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString()

        const mailOptions = {
            to: guest.email,
            subject: "Booking Confirmation - StayFinder",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Booking Confirmed!</h2>
                    <p>Dear ${guest.name},</p>
                    <p>Your booking has been confirmed. Here are the details:</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #334155;">Booking Details</h3>
                        <p><strong>Property:</strong> ${property.title}</p>
                        <p><strong>Address:</strong> ${property.address.street}, ${property.address.city}, ${property.address.country}</p>
                        <p><strong>Check-in:</strong> ${checkInDate}</p>
                        <p><strong>Check-out:</strong> ${checkOutDate}</p>
                        <p><strong>Guests:</strong> ${booking.numberOfGuests}</p>
                        <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
                        <p><strong>Booking ID:</strong> ${booking._id}</p>
                    </div>
                    
                    ${
                        booking.specialRequests
                            ? `
                        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0; color: #92400e;">Special Requests</h4>
                            <p>${booking.specialRequests}</p>
                        </div>
                    `
                            : ""
                    }
                    
                    <p>We hope you have a wonderful stay!</p>
                    <p>Best regards,<br>The StayFinder Team</p>
                </div>
            `,
        }

        return await this.sendEmail(mailOptions)
    }

    /**
     * Send booking notification to host
     * @param {Object} booking - Booking object
     * @param {Object} property - Property object
     * @param {Object} host - Host object
     * @param {Object} guest - Guest object
     */
    async sendNewBookingNotification(booking, property, host, guest) {
        const checkInDate = new Date(booking.checkInDate).toLocaleDateString()
        const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString()

        const mailOptions = {
            to: host.email,
            subject: "New Booking Request - StayFinder",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">New Booking Request!</h2>
                    <p>Dear ${host.name},</p>
                    <p>You have received a new booking request for your property.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #334155;">Booking Details</h3>
                        <p><strong>Property:</strong> ${property.title}</p>
                        <p><strong>Guest:</strong> ${guest.name} (${guest.email})</p>
                        <p><strong>Check-in:</strong> ${checkInDate}</p>
                        <p><strong>Check-out:</strong> ${checkOutDate}</p>
                        <p><strong>Guests:</strong> ${booking.numberOfGuests}</p>
                        <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
                        <p><strong>Status:</strong> Pending Confirmation</p>
                    </div>
                    
                    ${
                        booking.specialRequests
                            ? `
                        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0; color: #92400e;">Special Requests</h4>
                            <p>${booking.specialRequests}</p>
                        </div>
                    `
                            : ""
                    }
                    
                    <p>Please log in to your dashboard to confirm or decline this booking.</p>
                    <p><a href="${process.env.FRONTEND_DOMAIN || "http://localhost:3000"}/host/bookings" 
                          style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                       View Booking
                    </a></p>
                    
                    <p>Best regards,<br>The StayFinder Team</p>
                </div>
            `,
        }

        return await this.sendEmail(mailOptions)
    }

    /**
     * Send booking cancellation email
     * @param {Object} booking - Booking object
     * @param {Object} property - Property object
     * @param {String} recipientEmail - Recipient email
     * @param {String} recipientName - Recipient name
     * @param {String} cancelledBy - Who cancelled the booking
     */
    async sendBookingCancellation(
        booking,
        property,
        recipientEmail,
        recipientName,
        cancelledBy
    ) {
        const checkInDate = new Date(booking.checkInDate).toLocaleDateString()
        const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString()

        const mailOptions = {
            to: recipientEmail,
            subject: "Booking Cancelled - StayFinder",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Booking Cancelled</h2>
                    <p>Dear ${recipientName},</p>
                    <p>Unfortunately, the following booking has been cancelled by the ${cancelledBy}.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #334155;">Cancelled Booking Details</h3>
                        <p><strong>Property:</strong> ${property.title}</p>
                        <p><strong>Check-in:</strong> ${checkInDate}</p>
                        <p><strong>Check-out:</strong> ${checkOutDate}</p>
                        <p><strong>Booking ID:</strong> ${booking._id}</p>
                        <p><strong>Cancellation Date:</strong> ${new Date(booking.cancelledAt).toLocaleDateString()}</p>
                    </div>
                    
                    ${
                        booking.cancellationReason
                            ? `
                        <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0; color: #b91c1c;">Cancellation Reason</h4>
                            <p>${booking.cancellationReason}</p>
                        </div>
                    `
                            : ""
                    }
                    
                    <p>If a refund is applicable, it will be processed according to our cancellation policy.</p>
                    <p>We apologize for any inconvenience this may cause.</p>
                    
                    <p>Best regards,<br>The StayFinder Team</p>
                </div>
            `,
        }

        return await this.sendEmail(mailOptions)
    }

    /**
     * Send password reset email
     * @param {String} email - User email
     * @param {String} name - User name
     * @param {String} resetToken - Password reset token
     */
    async sendPasswordReset(email, name, resetToken) {
        const resetUrl = `${process.env.FRONTEND_DOMAIN || "http://localhost:3000"}/reset-password?token=${resetToken}`

        const mailOptions = {
            to: email,
            subject: "Password Reset Request - StayFinder",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Password Reset Request</h2>
                    <p>Dear ${name},</p>
                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Reset Password
                        </a>
                    </p>
                    
                    <p>This link will expire in 1 hour for security reasons.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    
                    <p>Best regards,<br>The StayFinder Team</p>
                </div>
            `,
        }

        return await this.sendEmail(mailOptions)
    }

    /**
     * Send review notification to host
     * @param {Object} review - Review object
     * @param {Object} property - Property object
     * @param {Object} host - Host object
     * @param {Object} reviewer - Reviewer object
     */
    async sendReviewNotification(review, property, host, reviewer) {
        const mailOptions = {
            to: host.email,
            subject: "New Review for Your Property - StayFinder",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">New Review Received!</h2>
                    <p>Dear ${host.name},</p>
                    <p>Your property has received a new review.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #334155;">Review Details</h3>
                        <p><strong>Property:</strong> ${property.title}</p>
                        <p><strong>Reviewer:</strong> ${reviewer.name}</p>
                        <p><strong>Rating:</strong> ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} (${review.rating}/5)</p>
                        <p><strong>Date:</strong> ${new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #92400e;">Review Comment</h4>
                        <p>"${review.comment}"</p>
                    </div>
                    
                    <p>You can respond to this review from your host dashboard.</p>
                    <p><a href="${process.env.FRONTEND_DOMAIN || "http://localhost:3000"}/host/properties/${property._id}" 
                          style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                       View Review
                    </a></p>
                    
                    <p>Best regards,<br>The StayFinder Team</p>
                </div>
            `,
        }

        return await this.sendEmail(mailOptions)
    }
}

export default new NotificationService()
