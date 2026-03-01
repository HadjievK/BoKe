'use client'

import { useState, useRef, useEffect } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import { useMap } from './MapProvider'

interface LocationAutocompleteProps {
  value: string
  onChange: (address: string, lat?: number, lng?: number) => void
  placeholder?: string
  className?: string
  error?: string
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Enter your business location',
  className = '',
  error
}: LocationAutocompleteProps) {
  const { isLoaded, loadError } = useMap()
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance)
  }

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace()

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const address = place.formatted_address || ''

        onChange(address, lat, lng)
      } else if (place.name) {
        // Fallback if no geometry is available
        onChange(place.name)
      }
    }
  }

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  if (loadError) {
    return (
      <div className="text-red-600 text-sm">
        Error loading Google Maps. Please check your API key.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        disabled
      />
    )
  }

  return (
    <div className="relative">
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{
          types: ['establishment', 'geocode'],
          fields: ['formatted_address', 'geometry', 'name'],
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
        />
      </Autocomplete>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
