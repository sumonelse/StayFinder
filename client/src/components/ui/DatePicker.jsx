import React, { useState, useEffect, forwardRef } from "react"
import PropTypes from "prop-types"
import ReactDatePicker from "react-datepicker"
import { format, isValid, parse, addMonths } from "date-fns"
import { FaCalendarAlt, FaTimes } from "react-icons/fa"
import "react-datepicker/dist/react-datepicker.css"
import "../../styles/datepicker.css"

// Custom header component for the DatePicker
const CustomHeader = React.memo(
    ({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
        monthDate,
        customHeaderCount,
    }) => {
        // For the second calendar in range selection, show the next month
        // customHeaderCount is 0 for the first calendar and 1 for the second
        const displayDate = customHeaderCount === 1 ? addMonths(date, 1) : date

        return (
            <div className="flex items-center justify-between px-2 py-2 mb-1">
                <button
                    onClick={decreaseMonth}
                    disabled={
                        prevMonthButtonDisabled || customHeaderCount === 1
                    }
                    type="button"
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary-100 text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous Month"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                <div className="text-primary-800 font-medium text-center">
                    {format(displayDate, "MMMM yyyy")}
                </div>

                <button
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    type="button"
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary-100 text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next Month"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
        )
    }
)

CustomHeader.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    decreaseMonth: PropTypes.func.isRequired,
    increaseMonth: PropTypes.func.isRequired,
    prevMonthButtonDisabled: PropTypes.bool,
    nextMonthButtonDisabled: PropTypes.bool,
    monthDate: PropTypes.instanceOf(Date),
    customHeaderCount: PropTypes.number,
}

/**
 * Enhanced DatePicker component using react-datepicker
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} [props.label] - Input label
 * @param {string} [props.value] - Selected date in YYYY-MM-DD format
 * @param {string} [props.startDate] - Start date for range selection in YYYY-MM-DD format
 * @param {string} [props.endDate] - End date for range selection in YYYY-MM-DD format
 * @param {Function} props.onChange - Function called when date changes
 * @param {Function} [props.onRangeChange] - Function called when date range changes
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.error] - Error message
 * @param {string} [props.hint] - Hint text
 * @param {boolean} [props.disabled=false] - Whether the input is disabled
 * @param {boolean} [props.required=false] - Whether the input is required
 * @param {string|Date} [props.minDate] - Minimum selectable date
 * @param {string|Date} [props.maxDate] - Maximum selectable date
 * @param {boolean} [props.selectsRange=false] - Whether to enable date range selection
 * @param {boolean} [props.showMonthYearPicker=false] - Whether to show month/year picker
 * @param {boolean} [props.inline=false] - Whether to display the calendar inline
 */
