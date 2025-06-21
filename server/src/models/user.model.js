import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
        },
        profilePicture: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ["user", "host", "admin"],
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Property",
            },
        ],

        // Password reset fields
        passwordResetToken: {
            type: String,
            default: null,
        },
        passwordResetExpires: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password
                return ret
            },
        },
    }
)

// Hash password before saving
userSchema.pre("save", async function (next) {
    // Only hash the password if it's modified or new
    if (!this.isModified("password")) return next()

    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("User", userSchema)

export default User
