import PropTypes from "prop-types"

/**
 * Card component with consistent styling
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.interactive=false] - Whether the card has interactive hover effects
 * @param {boolean} [props.hoverable=false] - Whether the card has hover effects
 */
const Card = ({
    children,
    className = "",
    interactive = false,
    hoverable = false,
    ...props
}) => {
    // Combine all classes
    const cardClasses = [
        "card",
        hoverable ? "card-hover" : "",
        interactive ? "card-interactive" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ")

    return (
        <div className={cardClasses} {...props}>
            {children}
        </div>
    )
}

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    interactive: PropTypes.bool,
    hoverable: PropTypes.bool,
}

export default Card