const DatePicker = ({
    id,
    label,
    value,
    startDate,
    endDate,
    onChange,
    onRangeChange,
    placeholder = "Select date",
    error,
    hint,
    disabled = false,
    required = false,
    minDate,
    maxDate,
    selectsRange = false,
    showMonthYearPicker = false,
    inline = false,
    ...props
}) => {
    // Parse string dates to Date objects
    const parseDate = (dateStr) => {
        if (!dateStr) return null
        if (dateStr instanceof Date) return dateStr

        const parsedDate = parse(dateStr, "yyyy-MM-dd", new Date())
        return isValid(parsedDate) ? parsedDate : null
    }

    // Initialize state based on props
    const [dateRange, setDateRange] = useState([
        parseDate(startDate),
        parseDate(endDate),
    ])

    const selectedDate = parseDate(value)

    // Update dateRange when props change
    useEffect(() => {
        if (selectsRange) {
            setDateRange([parseDate(startDate), parseDate(endDate)])
        }
    }, [startDate, endDate, selectsRange])

    // Format date as YYYY-MM-DD
    const formatDateForValue = (date) => {
        if (!date) return ""
        return format(date, "yyyy-MM-dd")
    }

    // Handle date selection for single date
    const handleDateChange = (date) => {
        if (onChange) {
            onChange(date ? formatDateForValue(date) : "")
        }
    }

    // Handle date range selection
    const handleRangeChange = (dates) => {
        const [start, end] = dates
        setDateRange(dates)

        if (onRangeChange) {
            onRangeChange({
                startDate: start ? formatDateForValue(start) : "",
                endDate: end ? formatDateForValue(end) : "",
            })
        }
    }

    // Custom input component
    const CustomInput = forwardRef(
        ({ value, onClick, onChange: inputOnChange }, ref) => (
            <div className="relative">
                <input
                    ref={ref}
                    id={id}
                    type="text"
                    value={value}
                    onChange={inputOnChange}
                    onClick={onClick}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={
                        error ? `${id}-error` : hint ? `${id}-hint` : undefined
                    }
                    className={`input-field pr-10 cursor-pointer ${
                        error ? "input-error" : ""
                    }`}
                    readOnly
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-primary-500">
                    <FaCalendarAlt />
                </div>

                {value && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-8 text-primary-400 hover:text-primary-600"
                        onClick={(e) => {
                            e.stopPropagation()
                            selectsRange
                                ? handleRangeChange([null, null])
                                : handleDateChange(null)
                        }}
                        aria-label="Clear date"
                        tabIndex={0}
                    >
                        <FaTimes />
                    </button>
                )}
            </div>
        )
    )

    CustomInput.displayName = "CustomDatePickerInput"

    // Process min/max dates
    const minDateObj = parseDate(minDate)
    const maxDateObj = parseDate(maxDate)

    // Base component
    const datepickerComponent = (
        <ReactDatePicker
            selected={selectsRange ? dateRange[0] : selectedDate}
            onChange={selectsRange ? handleRangeChange : handleDateChange}
            startDate={selectsRange ? dateRange[0] : undefined}
            endDate={selectsRange ? dateRange[1] : undefined}
            selectsRange={selectsRange}
            minDate={minDateObj}
            maxDate={maxDateObj}
            showMonthYearPicker={showMonthYearPicker}
            inline={inline}
            customInput={<CustomInput />}
            dateFormat="MMM d, yyyy"
            calendarClassName="shadow-lg border border-secondary-200 rounded-lg overflow-hidden"
            wrapperClassName="w-full"
            popperClassName="z-50"
            popperPlacement="bottom-start"
            showPopperArrow={false}
            disabled={disabled}
            monthsShown={selectsRange ? 2 : 1}
            fixedHeight
            formatWeekDay={(day) => day.substring(0, 1)}
            focusedInput={selectsRange ? "startDate" : undefined}
            openToDate={selectedDate || dateRange[0] || new Date()}
            nextMonthButtonLabel="Next Month"
            previousMonthButtonLabel="Previous Month"
            {...(selectsRange && {
                renderMonthContent: (month, shortMonth) => (
                    <span aria-label={`Month of ${shortMonth}`}>
                        {shortMonth}
                    </span>
                ),
                calendarStartDay: 1,
                monthShowsDuplicateDaysEnd: false,
                monthShowsDuplicateDaysStart: false,
                onMonthChange: (date) => {
                    // This ensures both months stay in sync
                    return date
                },
            })}
            renderCustomHeader={({ ...props }) => <CustomHeader {...props} />}
            dayClassName={(date) => {
                const baseClasses = "rounded-full"
                const today =
                    format(date, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd")

                if (today) {
                    return `${baseClasses} bg-primary-50 text-primary-700 font-medium`
                }

                return baseClasses
            }}
            calendarContainer={({ className, children }) => (
                <div className={`${className} p-2`}>{children}</div>
            )}
            {...props}
        />
    )

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={id} className="form-label">
                    {label}
                    {required && (
                        <span className="text-danger-500 ml-1">*</span>
                    )}
                </label>
            )}

            {datepickerComponent}

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
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    onChange: PropTypes.func,
    onRangeChange: PropTypes.func,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    hint: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    minDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
    ]),
    maxDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
    ]),
    selectsRange: PropTypes.bool,
    showMonthYearPicker: PropTypes.bool,
    inline: PropTypes.bool,
    // Allow additional react-datepicker props
    className: PropTypes.string,
    calendarClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    popperClassName: PropTypes.string,
    dateFormat: PropTypes.string,
}

export default DatePicker
