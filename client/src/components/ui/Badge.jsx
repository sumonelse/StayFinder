import PropTypes from "prop-types"

/**
 * Badge component with consistent styling and variants
 * Redesigned with Airbnb-style grey/black color scheme
 *
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Badge variant (primary, secondary, accent, success, warning, danger)
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.icon] - Icon to display
 */
const Badge = ({
    variant = "primary",
    children,
    className = "",
    icon,
    ...props
}) => {
    // Variant classes with updated Airbnb-style colors
    const variantClasses = {
        primary:
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800",
        secondary:
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800",
        accent: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800",
        success:
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800",
        warning:
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
        danger: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800",
        dark: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-900 text-white",
        light: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-secondary-800 border border-secondary-200",
    }

    // Get the appropriate class based on variant
    const badgeClass = variantClasses[variant] || variantClasses.secondary

    // Combine with any additional classes
    const combinedClasses = `${badgeClass} ${className}`.trim()

    return (
        <span className={combinedClasses} {...props}>
            {icon && <span className="mr-1.5">{icon}</span>}
            {children}
        </span>
    )
}

Badge.propTypes = {
    variant: PropTypes.oneOf([
        "primary",
        "secondary",
        "accent",
        "success",
        "warning",
        "danger",
    ]),
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    icon: PropTypes.node,
}

export default Badge
