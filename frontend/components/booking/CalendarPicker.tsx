import { useState } from 'react'
import { formatDateISO, getDateRange } from '@/lib/utils'

interface CalendarPickerProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  disabledDates?: string[]
}

export default function CalendarPicker({
  selectedDate,
  onDateSelect,
  disabledDates = []
}: CalendarPickerProps) {
  const [startDate, setStartDate] = useState(new Date())

  // Generate next 30 days
  const dates = getDateRange(startDate, 30)

  const handlePrevWeek = () => {
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() - 7)
    if (newStart >= new Date()) {
      setStartDate(newStart)
    }
  }

  const handleNextWeek = () => {
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() + 7)
    setStartDate(newStart)
  }

  const isDisabled = (date: Date) => {
    const dateStr = formatDateISO(date)
    return disabledDates.includes(dateStr) || date < new Date(new Date().setHours(0, 0, 0, 0))
  }

  const isSelected = (date: Date) => {
    return selectedDate && formatDateISO(date) === formatDateISO(selectedDate)
  }

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevWeek}
          className="p-2 hover:bg-cream rounded-xl transition-colors"
          disabled={startDate <= new Date()}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold">
          {startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-cream rounded-xl transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-2">
        {dates.slice(0, 7).map((date, index) => {
          const disabled = isDisabled(date)
          const selected = isSelected(date)

          return (
            <button
              key={index}
              onClick={() => !disabled && onDateSelect(date)}
              disabled={disabled}
              className={`p-3 rounded-xl text-center transition-all ${
                selected
                  ? 'bg-gold text-white'
                  : disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-2 border-cream-dark hover:border-gold'
              }`}
            >
              <div className="text-xs font-medium mb-1">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg font-bold">
                {date.getDate()}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
