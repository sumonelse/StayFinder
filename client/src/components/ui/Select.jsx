import React, { forwardRef } from "react"
import PropTypes from "prop-types"
import { FaChevronDown } from "react-icons/fa"

/**
 * Select component with consistent styling
 * Redesigned with Airbnb-style grey/black color scheme
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Select ID
 * @param {string} [props.label] - Select label
 * @param {Array} props.options - Select options array of objects with value and label
 * @param {string} [props.error] - Error message
 * @param {string} [props.hint] - Hint text
 * @param {boolean} [props.disabled=false] - Whether the select is disabled
 * @param {boolean} [props.required=false] - Whether the select is required
 * @param {string} [props.className] - Additional CSS classes
 */
const Select = forwardRef(
    (
        {
            id,
            label,
            options = [],
            error,
            hint,
            disabled = false,
            required = false,
            className = "",
            ...props
        },
        ref
    ) => {
        // Base classes for Airbnb-style selects
        const selectClasses = [
            "w-full px-3 py-2 border rounded-lg bg-secondary-50 text-secondary-900 appearance-none pr-10 transition-colors",
            error
                ? "border-red-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                : "border-secondary-300 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500",
            disabled ? "bg-secondary-100 cursor-not-allowed" : "",
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
                    <select
                        ref={ref}
                        id={id}
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
                        className={selectClasses}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-secondary-500">
                        <FaChevronDown size={14} />
                    </div>
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

Select.displayName = "Select"

Select.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    error: PropTypes.string,
    hint: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    className: PropTypes.string,
}

export default Select
