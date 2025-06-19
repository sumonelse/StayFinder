import React, { useState, useRef, useEffect } from "react"
import PropTypes from "prop-types"
import {
    FaCalendarAlt,
    FaChevronLeft,
    FaChevronRight,
    FaTimes,
} from "react-icons/fa"

/**
 * DatePicker component with accessible design
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} [props.label] - Input label
 * @param {string} [props.value] - Selected date in YYYY-MM-DD format
 * @param {Function} props.onChange - Function called when date changes
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.error] - Error message
 * @param {string} [props.hint] - Hint text
 * @param {boolean} [props.disabled=false] - Whether the input is disabled
 * @param {boolean} [props.required=false] - Whether the input is required
 * @param {string} [props.minDate] - Minimum selectable date in YYYY-MM-DD format
 * @param {string} [props.maxDate] - Maximum selectable date in YYYY-MM-DD format
 */
const DatePicker = ({
    id,
    label,
    value,
    onChange,
    placeholder = "Select date",
    error,
    hint,
    disabled = false,
    required = false,
    minDate,
    maxDate,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(
        value ? new Date(value) : new Date()
    )
    const [inputValue, setInputValue] = useState(
        value ? formatDateForDisplay(new Date(value)) : ""
    )

    const datePickerRef = useRef(null)
    const inputRef = useRef(null)

    // Close datepicker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Format date as YYYY-MM-DD
    function formatDateForValue(date) {
        return date.toISOString().split("T")[0]
    }

    // Format date for display (e.g., Jan 1, 2023)
    function formatDateForDisplay(date) {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    // Handle date selection
    function handleDateSelect(date) {
        const formattedDate = formatDateForValue(date)
        setInputValue(formatDateForDisplay(date))
        onChange(formattedDate)
        setIsOpen(false)
    }

    // Handle input change
    function handleInputChange(e) {
        setInputValue(e.target.value)

        // Try to parse the date
        const parsedDate = new Date(e.target.value)
        if (!isNaN(parsedDate.getTime())) {
            onChange(formatDateForValue(parsedDate))
            setCurrentMonth(parsedDate)
        }
    }

    // Clear the date
    function handleClear() {
        setInputValue("")
        onChange("")
    }

    // Navigate to previous month
    function prevMonth() {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        )
    }

    // Navigate to next month
    function nextMonth() {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        )
    }

    // Get days in month
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate()
    }

    // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
    function getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay()
    }

    // Check if date is selectable
    function isDateSelectable(date) {
        if (disabled) return false

        const dateValue = formatDateForValue(date)

        if (minDate && dateValue < minDate) return false
        if (maxDate && dateValue > maxDate) return false

        return true
    }

    // Check if date is selected
    function isDateSelected(date) {
        return value === formatDateForValue(date)
    }

    // Check if date is today
    function isToday(date) {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    // Render calendar days
    function renderCalendarDays() {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const daysInMonth = getDaysInMonth(year, month)
        const firstDayOfMonth = getFirstDayOfMonth(year, month)

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>)
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const selectable = isDateSelectable(date)
            const selected = isDateSelected(date)
            const today = isToday(date)

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => selectable && handleDateSelect(date)}
                    disabled={!selectable}
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm focus:outline-none ${
                        selected
                            ? "bg-primary-600 text-white font-medium"
                            : today
                            ? "bg-primary-50 text-primary-700 font-medium"
                            : selectable
                            ? "hover:bg-secondary-100"
                            : "text-secondary-300 cursor-not-allowed"
                    }`}
                    aria-label={date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    })}
                    aria-selected={selected}
                >
                    {day}
                </button>
            )
        }

        return days
    }

    // Base classes
    const inputClasses = [
        "input-field pr-10",
        error ? "input-error" : "",
        "cursor-pointer",
    ]
        .filter(Boolean)
        .join(" ")

    return (
        <div className="form-group" ref={datePickerRef}>
            {label && (
                <label htmlFor={id} className="form-label">
                    {label}
                    {required && (
                        <span className="text-danger-500 ml-1">*</span>
                    )}
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onClick={() => !disabled && setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={
                        error ? `${id}-error` : hint ? `${id}-hint` : undefined
                    }
                    className={inputClasses}
                    readOnly
                    {...props}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-secondary-500">
                    <FaCalendarAlt />
                </div>

                {inputValue && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-8 text-secondary-400 hover:text-secondary-600"
                        onClick={handleClear}
                        aria-label="Clear date"
                    >
                        <FaTimes />
                    </button>
                )}

                {isOpen && (
                    <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-secondary-200 p-4 w-72">
                        {/* Calendar header */}
                        <div className="flex justify-between items-center mb-4">
                            <button
                                type="button"
                                onClick={prevMonth}
                                className="p-1 rounded-full hover:bg-secondary-100 text-secondary-600"
                                aria-label="Previous month"
                            >
                                <FaChevronLeft />
                            </button>

                            <h3 className="font-medium text-secondary-900">
                                {currentMonth.toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </h3>

                            <button
                                type="button"
                                onClick={nextMonth}
                                className="p-1 rounded-full hover:bg-secondary-100 text-secondary-600"
                                aria-label="Next month"
                            >
                                <FaChevronRight />
                            </button>
                        </div>

                        {/* Day names */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                                (day) => (
                                    <div
                                        key={day}
                                        className="h-9 flex items-center justify-center text-xs font-medium text-secondary-500"
                                    >
                                        {day}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7 gap-1">
                            {renderCalendarDays()}
                        </div>

                        {/* Today button */}
                        <div className="mt-4 pt-2 border-t border-secondary-100 flex justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date()
                                    if (isDateSelectable(today)) {
                                        handleDateSelect(today)
                                    }
                                }}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                disabled={!isDateSelectable(new Date())}
                            >
                                Today
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-secondary-600 hover:text-secondary-700 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p id={`${id}-error`} className="form-error" role="alert">
                    {error}
                </p>
            )}

            {hint && !error && (
                <p id={`${id}-hint`} className="form-hint">
                    {hint}
                </p>
            )}
        </div>
    )
}

DatePicker.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    hint: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    minDate: PropTypes.string,
    maxDate: PropTypes.string,
}

export default DatePicker
