import mongoose from "mongoose"
import { User } from "../src/models/index.js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

/**
 * Script to create an admin user
 */
async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_URI)
        console.log("✅ Connected to MongoDB")

        // Check if admin user already exists
        const existingAdmin = await User.findOne({
            email: "admin@stayfinder.com",
        })
        if (existingAdmin) {
            console.log("❌ Admin user already exists")
            return
        }

        // Create admin user
        const adminUser = new User({
            name: "Admin User",
            email: "admin@stayfinder.com",
            password: "admin123456", // This will be hashed automatically
            role: "admin",
            isVerified: true,
        })

        await adminUser.save()
        console.log("✅ Admin user created successfully")
        console.log("📧 Email: admin@stayfinder.com")
        console.log("🔐 Password: admin123456")
        console.log("🚨 Please change the password after first login!")
    } catch (error) {
        console.error("❌ Error creating admin user:", error)
    } finally {
        // Close connection
        await mongoose.connection.close()
        console.log("🔒 Database connection closed")
    }
}

// Run the script
createAdminUser()
