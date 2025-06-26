import PropTypes from "prop-types"

/**
 * Button component with consistent styling and variants
 * Redesigned with Airbnb-style grey/black color scheme
 *
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button variant (primary, secondary, dark, outline, ghost, accent, danger)
 * @param {string} [props.size='md'] - Button size (sm, md, lg)
 * @param {boolean} [props.fullWidth=false] - Whether the button should take full width
 * @param {boolean} [props.isLoading=false] - Whether the button is in loading state
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.leftIcon] - Icon to display on the left
 * @param {React.ReactNode} [props.rightIcon] - Icon to display on the right
 */
const Button = ({
    variant = "primary",
    size = "md",
    fullWidth = false,
    isLoading = false,
    disabled = false,
    children,
    className = "",
    leftIcon,
    rightIcon,
    type = "button",
    ...props
}) => {
    // Variant classes with updated Airbnb-style colors
    const variantClasses = {
        primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-sm",
        secondary:
            "bg-secondary-100 text-secondary-700 hover:bg-secondary-200 shadow-sm",
        dark: "bg-secondary-900 text-white hover:bg-secondary-800 shadow-sm",
        outline:
            "border border-secondary-300 text-secondary-700 hover:bg-secondary-50",
        ghost: "text-secondary-700 hover:bg-secondary-50",
        accent: "bg-accent-500 text-white hover:bg-accent-600 shadow-sm",
        danger: "bg-danger-600 text-white hover:bg-danger-700 shadow-sm",
    }

    // Size classes
    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
    }

    // Base classes
    const baseClasses =
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none"

    // Width classes
    const widthClasses = fullWidth ? "w-full" : ""

    // Disabled classes
    const disabledClasses =
        disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""

    // Combine all classes
    const buttonClasses = [
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        widthClasses,
        disabledClasses,
        className,
    ]
        .filter(Boolean)
        .join(" ")

    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <span className="mr-2">
                    <svg
                        className="animate-spin h-4 w-4 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                </span>
            )}

            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            <span>{children}</span>
            {!isLoading && rightIcon && (
                <span className="ml-2">{rightIcon}</span>
            )}
        </button>
    )
}

Button.propTypes = {
    variant: PropTypes.oneOf([
        "primary",
        "secondary",
        "dark",
        "outline",
        "ghost",
        "accent",
        "danger",
    ]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    fullWidth: PropTypes.bool,
    isLoading: PropTypes.bool,
    disabled: PropTypes.bool,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
    type: PropTypes.oneOf(["button", "submit", "reset"]),
}

export default Button
