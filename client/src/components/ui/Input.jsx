import React, { forwardRef } from "react"
import PropTypes from "prop-types"

/**
 * Input component with consistent styling and variants
 * Redesigned with Airbnb-style grey/black color scheme
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} [props.type='text'] - Input type
 * @param {string} [props.label] - Input label
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.error] - Error message
 * @param {string} [props.hint] - Hint text
 * @param {boolean} [props.disabled=false] - Whether the input is disabled
 * @param {boolean} [props.required=false] - Whether the input is required
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.leftIcon] - Icon to display on the left
 * @param {React.ReactNode} [props.rightIcon] - Icon to display on the right
 */
const Input = forwardRef(
    (
        {
            id,
            type = "text",
            label,
            placeholder,
            error,
            hint,
            disabled = false,
            required = false,
            className = "",
            leftIcon,
            rightIcon,
            ...props
        },
        ref
    ) => {
        // Base classes for Airbnb-style inputs
        const inputClasses = [
            "w-full px-3 py-2 border rounded-lg bg-secondary-50 text-secondary-900 placeholder-secondary-400 transition-colors",
            error
                ? "border-red-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                : "border-secondary-300 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500",
            disabled ? "bg-secondary-100 cursor-not-allowed" : "",
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            className,
        ]
            .filter(Boolean)
            .join(" ")

        return (
            <div className="mb-4">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-secondary-700 mb-1"
                    >
                        {label}
                        {required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-500">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={
                            error
                                ? `${id}-error`
                                : hint
                                ? `${id}-hint`
                                : undefined
                        }
                        className={inputClasses}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-secondary-500">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p
                        id={`${id}-error`}
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {hint && !error && (
                    <p
                        id={`${id}-hint`}
                        className="mt-1 text-sm text-secondary-500"
                    >
                        {hint}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = "Input"

Input.propTypes = {
    id: PropTypes.string.isRequired,
    type: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    hint: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    className: PropTypes.string,
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
}

export default Input
