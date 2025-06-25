import { useState } from "react"
import PropTypes from "prop-types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FaSpinner, FaInfo } from "react-icons/fa"
import { propertyService } from "../../services/api"

/**
 * Calendar component for hosts to manage property availability
 */
const HostCalendarManager = ({ propertyId }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDates, setSelectedDates] = useState([])
    const [blockingMode, setBlockingMode] = useState(true) // true = block, false = unblock
    const [blockReason, setBlockReason] = useState("unavailable")
    const [blockNote, setBlockNote] = useState("")
    const [showBlockModal, setShowBlockModal] = useState(false)

    const queryClient = useQueryClient()

    // Fetch blocked dates for current month
    const { data: blockedDates = {}, isLoading: isLoadingBlocked } = useQuery({
        queryKey: [
            "blockedDates",
            propertyId,
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
        ],
        queryFn: () =>
            propertyService.getBlockedDates(
                propertyId,
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1
            ),
        enabled: !!propertyId,
    })

    // Block dates mutation
    const blockDatesMutation = useMutation({
        mutationFn: ({ dates, reason, note }) => {
            return propertyService.blockDates(propertyId, dates, reason, note)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["blockedDates", propertyId])
            queryClient.invalidateQueries(["availability", propertyId])
            setSelectedDates([])
            setShowBlockModal(false)
            setBlockNote("")
        },
        onError: (error) => {
            console.error("Block mutation error:", error)
        },
    })

    // Unblock dates mutation
    const unblockDatesMutation = useMutation({
        mutationFn: (dates) => {
            return propertyService.unblockDates(propertyId, dates)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["blockedDates", propertyId])
            queryClient.invalidateQueries(["availability", propertyId])
            setSelectedDates([])
        },
        onError: (error) => {
            console.error("Unblock mutation error:", error)
        },
    })

    // Generate calendar days for the current month
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        const firstDayOfMonth = new Date(year, month, 1)
        const dayOfWeek = firstDayOfMonth.getDay()
        const lastDayOfMonth = new Date(year, month + 1, 0)
        const daysInMonth = lastDayOfMonth.getDate()

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < dayOfWeek; i++) {
            days.push({ day: null, date: null })
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const dateString = date.toISOString().split("T")[0]
            const isBlocked = blockedDates[dateString]
            const isSelected = selectedDates.includes(dateString)
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

            days.push({
                day,
                date,
                dateString,
                isBlocked: !!isBlocked,
                isSelected,
                isPast,
                blockInfo: isBlocked,
            })
        }

        return days
    }

    // Handle date click
    const handleDateClick = (dayInfo) => {
        if (dayInfo.isPast) return

        const { dateString, isBlocked } = dayInfo

        if (blockingMode) {
            // Blocking mode - add to selection if not already blocked
            if (!isBlocked) {
                setSelectedDates((prev) =>
                    prev.includes(dateString)
                        ? prev.filter((d) => d !== dateString)
                        : [...prev, dateString]
                )
            }
        } else {
            // Unblocking mode - add to selection if blocked
            if (isBlocked) {
                setSelectedDates((prev) =>
                    prev.includes(dateString)
                        ? prev.filter((d) => d !== dateString)
                        : [...prev, dateString]
                )
            }
        }
    }

    // Handle block/unblock action
    const handleAction = () => {
        if (selectedDates.length === 0) {
            return
        }

        if (blockingMode) {
            setShowBlockModal(true)
        } else {
            // Unblock dates immediately
            unblockDatesMutation.mutate(selectedDates)
        }
    }

    // Handle block confirmation
    const handleBlockConfirm = () => {
        blockDatesMutation.mutate({
            dates: selectedDates,
            reason: blockReason,
            note: blockNote,
        })
    }

    // Navigate to previous month
    const goToPreviousMonth = () => {
        setCurrentMonth((prev) => {
            const newMonth = new Date(prev)
            newMonth.setMonth(newMonth.getMonth() - 1)
            return newMonth
        })
        setSelectedDates([])
    }

    // Navigate to next month
    const goToNextMonth = () => {
        setCurrentMonth((prev) => {
            const newMonth = new Date(prev)
            newMonth.setMonth(newMonth.getMonth() + 1)
            return newMonth
        })
        setSelectedDates([])
    }

    // Format month name
    const formatMonthName = (date) => {
        return date.toLocaleString("default", {
            month: "long",
            year: "numeric",
        })
    }

    // Clear selection
    const clearSelection = () => {
        setSelectedDates([])
    }

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const calendarDays = generateCalendarDays()

    return (
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Manage Property Availability
                </h3>
                <p className="text-sm text-secondary-600">
                    Block or unblock specific dates to manage when your property
                    is available for booking.
                </p>
            </div>

            {/* Mode Toggle */}
            <div className="mb-4">
                <div className="flex space-x-4">
                    <button
                        onClick={() => {
                            setBlockingMode(true)
                            setSelectedDates([])
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            blockingMode
                                ? "bg-red-500 text-white"
                                : "bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                        }`}
                    >
                        Block Dates
                    </button>
                    <button
                        onClick={() => {
                            setBlockingMode(false)
                            setSelectedDates([])
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            !blockingMode
                                ? "bg-green-500 text-white"
                                : "bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                        }`}
                    >
                        Unblock Dates
                    </button>
                </div>
            </div>

            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
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

                <h4 className="text-lg font-medium text-secondary-900">
                    {formatMonthName(currentMonth)}
                </h4>

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

            {/* Calendar */}
            {isLoadingBlocked ? (
                <div className="flex justify-center items-center py-8">
                    <FaSpinner className="animate-spin text-primary-500 mr-2" />
                    <span>Loading calendar...</span>
                </div>
            ) : (
                <div>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {/* Days of week headers */}
                        {daysOfWeek.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-medium text-secondary-500 py-2"
                            >
                                {day}
                            </div>
                        ))}

                        {/* Calendar days */}
                        {calendarDays.map((dayInfo, index) => (
                            <div
                                key={index}
                                className={`relative h-10 flex items-center justify-center text-sm cursor-pointer transition-colors ${
                                    !dayInfo.day
                                        ? ""
                                        : dayInfo.isPast
                                        ? "text-secondary-300 cursor-not-allowed"
                                        : dayInfo.isSelected
                                        ? blockingMode
                                            ? "bg-red-100 text-red-800 border-2 border-red-300"
                                            : "bg-green-100 text-green-800 border-2 border-green-300"
                                        : dayInfo.isBlocked
                                        ? "bg-red-50 text-red-600 border border-red-200"
                                        : "hover:bg-secondary-100 border border-transparent"
                                }`}
                                onClick={() =>
                                    dayInfo.day && handleDateClick(dayInfo)
                                }
                                title={
                                    dayInfo.isBlocked
                                        ? `Blocked: ${
                                              dayInfo.blockInfo?.reason ||
                                              "unavailable"
                                          }`
                                        : dayInfo.isPast
                                        ? "Past date"
                                        : ""
                                }
                            >
                                {dayInfo.day && (
                                    <>
                                        <span>{dayInfo.day}</span>
                                        {dayInfo.isBlocked && (
                                            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 text-xs text-secondary-600 mb-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded mr-2"></div>
                            <span>Blocked</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-secondary-100 border border-secondary-300 rounded mr-2"></div>
                            <span>Available</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-secondary-50 border border-secondary-200 rounded mr-2"></div>
                            <span>Past</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {selectedDates.length > 0 && (
                        <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                            <div className="flex items-center">
                                <FaInfo className="text-blue-500 mr-2" />
                                <span className="text-sm text-secondary-700">
                                    {selectedDates.length} date(s) selected
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={clearSelection}
                                    className="px-3 py-1 text-sm text-secondary-600 hover:text-secondary-800 transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleAction}
                                    disabled={
                                        blockDatesMutation.isPending ||
                                        unblockDatesMutation.isPending
                                    }
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        blockingMode
                                            ? "bg-red-500 hover:bg-red-600 text-white"
                                            : "bg-green-500 hover:bg-green-600 text-white"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {blockDatesMutation.isPending ||
                                    unblockDatesMutation.isPending ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : blockingMode ? (
                                        "Block Selected"
                                    ) : (
                                        "Unblock Selected"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Block Reason Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            Block Dates
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Reason for blocking
                            </label>
                            <select
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="w-full p-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                            >
                                <option value="unavailable">Unavailable</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="personal_use">
                                    Personal Use
                                </option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Note (optional)
                            </label>
                            <textarea
                                value={blockNote}
                                onChange={(e) => setBlockNote(e.target.value)}
                                placeholder="Add any additional notes..."
                                rows={3}
                                className="w-full p-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="px-4 py-2 text-secondary-600 hover:text-secondary-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBlockConfirm}
                                disabled={blockDatesMutation.isPending}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {blockDatesMutation.isPending ? (
                                    <FaSpinner className="animate-spin" />
                                ) : (
                                    "Block Dates"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

HostCalendarManager.propTypes = {
    propertyId: PropTypes.string.isRequired,
}

export default HostCalendarManager
