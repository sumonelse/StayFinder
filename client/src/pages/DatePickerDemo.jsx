import React, { useState } from "react"
import { DatePicker } from "../components/ui"

const DatePickerDemo = () => {
    // State for single date picker
    const [singleDate, setSingleDate] = useState("")

    // State for date range
    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: "",
    })

    // State for month picker
    const [selectedMonth, setSelectedMonth] = useState("")

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0]

    // Get date 30 days from now
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    const thirtyDaysLater = futureDate.toISOString().split("T")[0]

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center text-primary-700">
                DatePicker Component Demo
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md border border-primary-100">
                    <h2 className="text-xl font-semibold mb-4 text-primary-600">
                        Basic DatePicker
                    </h2>
                    <DatePicker
                        id="basic-date"
                        label="Select a date"
                        value={singleDate}
                        onChange={(date) => setSingleDate(date)}
                        placeholder="Choose a date"
                        hint="Click to select any date"
                    />
                    {singleDate && (
                        <div className="mt-4 p-3 bg-primary-50 rounded-md">
                            <p className="text-sm text-primary-800">
                                Selected date:{" "}
                                <span className="font-medium">
                                    {singleDate}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-primary-100">
                    <h2 className="text-xl font-semibold mb-4 text-primary-600">
                        Date Range Picker
                    </h2>
                    <DatePicker
                        id="date-range"
                        label="Select date range"
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        selectsRange={true}
                        onRangeChange={setDateRange}
                        placeholder="Choose start and end dates"
                        hint="Click to select a range of dates"
                    />
                    {(dateRange.startDate || dateRange.endDate) && (
                        <div className="mt-4 p-3 bg-primary-50 rounded-md">
                            <p className="text-sm text-primary-800">
                                {dateRange.startDate && (
                                    <span>
                                        From:{" "}
                                        <span className="font-medium">
                                            {dateRange.startDate}
                                        </span>
                                    </span>
                                )}
                                {dateRange.startDate && dateRange.endDate && (
                                    <span> - </span>
                                )}
                                {dateRange.endDate && (
                                    <span>
                                        To:{" "}
                                        <span className="font-medium">
                                            {dateRange.endDate}
                                        </span>
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-primary-100">
                    <h2 className="text-xl font-semibold mb-4 text-primary-600">
                        With Min/Max Date Constraints
                    </h2>
                    <DatePicker
                        id="constrained-date"
                        label="Select a date (limited range)"
                        value={singleDate}
                        onChange={(date) => setSingleDate(date)}
                        placeholder="Choose a date"
                        minDate={today}
                        maxDate={thirtyDaysLater}
                        hint={`You can only select dates between today and ${new Date(
                            thirtyDaysLater
                        ).toLocaleDateString()}`}
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-primary-100">
                    <h2 className="text-xl font-semibold mb-4 text-primary-600">
                        Month Picker
                    </h2>
                    <DatePicker
                        id="month-picker"
                        label="Select a month"
                        value={selectedMonth}
                        onChange={(date) => setSelectedMonth(date)}
                        placeholder="Choose a month"
                        showMonthYearPicker={true}
                        dateFormat="MMMM yyyy"
                        hint="Click to select a month and year"
                    />
                    {selectedMonth && (
                        <div className="mt-4 p-3 bg-primary-50 rounded-md">
                            <p className="text-sm text-primary-800">
                                Selected month:{" "}
                                <span className="font-medium">
                                    {new Date(selectedMonth).toLocaleDateString(
                                        "en-US",
                                        { month: "long", year: "numeric" }
                                    )}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-primary-100">
                <h2 className="text-xl font-semibold mb-4 text-primary-600">
                    Inline Calendar
                </h2>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                        <DatePicker
                            id="inline-calendar"
                            label="Always visible calendar"
                            value={singleDate}
                            onChange={(date) => setSingleDate(date)}
                            inline={true}
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium mb-3 text-primary-600">
                            Features:
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-primary-700">
                            <li>Single date selection</li>
                            <li>Date range selection</li>
                            <li>Month/year picker</li>
                            <li>Min/max date constraints</li>
                            <li>Inline display option</li>
                            <li>Fully accessible</li>
                            <li>Keyboard navigation</li>
                            <li>Mobile responsive</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DatePickerDemo
