import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa"

/**
 * A compact calendar component for selecting dates
 */
const CompactCalendar = ({
    initialStartDate,
    initialEndDate,
    onDateSelect,
    propertyId,
    minDate = new Date(),
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDates, setSelectedDates] = useState({
        startDate: initialStartDate || "",
        endDate: initialEndDate || "",
    })
    const [hoveredDate, setHoveredDate] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [bookedDates, setBookedDates] = useState([])
    const [checkoutOnlyDates, setCheckoutOnlyDates] = useState([])

    // Days of week header
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    // Format date as YYYY-MM-DD
    const formatDateString = (date) => {
        return date.toISOString().split("T")[0]
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        })
    }

    // Load availability data
    useEffect(() => {
        if (!propertyId) return

        const fetchAvailability = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Mock data - in a real app, this would come from an API
                const mockBookedDates = [
                    "2023-12-24",
                    "2023-12-25",
                    "2023-12-26",
                    "2024-01-01",
                    "2024-01-02",
                ]

                const mockCheckoutOnlyDates = ["2023-12-27", "2024-01-03"]

                setBookedDates(mockBookedDates)
                setCheckoutOnlyDates(mockCheckoutOnlyDates)
            } catch (err) {
                setError("Failed to load availability. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchAvailability()
    }, [propertyId])

    // Handle date selection
    const handleDateClick = (date) => {
        if (!date.isSelectable) return

        const dateString = date.dateString

        if (
            !selectedDates.startDate ||
            (selectedDates.startDate && selectedDates.endDate)
        ) {
            // Start a new selection
            setSelectedDates({
                startDate: dateString,
                endDate: "",
            })
        } else {
            // Complete the selection
            if (dateString < selectedDates.startDate) {
                // If clicked date is before start date, swap them
                setSelectedDates({
                    startDate: dateString,
                    endDate: selectedDates.startDate,
                })
            } else {
                // Normal case: end date is after start date
                setSelectedDates({
                    startDate: selectedDates.startDate,
                    endDate: dateString,
                })
            }
        }
    }

    // Handle date hover for range selection preview
    const handleDateHover = (date) => {
        if (
            selectedDates.startDate &&
            !selectedDates.endDate &&
            date.isSelectable
        ) {
            setHoveredDate(date.dateString)
        }
    }

    // Navigate to previous month
    const goToPreviousMonth = () => {
        setCurrentMonth((prevMonth) => {
            const newMonth = new Date(prevMonth)
            newMonth.setMonth(newMonth.getMonth() - 1)
            return newMonth
        })
    }

    // Navigate to next month
    const goToNextMonth = () => {
        setCurrentMonth((prevMonth) => {
            const newMonth = new Date(prevMonth)
            newMonth.setMonth(newMonth.getMonth() + 1)
            return newMonth
        })
    }

    // Generate calendar days for current month
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        // First day of the month
        const firstDay = new Date(year, month, 1)
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0)

        // Get the day of the week for the first day (0-6, where 0 is Sunday)
        const firstDayOfWeek = firstDay.getDay()

        // Calculate days from previous month to show
        const daysFromPrevMonth = firstDayOfWeek

        // Calculate total days to show (including days from previous and next months)
        const totalDays = 42 // 6 rows of 7 days

        // Today's date for highlighting
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const days = []

        // Add days from previous month
        const prevMonth = new Date(year, month, 0)
        const prevMonthDays = prevMonth.getDate()

        for (
            let i = prevMonthDays - daysFromPrevMonth + 1;
            i <= prevMonthDays;
            i++
        ) {
            const date = new Date(year, month - 1, i)
            days.push({
                day: i,
                dateString: formatDateString(date),
                isCurrentMonth: false,
                isPast: date < today,
                isToday: false,
                isSelectable: false,
            })
        }

        // Add days from current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i)
            const dateString = formatDateString(date)

            const isBooked = bookedDates.includes(dateString)
            const isCheckoutOnly = checkoutOnlyDates.includes(dateString)

            // Determine if the date is selectable
            const isSelectable = date >= today && !isBooked

            // Check if the date is within a selected range
            const isSelected =
                selectedDates.startDate &&
                selectedDates.endDate &&
                dateString >= selectedDates.startDate &&
                dateString <= selectedDates.endDate

            // Check if the date is being hovered over during range selection
            const isHovered =
                selectedDates.startDate &&
                !selectedDates.endDate &&
                hoveredDate &&
                ((dateString > selectedDates.startDate &&
                    dateString <= hoveredDate) ||
                    (dateString < selectedDates.startDate &&
                        dateString >= hoveredDate))

            days.push({
                day: i,
                dateString,
                isCurrentMonth: true,
                isPast: date < today,
                isToday: formatDateString(today) === dateString,
                isBooked,
                isCheckoutOnly,
                isSelectable,
                isSelected,
                isHovered,
            })
        }

        // Add days from next month to fill the calendar
        const remainingDays = totalDays - days.length
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i)
            days.push({
                day: i,
                dateString: formatDateString(date),
                isCurrentMonth: false,
                isPast: false,
                isToday: false,
                isSelectable: false,
            })
        }

        return days
    }

    // Get CSS classes for date styling
    const getDateClassName = (dayInfo) => {
        if (!dayInfo.isCurrentMonth) return "text-gray-300 opacity-30"

        const classes = []

        // Base styling
        if (dayInfo.isPast) {
            classes.push("text-gray-300 cursor-not-allowed")
        } else {
            classes.push("text-gray-700")
        }

        // Today styling
        if (dayInfo.isToday) {
            classes.push("font-bold border border-blue-400")
        }

        // Availability styling
        if (dayInfo.isBooked) {
            classes.push("bg-red-100 text-red-600 cursor-not-allowed")
        } else if (dayInfo.isCheckoutOnly) {
            classes.push("bg-yellow-50 text-yellow-600")
        }

        // Selection styling
        if (dayInfo.isSelected) {
            classes.push("bg-primary-500 text-white font-medium")
        } else if (dayInfo.isHovered) {
            classes.push("bg-primary-100 text-primary-800")
        }

        // Range selection styling
        if (dayInfo.dateString === selectedDates.startDate) {
            classes.push(
                "bg-primary-600 text-white rounded-l-md shadow-sm z-10"
            )
        }
        if (dayInfo.dateString === selectedDates.endDate) {
            classes.push(
                "bg-primary-600 text-white rounded-r-md shadow-sm z-10"
            )
        }

        return classes.join(" ")
    }

    // Update parent component when dates change
    useEffect(() => {
        if (onDateSelect) {
            onDateSelect(selectedDates)
        }
    }, [selectedDates, onDateSelect])

    // Generate calendar days
    const calendarDays = generateCalendarDays()

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            {/* Simplified selection instructions */}
            <div className="mb-2 text-xs text-secondary-700 flex items-center justify-center">
                <span className="bg-primary-50 px-2 py-1 rounded-full">
                    {!selectedDates.startDate
                        ? "Select check-in date"
                        : !selectedDates.endDate
                        ? "Select check-out date"
                        : `${formatDate(
                              selectedDates.startDate
                          )} - ${formatDate(selectedDates.endDate)}`}
                </span>
            </div>

            <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Previous month"
                    >
                        <FaChevronLeft className="text-gray-600" size={14} />
                    </button>
                    <div className="text-sm font-medium">
                        {currentMonth.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        })}
                    </div>
                    <button
                        onClick={goToNextMonth}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Next month"
                    >
                        <FaChevronRight className="text-gray-600" size={14} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                        <FaSpinner className="animate-spin text-primary-500 mr-2" />
                        <span className="text-sm">Loading...</span>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4 text-sm">
                        {error}
                    </div>
                ) : (
                    <div>
                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-0.5">
                            {/* Days of week headers */}
                            {daysOfWeek.map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-xs font-medium text-gray-500 py-1"
                                >
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days */}
                            {calendarDays.map((dayInfo, index) => (
                                <div
                                    key={index}
                                    className={`relative h-7 ${
                                        !dayInfo.isSelectable
                                            ? ""
                                            : "cursor-pointer"
                                    }`}
                                    onClick={() =>
                                        dayInfo.isSelectable &&
                                        handleDateClick(dayInfo)
                                    }
                                    onMouseEnter={() =>
                                        dayInfo.isSelectable &&
                                        handleDateHover(dayInfo)
                                    }
                                >
                                    {dayInfo.day && (
                                        <div
                                            className={`
                                                flex items-center justify-center h-full w-full rounded-md text-xs relative
                                                ${getDateClassName(dayInfo)}
                                            `}
                                        >
                                            {dayInfo.day}

                                            {/* Visual indicators */}
                                            {dayInfo.isBooked && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
                                            )}
                                            {dayInfo.isCheckoutOnly && (
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-yellow-500"></div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

CompactCalendar.propTypes = {
    initialStartDate: PropTypes.string,
    initialEndDate: PropTypes.string,
    onDateSelect: PropTypes.func.isRequired,
    propertyId: PropTypes.string.isRequired,
    minDate: PropTypes.instanceOf(Date),
}

export default CompactCalendar
