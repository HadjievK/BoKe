import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import './calendar-styles.css'
import { formatDateISO } from '@/lib/utils'

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
  // Convert ISO string dates to Date objects for react-day-picker
  const disabledDateObjects = disabledDates.map(dateStr => new Date(dateStr))

  // Calculate date range: today to 2 months ahead
  const today = new Date()
  const twoMonthsAhead = new Date()
  twoMonthsAhead.setMonth(twoMonthsAhead.getMonth() + 2)

  // Combine disabled conditions: past dates + unavailable dates from API
  const disabledDays = [
    { before: today }, // Disable all dates before today
    ...disabledDateObjects // Disable dates that have no availability
  ]

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date)
    }
  }

  return (
    <div className="calendar-wrapper w-full flex justify-center">
      <DayPicker
        mode="single"
        selected={selectedDate || undefined}
        onSelect={handleSelect}
        disabled={disabledDays}
        fromDate={today}
        toDate={twoMonthsAhead}
        showOutsideDays
        fixedWeeks
      />
    </div>
  )
}
