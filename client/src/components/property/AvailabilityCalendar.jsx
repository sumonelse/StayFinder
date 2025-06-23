import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import {
    FaCalendarAlt,
    FaSpinner,
    FaExclamationCircle,
    FaCheckCircle,
} from "react-icons/fa"
import { bookingService } from "../../services/api"
import { calculateNights } from "../../utils/bookingCalculator"

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
            const date = new Date(year, month, day)
            days.push({
                day,
                date,
                dateString: date.toISOString().split("T")[0],
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
            const start = new Date(selectedDates.startDate)
            const end = new Date(selectedDates.endDate)
            return date >= start && date <= end
        }

        return false
    }

    // Check if a date is hovered (for range selection)
    const isDateHovered = (date) => {
        if (!selectedDates.startDate || selectedDates.endDate || !hoveredDate) {
            return false
        }

        const start = new Date(selectedDates.startDate)
        const hovered = new Date(hoveredDate)

        return date > start && date <= hovered
    }

    // Handle date click
    const handleDateClick = (dateInfo) => {
        if (!dateInfo.isSelectable) return

        const dateString = dateInfo.dateString

        if (
            !selectedDates.startDate ||
            (selectedDates.startDate && selectedDates.endDate)
        ) {
            // Start a new selection
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
                // If clicked date is before start date, swap them
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
        if (!dateInfo.isSelectable) return
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

                // Debug the response
                console.log("Availability API Response:", response)

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
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
    }

    // Get CSS classes for date styling
    const getDateClassName = (dayInfo) => {
        const classes = []

        // Base styling
        if (dayInfo.isPast) {
            classes.push("text-gray-300 cursor-not-allowed")
        } else {
            classes.push("text-gray-700")
        }

        // Today styling
        if (dayInfo.isToday) {
            classes.push("font-bold border-2 border-blue-400")
        }

        // Availability styling
        if (dayInfo.isBooked) {
            classes.push("bg-red-100 text-red-600 cursor-not-allowed")
        } else if (dayInfo.isBlocked) {
            classes.push("bg-orange-100 text-orange-600 cursor-not-allowed")
        } else if (dayInfo.isCheckoutOnly) {
            classes.push("bg-yellow-50 text-yellow-600")
        }

        // Selection styling
        if (dayInfo.isSelected) {
            classes.push("bg-primary-500 text-white")
        } else if (dayInfo.isHovered) {
            classes.push("bg-primary-100 text-primary-800")
        }

        // Range selection styling
        if (dayInfo.dateString === selectedDates.startDate) {
            classes.push("bg-primary-500 text-white rounded-l-md")
        }
        if (dayInfo.dateString === selectedDates.endDate) {
            classes.push("bg-primary-500 text-white rounded-r-md")
        }

        // Hover effects for selectable dates
        if (dayInfo.isSelectable && !dayInfo.isSelected && !dayInfo.isHovered) {
            classes.push("hover:bg-gray-100")
        }

        return classes.join(" ")
    }

    // Get tooltip text for date
    const getDateTooltip = (dayInfo) => {
        if (dayInfo.isPast) return "Past date"
        if (dayInfo.isBooked) return "Already booked"
        if (dayInfo.isBlocked) {
            const blockInfo = blockedDatesData[dayInfo.dateString]
            return `Blocked by host${
                blockInfo?.reason ? ` (${blockInfo.reason})` : ""
            }`
        }
        if (dayInfo.isCheckoutOnly) return "Check-out only"
        if (dayInfo.isToday) return "Today"
        return "Available"
    }

    // Generate days of week headers
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Generate calendar days
    const calendarDays = generateCalendarDays()

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Previous month"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
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

                    <h3 className="text-lg font-medium text-gray-900">
                        {formatMonthName(currentMonth)}
                    </h3>

                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Next month"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
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
                        <FaSpinner className="animate-spin text-primary-500 mr-2" />
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
                            className="text-xs text-primary-600 hover:text-primary-800 underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Days of week headers */}
                            {daysOfWeek.map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-xs font-medium text-gray-500 py-2"
                                >
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days */}
                            {calendarDays.map((dayInfo, index) => (
                                <div
                                    key={index}
                                    className={`relative h-10 ${
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
                        ${getDateClassName(dayInfo)}
                      `}
                                            title={getDateTooltip(dayInfo)}
                                        >
                                            {dayInfo.day}

                                            {/* Visual indicators */}
                                            {dayInfo.isBooked && (
                                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                                            )}
                                            {dayInfo.isBlocked && (
                                                <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></div>
                                            )}
                                            {dayInfo.isToday && (
                                                <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
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
                <div className="border-t border-gray-200 pt-3 mt-2 mb-2">
                    <div className="bg-primary-50 rounded-lg p-3 border border-primary-100">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center text-primary-800">
                                <FaCalendarAlt className="mr-2 text-primary-600" />
                                <span className="font-medium">Your stay</span>
                            </div>
                            <div className="text-primary-700 font-medium">
                                {calculateNights(
                                    selectedDates.startDate,
                                    selectedDates.endDate
                                )}{" "}
                                nights
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <div className="text-gray-500 text-xs">
                                    CHECK-IN
                                </div>
                                <div className="font-medium">
                                    {formatDate(selectedDates.startDate)}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs">
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

            {/* Legend */}
            <div className="border-t border-gray-200 pt-3 mt-2">
                <div className="text-xs text-gray-500 mb-2 font-medium">
                    Legend:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-primary-500 rounded-sm mr-2"></div>
                        <span>Selected</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-100 rounded-sm mr-2"></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-100 rounded-sm mr-2 relative">
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                        </div>
                        <span>Booked</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-orange-100 rounded-sm mr-2 relative">
                            <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                        <span>Blocked by host</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-50 rounded-sm mr-2"></div>
                        <span>Checkout only</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-blue-400 rounded-sm mr-2 relative">
                            <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <span>Today</span>
                    </div>
                </div>
            </div>

            {/* Selected dates summary */}
            {(selectedDates.startDate || selectedDates.endDate) && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center text-sm">
                        <FaCalendarAlt className="text-primary-500 mr-2" />
                        <div>
                            {selectedDates.startDate &&
                                !selectedDates.endDate && (
                                    <span>
                                        Check-in:{" "}
                                        <strong>
                                            {new Date(
                                                selectedDates.startDate
                                            ).toLocaleDateString()}
                                        </strong>
                                    </span>
                                )}

                            {selectedDates.startDate &&
                                selectedDates.endDate && (
                                    <span>
                                        <strong>
                                            {new Date(
                                                selectedDates.startDate
                                            ).toLocaleDateString()}
                                        </strong>
                                        {" → "}
                                        <strong>
                                            {new Date(
                                                selectedDates.endDate
                                            ).toLocaleDateString()}
                                        </strong>
                                    </span>
                                )}
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
