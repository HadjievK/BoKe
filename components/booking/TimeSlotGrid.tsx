import type { TimeSlot } from '@/lib/types'
import { formatTime } from '@/lib/utils'

interface TimeSlotGridProps {
  slots: TimeSlot[]
  selectedTime: string | null
  onTimeSelect: (time: string) => void
}

export default function TimeSlotGrid({
  slots,
  selectedTime,
  onTimeSelect
}: TimeSlotGridProps) {
  const availableSlots = slots.filter(slot => slot.available)

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-medium">No available time slots for this date</p>
        <p className="text-sm mt-1">Please select a different date</p>
      </div>
    )
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-medium">All slots are booked for this date</p>
        <p className="text-sm mt-1">Please select a different date</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {availableSlots.length} {availableSlots.length === 1 ? 'slot' : 'slots'} available
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {slots.map((slot) => {
          const selected = selectedTime === slot.time
          const available = slot.available

          return (
            <button
              key={slot.time}
              onClick={() => available && onTimeSelect(slot.time)}
              disabled={!available}
              className={`time-slot ${
                selected
                  ? 'time-slot-selected'
                  : available
                  ? 'time-slot-available'
                  : 'time-slot-unavailable'
              }`}
            >
              {formatTime(slot.time)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
