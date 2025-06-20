import PropTypes from "prop-types"

/**
 * Badge component with consistent styling and variants
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
    // Base classes
    const baseClasses = "badge"

    // Variant classes
    const variantClasses = {
        primary: "badge-primary",
        secondary: "badge-secondary",
        accent: "badge-accent",
        success: "badge-success",
        warning: "badge-warning",
        danger: "badge-danger",
    }

    // Combine all classes
    const badgeClasses = [
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        className,
    ]
        .filter(Boolean)
        .join(" ")

    return (
        <span className={badgeClasses} {...props}>
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
