import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    FaEnvelope,
    FaLock,
    FaExclamationCircle,
    FaSpinner,
    FaHome,
    FaGoogle,
    FaFacebook,
    FaApple,
    FaEye,
    FaEyeSlash,
    FaSignInAlt,
    FaArrowRight,
} from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"

// Form validation schema
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

/**
 * Enhanced Login page component with modern UI
 */
const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [successMessage, setSuccessMessage] = useState(
        location.state?.message || ""
    )

    // Get the redirect path from location state or default to home
    const from = location.state?.from || "/"

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0)

        // Check if there's a remembered email
        const rememberedEmail = localStorage.getItem("rememberEmail")
        if (rememberedEmail) {
            setValue("email", rememberedEmail)
            setRememberMe(true)
        }

        // Clear success message after 5 seconds
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("")
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [])

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data) => {
        setIsLoading(true)
        setError("")
        try {
            await login(data.email, data.password)

            // Store remember me preference if selected
            if (rememberMe) {
                localStorage.setItem("rememberEmail", data.email)
            } else {
                localStorage.removeItem("rememberEmail")
            }

            navigate(from, { replace: true })
        } catch (err) {
            setError(
                err.message || "Login failed. Please check your credentials."
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialLogin = (provider) => {
        setError(`${provider} login will be available soon.`)
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
            {/* Left side - Image and branding */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-noise"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary-900 to-transparent"></div>
                </div>

                <div className="relative z-10">
                    <Link
                        to="/"
                        className="flex items-center text-white hover:text-primary-100 transition-colors"
                    >
                        <FaHome className="text-2xl mr-2" />
                        <span className="text-xl font-bold">StayFinder</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6 max-w-md">
                    <h1 className="text-4xl font-bold leading-tight">
                        Welcome back to your travel journey
                    </h1>
                    <p className="text-primary-100 text-lg">
                        Sign in to access your bookings, favorite properties,
                        and personalized travel recommendations.
                    </p>

                    <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl mt-8 shadow-lg">
                        <div className="text-white/90 mb-2 text-lg font-medium">
                            Continue Your Adventure
                        </div>
                        <p className="text-white/80 text-sm">
                            Pick up where you left off with your saved searches
                            and favorite properties.
                        </p>
                    </div>

                    <div className="flex space-x-2 pt-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="h-2 w-2 rounded-full bg-white opacity-60"
                            ></div>
                        ))}
                        <div className="h-2 w-8 rounded-full bg-white"></div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-primary-100">
                    &copy; {new Date().getFullYear()} StayFinder. All rights
                    reserved.
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 bg-white animate-fadeIn">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* Home icon removed to save space */}

                    <h2 className="text-3xl font-bold text-center text-secondary-900 mb-2">
                        Welcome back
                    </h2>
                    <p className="text-center text-secondary-600 mb-6">
                        Sign in to continue your journey with StayFinder
                    </p>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center animate-fadeIn">
                            <FaSignInAlt className="mr-3 flex-shrink-0 text-green-500" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center animate-fadeIn">
                            <FaExclamationCircle className="mr-3 flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
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
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="form-label"
                                >
                                    Password
                                </label>
                                <div className="text-sm">
                                    <Link
                                        to="/forgot-password"
                                        className="font-medium text-primary-600 hover:text-primary-500"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-secondary-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    {...register("password")}
                                    className={`input-field pl-10 pr-10 ${
                                        errors.password
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                            : "focus:border-secondary-500 focus:ring-secondary-500"
                                    }`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-500 hover:text-secondary-700"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <FaEyeSlash size={16} />
                                    ) : (
                                        <FaEye size={16} />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <FaExclamationCircle
                                        className="mr-1"
                                        size={12}
                                    />
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-sm text-secondary-700"
                            >
                                Remember me
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="btn btn-primary w-full flex justify-center py-3.5 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <FaArrowRight className="ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-secondary-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-secondary-500 font-medium">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("Google")}
                                className="w-full inline-flex justify-center py-3 px-4 border border-secondary-200 rounded-xl shadow-sm bg-white text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-all duration-200 hover:shadow-md"
                                aria-label="Sign in with Google"
                            >
                                <FaGoogle className="text-red-500" size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("Facebook")}
                                className="w-full inline-flex justify-center py-3 px-4 border border-secondary-200 rounded-xl shadow-sm bg-white text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-all duration-200 hover:shadow-md"
                                aria-label="Sign in with Facebook"
                            >
                                <FaFacebook
                                    className="text-primary-600"
                                    size={18}
                                />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("Apple")}
                                className="w-full inline-flex justify-center py-3 px-4 border border-secondary-200 rounded-xl shadow-sm bg-white text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-all duration-200 hover:shadow-md"
                                aria-label="Sign in with Apple"
                            >
                                <FaApple
                                    className="text-secondary-900"
                                    size={18}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <div className="py-3 px-4 bg-secondary-50 rounded-lg border border-secondary-100">
                            <p className="text-secondary-700">
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors inline-flex items-center"
                                >
                                    Sign up now
                                    <FaArrowRight className="ml-1 text-xs" />
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
