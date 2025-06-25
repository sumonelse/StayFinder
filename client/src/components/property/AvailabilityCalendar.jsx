import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { FaCalendarAlt, FaSpinner, FaExclamationCircle } from "react-icons/fa"
import { bookingService } from "../../services/api"
import {
    formatDate as formatDateUtil,
    getDaysBetweenDates,
} from "../../utils/dateUtils"

/**
 * Calendar component for displaying property availability
 */
const AvailabilityCalendar = ({
    propertyId,
    onDateSelect,
    initialStartDate,
    initialEndDate,
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDates, setSelectedDates] = useState({
        startDate: initialStartDate || null,
        endDate: initialEndDate || null,
    })
    const [hoveredDate, setHoveredDate] = useState(null)
    const [availabilityData, setAvailabilityData] = useState({})
    const [blockedDatesData, setBlockedDatesData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Generate calendar days for the current month
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        // Get the first day of the month
        const firstDayOfMonth = new Date(year, month, 1)
        const dayOfWeek = firstDayOfMonth.getDay()

        // Get the last day of the month
        const lastDayOfMonth = new Date(year, month + 1, 0)
        const daysInMonth = lastDayOfMonth.getDate()

        // Create array for calendar days
        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < dayOfWeek; i++) {
            days.push({ day: null, date: null })
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            // Create date at noon to avoid timezone issues
            const date = new Date(year, month, day, 12, 0, 0, 0)

            // Format date as YYYY-MM-DD
            const dateString = date.toISOString().split("T")[0]

            days.push({
                day,
                date,
                dateString,
                isToday: isToday(date),
                isPast: isPastDate(date),
                isBooked: isDateBooked(date),
                isBlocked: isDateBlocked(date),
                isCheckoutOnly: isCheckoutOnlyDate(date),
                isSelected: isDateSelected(date),
                isHovered: isDateHovered(date),
                isSelectable:
                    !isPastDate(date) &&
                    !isDateBooked(date) &&
                    !isDateBlocked(date),
            })
        }

        return days
    }

    // Check if a date is today
    const isToday = (date) => {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    // Check if a date is in the past
    const isPastDate = (date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date < today
    }

    // Check if a date is booked
    const isDateBooked = (date) => {
        const dateString = date.toISOString().split("T")[0]
        return availabilityData[dateString] === false
    }

    // Check if a date is blocked by host
    const isDateBlocked = (date) => {
        const dateString = date.toISOString().split("T")[0]
        return blockedDatesData[dateString] !== undefined
    }

    // Check if a date is checkout only (previous day is booked)
    const isCheckoutOnlyDate = (date) => {
        const prevDate = new Date(date)
        prevDate.setDate(prevDate.getDate() - 1)
        const prevDateString = prevDate.toISOString().split("T")[0]
        return availabilityData[prevDateString] === false
    }

    // Check if a date is selected
    const isDateSelected = (date) => {
        const dateString = date.toISOString().split("T")[0]

        if (!selectedDates.startDate && !selectedDates.endDate) {
            return false
        }

        if (selectedDates.startDate && !selectedDates.endDate) {
            return dateString === selectedDates.startDate
        }

        if (selectedDates.startDate && selectedDates.endDate) {
            // Create new Date objects and set time to noon to avoid timezone issues
            const start = new Date(selectedDates.startDate)
            start.setHours(12, 0, 0, 0)

            const end = new Date(selectedDates.endDate)
            end.setHours(12, 0, 0, 0)

            // Create a copy of the date and set time to noon
            const dateToCheck = new Date(date)
            dateToCheck.setHours(12, 0, 0, 0)

            return dateToCheck >= start && dateToCheck <= end
        }

        return false
    }

    // Check if a date is hovered (for range selection)
    const isDateHovered = (date) => {
        if (!selectedDates.startDate || selectedDates.endDate || !hoveredDate) {
            return false
        }

        // Create new Date objects and set time to noon to avoid timezone issues
        const start = new Date(selectedDates.startDate)
        start.setHours(12, 0, 0, 0)

        const hovered = new Date(hoveredDate)
        hovered.setHours(12, 0, 0, 0)

        // Create a copy of the date and set time to noon
        const dateToCheck = new Date(date)
        dateToCheck.setHours(12, 0, 0, 0)

        // Don't show hover effect if the date is not selectable
        if (!isDateSelectable(date)) {
            return false
        }

        // Check if there are any booked dates between start and hovered
        const dateString = date.toISOString().split("T")[0]
        const hoveredDateString = hoveredDate

        // If there are booked dates in the range, don't show hover effect beyond the first booked date
        for (
            let day = new Date(start);
            day <= dateToCheck;
            day.setDate(day.getDate() + 1)
        ) {
            const currentDateString = day.toISOString().split("T")[0]
            // Skip the start date
            if (
                currentDateString !== selectedDates.startDate &&
                (availabilityData[currentDateString] === false ||
                    blockedDatesData[currentDateString] !== undefined)
            ) {
                return false
            }
        }

        return dateToCheck > start && dateToCheck <= hovered
    }

    // Helper function to check if a date is selectable
    const isDateSelectable = (date) => {
        return !isPastDate(date) && !isDateBooked(date) && !isDateBlocked(date)
    }

    // Check if there are any booked dates in a range
    const hasBookedDatesInRange = (startDate, endDate) => {
        // Create new Date objects and set time to noon to avoid timezone issues
        const start = new Date(startDate)
        start.setHours(12, 0, 0, 0)

        const end = new Date(endDate)
        end.setHours(12, 0, 0, 0)

        // Check each date in the range
        for (
            let day = new Date(start);
            day <= end;
            day.setDate(day.getDate() + 1)
        ) {
            const dateString = day.toISOString().split("T")[0]
            // Skip the start and end dates (check-in and check-out dates)
            if (dateString !== startDate && dateString !== endDate) {
                if (
                    availabilityData[dateString] === false ||
                    blockedDatesData[dateString] !== undefined
                ) {
                    return true
                }
            }
        }
        return false
    }

    // Handle date click
    const handleDateClick = (dateInfo) => {
        if (!dateInfo.isSelectable) return

        const dateString = dateInfo.dateString

        if (
            !selectedDates.startDate ||
            (selectedDates.startDate && selectedDates.endDate)
        ) {
            setSelectedDates({
                startDate: dateString,
                endDate: null,
            })

            if (onDateSelect) {
                onDateSelect({
                    startDate: dateString,
                    endDate: null,
                })
            }
        } else {
            // Complete the selection
            if (dateString < selectedDates.startDate) {
                setSelectedDates({
                    startDate: dateString,
                    endDate: selectedDates.startDate,
                })

                if (onDateSelect) {
                    onDateSelect({
                        startDate: dateString,
                        endDate: selectedDates.startDate,
                    })
                }
            } else {
                // Check if there are any booked dates in the selected range
                if (
                    hasBookedDatesInRange(selectedDates.startDate, dateString)
                ) {
                    // Create a more user-friendly alert
                    const alertElement = document.createElement("div")
                    alertElement.className =
                        "fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                    alertElement.innerHTML = `
                        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 animate-scaleIn">
                            <div class="flex items-center text-red-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 class="text-lg font-semibold">Unavailable Dates Selected</h3>
                            </div>
                            <p class="text-secondary-700 mb-4">Your selected date range includes dates that are already booked. Please select a different range.</p>
                            <div class="flex justify-end">
                                <button class="px-4 py-2 bg-secondary-800 text-white rounded-lg hover:bg-secondary-700 transition-colors">
                                    OK
                                </button>
                            </div>
                        </div>
                    `

                    document.body.appendChild(alertElement)

                    // Add click event to close the alert
                    alertElement.addEventListener("click", (e) => {
                        if (
                            e.target.tagName === "BUTTON" ||
                            e.target === alertElement
                        ) {
                            document.body.removeChild(alertElement)
                        }
                    })

                    return
                }

                // Calculate nights for debugging
                const nights = getDaysBetweenDates(
                    selectedDates.startDate,
                    dateString
                )

                setSelectedDates({
                    startDate: selectedDates.startDate,
                    endDate: dateString,
                })

                if (onDateSelect) {
                    onDateSelect({
                        startDate: selectedDates.startDate,
                        endDate: dateString,
                    })
                }
            }
        }
    }

    // Handle date hover
    const handleDateHover = (dateInfo) => {
        // Always set hovered date even if not selectable to provide visual feedback
        setHoveredDate(dateInfo.dateString)
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

    // Fetch availability data when month changes
    useEffect(() => {
        const fetchAvailability = async () => {
            if (!propertyId) return

            setIsLoading(true)
            setError(null)

            try {
                // Calculate start and end dates for the query (current month + next month)
                const startOfMonth = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    1
                )
                const endOfNextMonth = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 2,
                    0
                )

                const startDate = startOfMonth.toISOString().split("T")[0]
                const endDate = endOfNextMonth.toISOString().split("T")[0]

                // Fetch availability data from API
                const response = await bookingService.getPropertyAvailability(
                    propertyId,
                    {
                        checkInDate: startDate,
                        checkOutDate: endDate,
                        detailed: true,
                    }
                )

                // Update availability data
                setAvailabilityData(response.availabilityMap || {})
                setBlockedDatesData(response.blockedDates || {})
                setIsLoading(false)
            } catch (err) {
                console.error("Error fetching availability:", err)
                console.error("Property ID:", propertyId)
                console.error("Date range:", { startDate, endDate })
                setError(
                    err.response?.data?.error ||
                        err.message ||
                        "Failed to load availability data"
                )
                setIsLoading(false)
            }
        }

        fetchAvailability()
    }, [propertyId, currentMonth])

    // Update selected dates when initialDates change
    useEffect(() => {
        if (initialStartDate || initialEndDate) {
            setSelectedDates({
                startDate: initialStartDate || null,
                endDate: initialEndDate || null,
            })
        }
    }, [initialStartDate, initialEndDate])

    // Format month name
    const formatMonthName = (date) => {
        return date.toLocaleString("default", {
            month: "long",
            year: "numeric",
        })
    }

    // Format date for display
    const formatDate = (dateString) => {
        // Use the utility function with custom options
        return formatDateUtil(dateString, {
            format: "custom",
            options: {
                weekday: "short",
                month: "short",
                day: "numeric",
            },
        })
    }

    // Get CSS classes for date styling
    const getDateClassName = (dayInfo) => {
        const classes = []

        // Base styling
        if (dayInfo.isPast) {
            classes.push("text-secondary-300 cursor-not-allowed")
        } else {
            classes.push("text-secondary-700")
        }

        // Today styling
        if (dayInfo.isToday) {
            classes.push("font-bold border border-blue-400")
        }

        // Availability styling - improved with light background for better UX
        if (dayInfo.isBooked || dayInfo.isBlocked) {
            classes.push("line-through text-secondary-200 cursor-not-allowed")
        }
        // The "checkout only" feature means that the previous day is booked,
        // but this day can be selected as a checkout date

        // Selection styling
        if (dayInfo.isSelected) {
            classes.push("bg-secondary-800 text-white font-medium")
        } else if (dayInfo.isHovered) {
            classes.push("bg-secondary-100 text-secondary-800")
        }

        // Range selection styling with improved visual indicators
        if (dayInfo.dateString === selectedDates.startDate) {
            classes.push(
                "bg-secondary-600 text-white rounded-l-md shadow-md z-10"
            )
        }
        if (dayInfo.dateString === selectedDates.endDate) {
            classes.push(
                "bg-secondary-600 text-white rounded-r-md shadow-md z-10"
            )
        }

        // Add a visual connection between start and end dates
        if (
            dayInfo.isSelected &&
            dayInfo.dateString !== selectedDates.startDate &&
            dayInfo.dateString !== selectedDates.endDate
        ) {
            classes.push(
                "bg-secondary-600 border-t border-b border-primary-200"
            )
        }

        return classes.join(" ")
    }

    // Get tooltip text for date
    const getDateTooltip = (dayInfo) => {
        if (dayInfo.isPast) return "Past date - not available"
        if (dayInfo.isBooked) return "Already booked - not available"
        if (dayInfo.isBlocked) return "Not available"
        if (dayInfo.isCheckoutOnly) return "Available for check-out only"
        if (dayInfo.isToday) return "Today"
        return "Available"
    }

    // Generate days of week headers
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Generate calendar days
    const calendarDays = generateCalendarDays()

    return (
        <div className="bg-white rounded-lg shadow-sm border border-secondary-100 p-2">
            {/* Simplified selection instructions */}
            <div className="mb-2 text-xs text-secondary-700 flex items-center justify-center">
                <span className="bg-secondary-50 px-2 py-1 rounded-full">
                    {!selectedDates.startDate
                        ? "Select check-in date"
                        : !selectedDates.endDate
                        ? "Select check-out date"
                        : `${formatDate(
                              selectedDates.startDate
                          )} - ${formatDate(selectedDates.endDate)}`}
                </span>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-full hover:bg-secondary-100 transition-colors"
                        aria-label="Previous month"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-secondary-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    <h3 className="text-lg font-medium text-secondary-900">
                        {formatMonthName(currentMonth)}
                    </h3>

                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-full hover:bg-secondary-100 transition-colors"
                        aria-label="Next month"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-secondary-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                        <FaSpinner className="animate-spin text-secondary-500 mr-2" />
                        <span>Loading availability...</span>
                    </div>
                ) : error ? (
                    <div className="text-red-500 flex flex-col items-center justify-center py-8">
                        <FaExclamationCircle className="mb-2" size={24} />
                        <span className="text-sm font-medium mb-2">
                            {error}
                        </span>
                        <button
                            onClick={() => {
                                setError(null)
                                setIsLoading(true)
                            }}
                            className="text-xs text-secondary-600 hover:text-secondary-800 underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-0.5">
                            {/* Days of week headers */}
                            {daysOfWeek.map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-xs font-medium text-secondary-500 py-1"
                                >
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days */}
                            {calendarDays.map((dayInfo, index) => (
                                <div
                                    key={index}
                                    className={`relative h-8 ${
                                        !dayInfo.day ? "" : "cursor-pointer"
                                    }`}
                                    onClick={() =>
                                        dayInfo.day && handleDateClick(dayInfo)
                                    }
                                    onMouseEnter={() =>
                                        dayInfo.day && handleDateHover(dayInfo)
                                    }
                                >
                                    {dayInfo.day && (
                                        <div
                                            className={`
                        flex items-center justify-center h-full w-full rounded-md text-sm relative
                        ${
                            dayInfo.isSelectable
                                ? "hover:bg-secondary-100 hover:scale-110 transition-transform"
                                : ""
                        }
                        ${getDateClassName(dayInfo)}
                      `}
                                            title={getDateTooltip(dayInfo)}
                                            aria-label={`${
                                                dayInfo.day
                                            } ${getDateTooltip(dayInfo)}`}
                                        >
                                            {dayInfo.day}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Selected dates summary */}
            {selectedDates.startDate && selectedDates.endDate && (
                <div className="border-t border-secondary-200 pt-3 mt-2 mb-2">
                    <div className="bg-secondary-50 rounded-lg p-3 border border-primary-100">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center text-secondary-800">
                                <FaCalendarAlt className="mr-2 text-secondary-600" />
                                <span className="font-medium">Your stay</span>
                            </div>
                            <div className="text-secondary-700 font-medium">
                                {(() => {
                                    // Calculate nights directly here to ensure accuracy
                                    const nights = getDaysBetweenDates(
                                        selectedDates.startDate,
                                        selectedDates.endDate
                                    )
                                    return `${nights} night${
                                        nights !== 1 ? "s" : ""
                                    }`
                                })()}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <div className="text-secondary-500 text-xs">
                                    CHECK-IN
                                </div>
                                <div className="font-medium">
                                    {formatDate(selectedDates.startDate)}
                                </div>
                            </div>
                            <div>
                                <div className="text-secondary-500 text-xs">
                                    CHECK-OUT
                                </div>
                                <div className="font-medium">
                                    {formatDate(selectedDates.endDate)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

AvailabilityCalendar.propTypes = {
    propertyId: PropTypes.string.isRequired,
    onDateSelect: PropTypes.func,
    initialStartDate: PropTypes.string,
    initialEndDate: PropTypes.string,
}

export default AvailabilityCalendar
