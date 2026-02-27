import type { Service } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface ServiceCardProps {
  service: Service
  selected?: boolean
  onClick?: () => void
}

export default function ServiceCard({ service, selected, onClick }: ServiceCardProps) {
  return (
    <div
      onClick={onClick}
      className={`service-card ${selected ? 'border-gold bg-gold/5' : ''} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-4xl">{service.icon || '⭐'}</div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gold">
            {formatCurrency(service.price)}
          </div>
          <div className="text-sm text-ink-light">
            {service.duration} min
          </div>
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
      {service.description && (
        <p className="text-sm text-ink-light">{service.description}</p>
      )}
    </div>
  )
}
