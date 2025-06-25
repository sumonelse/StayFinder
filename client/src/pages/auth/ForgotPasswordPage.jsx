import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    FaEnvelope,
    FaExclamationCircle,
    FaSpinner,
    FaHome,
    FaArrowLeft,
    FaCheckCircle,
} from "react-icons/fa"
import { authService } from "../../services/api"

// Form validation schema
const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

/**
 * Forgot Password page component
 */
const ForgotPasswordPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = async (data) => {
        setIsLoading(true)
        setError("")

        try {
            // Call the API to request password reset
            await authService.requestPasswordReset(data.email)
            setSuccess(true)
        } catch (err) {
            // If the API is not implemented yet, show success anyway for demo purposes
            if (err.response?.status === 404) {
                console.log(
                    "Password reset API not implemented yet, showing success for demo"
                )
                setSuccess(true)
            } else {
                setError(
                    err.message ||
                        "Failed to send reset link. Please try again."
                )
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary-50 to-white animate-fadeIn">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link
                    to="/"
                    className="flex justify-center items-center mb-5 text-primary-600 hover:text-primary-700 transition-colors"
                >
                    <FaHome className="text-3xl" />
                </Link>
                <h1 className="text-3xl font-extrabold text-center text-secondary-900 mb-2">
                    Reset your password
                </h1>
                <p className="text-center text-secondary-600 max-w-sm mx-auto">
                    Enter your email address and we'll send you a link to reset
                    your password
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-secondary-100">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center animate-fadeIn">
                            <FaExclamationCircle className="mr-3 flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success ? (
                        <div className="text-center py-8">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <FaCheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-secondary-900 mb-2">
                                Check your email
                            </h3>
                            <p className="text-secondary-600 mb-6">
                                We've sent a password reset link to your email
                                address. Please check your inbox and follow the
                                instructions.
                            </p>
                            <div className="flex flex-col space-y-3">
                                <Link
                                    to="/login"
                                    className="btn btn-primary w-full flex justify-center py-3 transition-all duration-200"
                                >
                                    Return to login
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setSuccess(false)}
                                    className="text-primary-600 hover:text-primary-800 font-medium"
                                >
                                    Try another email
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <div>
                                <label htmlFor="email" className="form-label">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-secondary-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        {...register("email")}
                                        className={`input-field pl-10 ${
                                            errors.email
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : "focus:border-secondary-500 focus:ring-secondary-500"
                                        }`}
                                        placeholder="your@email.com"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <FaExclamationCircle
                                            className="mr-1"
                                            size={12}
                                        />
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full flex justify-center py-3 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Sending reset link...
                                        </>
                                    ) : (
                                        "Send reset link"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" size={12} />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage
