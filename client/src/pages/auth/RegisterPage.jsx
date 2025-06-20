import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaPhone,
    FaExclamationCircle,
    FaSpinner,
    FaHome,
    FaGoogle,
    FaFacebook,
    FaApple,
    FaUserTie,
    FaCheck,
    FaInfoCircle,
    FaEye,
    FaEyeSlash,
    FaUserPlus,
    FaArrowRight,
    FaArrowLeft,
} from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"

// Form validation schema with stronger validation
const registerSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter"
            )
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(
                /[^A-Za-z0-9]/,
                "Password must contain at least one special character"
            ),
        confirmPassword: z.string(),
        phone: z.string().optional(),
        role: z.enum(["user", "host"]),
        agreeToTerms: z.boolean().refine((val) => val === true, {
            message:
                "You must agree to the Terms of Service and Privacy Policy",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

/**
 * Enhanced Registration page component with modern UI and improved UX
 */
const RegisterPage = () => {
    const { register: registerUser } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [registrationStep, setRegistrationStep] = useState(1)

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Check password strength
    const checkPasswordStrength = (password) => {
        if (!password) {
            setPasswordStrength(0)
            return
        }

        let score = 0
        if (password.length >= 8) score += 1
        if (/[A-Z]/.test(password)) score += 1
        if (/[0-9]/.test(password)) score += 1
        if (/[^A-Za-z0-9]/.test(password)) score += 1
        setPasswordStrength(score)
    }

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            role: "user",
            agreeToTerms: false,
        },
        mode: "onChange",
    })

    // Watch for password changes to update strength meter
    const watchPassword = watch("password")
    useEffect(() => {
        checkPasswordStrength(watchPassword)
    }, [watchPassword])

    const handleNextStep = async () => {
        // Validate current step fields
        let isStepValid = false

        if (registrationStep === 1) {
            isStepValid = await trigger(["name", "email", "phone"])
        } else if (registrationStep === 2) {
            isStepValid = await trigger(["password", "confirmPassword"])
        }

        if (isStepValid) {
            setRegistrationStep((prev) => prev + 1)
        }
    }

    const handlePrevStep = () => {
        setRegistrationStep((prev) => prev - 1)
    }

    const onSubmit = async (data) => {
        setIsLoading(true)
        setError("")

        try {
            // Remove confirmPassword and agreeToTerms before sending to API
            const { confirmPassword, agreeToTerms, ...userData } = data
            await registerUser(userData)
            navigate("/login", {
                state: {
                    registrationSuccess: true,
                    message: "Account created successfully! Please sign in.",
                },
            })
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialSignup = (provider) => {
        setError(`${provider} signup will be available soon.`)
    }

    // Render step indicators
    const renderStepIndicator = () => (
        <div className="flex justify-center mb-6">
            <div className="flex items-center">
                {[1, 2, 3].map((step) => (
                    <React.Fragment key={step}>
                        {step > 1 && (
                            <div
                                className={`w-12 h-1 ${
                                    registrationStep >= step
                                        ? "bg-primary-600"
                                        : "bg-secondary-200"
                                }`}
                            ></div>
                        )}
                        <div
                            className={`flex items-center justify-center w-9 h-9 rounded-full ${
                                registrationStep > step
                                    ? "bg-primary-600 text-white shadow-md"
                                    : registrationStep === step
                                    ? "bg-primary-500 text-white ring-2 ring-primary-100 shadow-md"
                                    : "bg-secondary-100 text-secondary-600"
                            } transition-all duration-300`}
                        >
                            {registrationStep > step ? (
                                <FaCheck size={12} />
                            ) : (
                                <span className="text-sm font-medium">
                                    {step}
                                </span>
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )

    // Render form steps
    const renderFormStep = () => {
        switch (registrationStep) {
            case 1:
                return (
                    <>
                        <div>
                            <label htmlFor="name" className="form-label">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="text-secondary-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    {...register("name")}
                                    className={`input-field pl-10 ${
                                        errors.name
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                            : ""
                                    }`}
                                    placeholder="John Doe"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <FaExclamationCircle
                                        className="mr-1"
                                        size={12}
                                    />
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

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
                                            : ""
                                    }`}
                                    placeholder="your@email.com"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <FaExclamationCircle
                                        className="mr-1"
                                        size={12}
                                    />
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="phone"
                                className="form-label flex items-center"
                            >
                                Phone Number
                                <span className="ml-1 text-secondary-500 text-xs">
                                    (Optional)
                                </span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaPhone className="text-secondary-400" />
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    {...register("phone")}
                                    className="input-field pl-10"
                                    placeholder="+1 (123) 456-7890"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="btn btn-primary w-full py-2.5 flex items-center justify-center"
                            >
                                Continue
                                <FaArrowRight className="ml-2" />
                            </button>
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-secondary-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-secondary-500">
                                        Or sign up with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-3 gap-3">
                                {["Google", "Facebook", "Apple"].map(
                                    (provider) => (
                                        <button
                                            key={provider}
                                            type="button"
                                            onClick={() =>
                                                handleSocialSignup(provider)
                                            }
                                            className="inline-flex justify-center py-2.5 px-4 border border-secondary-200 rounded-lg shadow-sm bg-white hover:bg-secondary-50 transition-all duration-200 hover:shadow"
                                            aria-label={`Sign up with ${provider}`}
                                        >
                                            {provider === "Google" && (
                                                <FaGoogle className="text-red-500" />
                                            )}
                                            {provider === "Facebook" && (
                                                <FaFacebook className="text-primary-600" />
                                            )}
                                            {provider === "Apple" && (
                                                <FaApple className="text-secondary-900" />
                                            )}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </>
                )

            case 2:
                return (
                    <>
                        <div>
                            <label htmlFor="password" className="form-label">
                                Create Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-secondary-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    className={`input-field pl-10 pr-10 ${
                                        errors.password
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                            : ""
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

                            {/* Password strength indicator */}
                            <div className="mt-3">
                                <div className="flex items-center mb-2">
                                    <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${
                                                passwordStrength === 0
                                                    ? "bg-secondary-200"
                                                    : passwordStrength === 1
                                                    ? "bg-red-500"
                                                    : passwordStrength === 2
                                                    ? "bg-yellow-500"
                                                    : passwordStrength === 3
                                                    ? "bg-green-500"
                                                    : "bg-green-600"
                                            }`}
                                            style={{
                                                width: `${
                                                    passwordStrength * 25
                                                }%`,
                                            }}
                                        ></div>
                                    </div>
                                    <span className="ml-3 text-xs font-medium text-secondary-600 min-w-[3rem] text-right">
                                        {passwordStrength === 0
                                            ? "Weak"
                                            : passwordStrength === 1
                                            ? "Weak"
                                            : passwordStrength === 2
                                            ? "Fair"
                                            : passwordStrength === 3
                                            ? "Good"
                                            : "Strong"}
                                    </span>
                                </div>

                                <div className="bg-secondary-50 p-2.5 rounded-lg border border-secondary-100 mt-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div
                                            className={`text-xs flex items-center ${
                                                /[A-Z]/.test(watchPassword)
                                                    ? "text-green-600"
                                                    : "text-secondary-600"
                                            }`}
                                        >
                                            {/[A-Z]/.test(watchPassword) ? (
                                                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                                    <FaCheck size={8} />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center mr-2">
                                                    <FaInfoCircle size={8} />
                                                </div>
                                            )}
                                            Uppercase letter
                                        </div>
                                        <div
                                            className={`text-xs flex items-center ${
                                                /[0-9]/.test(watchPassword)
                                                    ? "text-green-600"
                                                    : "text-secondary-600"
                                            }`}
                                        >
                                            {/[0-9]/.test(watchPassword) ? (
                                                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                                    <FaCheck size={8} />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center mr-2">
                                                    <FaInfoCircle size={8} />
                                                </div>
                                            )}
                                            Number
                                        </div>
                                        <div
                                            className={`text-xs flex items-center ${
                                                watchPassword.length >= 8
                                                    ? "text-green-600"
                                                    : "text-secondary-600"
                                            }`}
                                        >
                                            {watchPassword.length >= 8 ? (
                                                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                                    <FaCheck size={8} />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center mr-2">
                                                    <FaInfoCircle size={8} />
                                                </div>
                                            )}
                                            8+ characters
                                        </div>
                                        <div
                                            className={`text-xs flex items-center ${
                                                /[^A-Za-z0-9]/.test(
                                                    watchPassword
                                                )
                                                    ? "text-green-600"
                                                    : "text-secondary-600"
                                            }`}
                                        >
                                            {/[^A-Za-z0-9]/.test(
                                                watchPassword
                                            ) ? (
                                                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                                    <FaCheck size={8} />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center mr-2">
                                                    <FaInfoCircle size={8} />
                                                </div>
                                            )}
                                            Special character
                                        </div>
                                    </div>
                                </div>
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

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="form-label"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-secondary-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    {...register("confirmPassword")}
                                    className={`input-field pl-10 pr-10 ${
                                        errors.confirmPassword
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                            : ""
                                    }`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-500 hover:text-secondary-700"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <FaEyeSlash size={16} />
                                    ) : (
                                        <FaEye size={16} />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <FaExclamationCircle
                                        className="mr-1"
                                        size={12}
                                    />
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-between pt-4 space-x-3">
                            <button
                                type="button"
                                onClick={handlePrevStep}
                                className="btn btn-secondary w-1/2 py-2.5 flex items-center justify-center"
                            >
                                <FaArrowLeft className="mr-2" />
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="btn btn-primary w-1/2 py-2.5 flex items-center justify-center"
                            >
                                Continue
                                <FaArrowRight className="ml-2" />
                            </button>
                        </div>
                    </>
                )

            case 3:
                return (
                    <>
                        <div>
                            <label className="form-label">Account Type</label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                {[
                                    {
                                        id: "user",
                                        label: "Guest",
                                        icon: FaUser,
                                        desc: "I want to book stays",
                                    },
                                    {
                                        id: "host",
                                        label: "Host",
                                        icon: FaUserTie,
                                        desc: "I want to rent my property",
                                    },
                                ].map((role) => (
                                    <div
                                        key={role.id}
                                        className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                                            watch("role") === role.id
                                                ? "border-primary-500 bg-primary-50 shadow-md"
                                                : "border-secondary-200 hover:bg-secondary-50 hover:shadow"
                                        }`}
                                    >
                                        <input
                                            id={`${role.id}-role`}
                                            type="radio"
                                            value={role.id}
                                            {...register("role")}
                                            className="sr-only"
                                            disabled={isLoading}
                                        />
                                        <label
                                            htmlFor={`${role.id}-role`}
                                            className="flex flex-col items-center cursor-pointer"
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                                                    watch("role") === role.id
                                                        ? "bg-primary-100"
                                                        : "bg-secondary-100"
                                                }`}
                                            >
                                                <role.icon
                                                    className={`text-xl ${
                                                        watch("role") ===
                                                        role.id
                                                            ? "text-primary-600"
                                                            : "text-secondary-500"
                                                    }`}
                                                    size={20}
                                                />
                                            </div>
                                            <span
                                                className={`font-medium ${
                                                    watch("role") === role.id
                                                        ? "text-primary-700"
                                                        : "text-secondary-700"
                                                }`}
                                            >
                                                {role.label}
                                            </span>
                                            <span className="text-xs text-secondary-500 mt-1 text-center">
                                                {role.desc}
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start mt-6 bg-secondary-50 p-3 rounded-lg border border-secondary-200">
                            <div className="flex items-center h-5 pt-0.5">
                                <input
                                    id="agreeToTerms"
                                    type="checkbox"
                                    {...register("agreeToTerms")}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label
                                    htmlFor="agreeToTerms"
                                    className="text-secondary-700"
                                >
                                    I agree to the{" "}
                                    <Link
                                        to="/terms"
                                        className="font-medium text-primary-600 hover:text-primary-500"
                                    >
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link
                                        to="/privacy"
                                        className="font-medium text-primary-600 hover:text-primary-500"
                                    >
                                        Privacy Policy
                                    </Link>
                                </label>
                                {errors.agreeToTerms && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.agreeToTerms.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between pt-6 space-x-3">
                            <button
                                type="button"
                                onClick={handlePrevStep}
                                className="btn btn-secondary w-1/2 py-2.5 flex items-center justify-center"
                            >
                                <FaArrowLeft className="mr-2" />
                                Back
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary w-1/2 flex justify-center py-2.5"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus className="mr-2" />
                                        Create account
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
            {/* Left side - Form */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-6 bg-white">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* Home icon removed to save space */}

                    <h1 className="text-2xl font-bold text-center text-secondary-900 mb-1">
                        Create your account
                    </h1>
                    <p className="text-center text-secondary-600 text-sm max-w-sm mx-auto mb-4">
                        Join StayFinder to discover amazing properties
                    </p>

                    {renderStepIndicator()}
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center text-sm animate-fadeIn">
                            <FaExclamationCircle className="mr-2 flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {renderFormStep()}
                    </form>

                    <div className="mt-5 text-center">
                        <div className="py-3 px-4 bg-secondary-50 rounded-lg border border-secondary-100">
                            <p className="text-secondary-700">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors inline-flex items-center"
                                >
                                    Sign in
                                    <FaArrowRight className="ml-1 text-xs" />
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Image and branding */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 text-white p-8 flex-col justify-between relative overflow-hidden">
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
                        Start your journey with us
                    </h1>
                    <p className="text-primary-100 text-lg">
                        Create an account to discover amazing properties, save
                        your favorites, and book your next stay with ease.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl shadow-lg">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                                    <FaUser className="text-white" size={14} />
                                </div>
                                <div className="text-white/90 text-lg font-medium">
                                    Find Perfect Stays
                                </div>
                            </div>
                            <p className="text-white/80 text-sm">
                                Access thousands of properties worldwide
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl shadow-lg">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                                    <FaHome className="text-white" size={14} />
                                </div>
                                <div className="text-white/90 text-lg font-medium">
                                    Host Your Space
                                </div>
                            </div>
                            <p className="text-white/80 text-sm">
                                Earn by sharing your property with travelers
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-primary-100">
                    &copy; {new Date().getFullYear()} StayFinder. All rights
                    reserved.
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
