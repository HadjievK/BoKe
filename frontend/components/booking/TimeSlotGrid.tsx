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
  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-ink-light">
        <p>No available time slots for this date</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
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
  )
}
