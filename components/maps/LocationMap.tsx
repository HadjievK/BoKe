'use client'

import { GoogleMap, Marker } from '@react-google-maps/api'
import { useMap } from './MapProvider'
import { useMemo } from 'react'

interface LocationMapProps {
  latitude: number
  longitude: number
  address?: string
  className?: string
  height?: string
  showDirectionsButton?: boolean
}

const mapContainerStyle = {
  width: '100%',
}

const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
}

export default function LocationMap({
  latitude,
  longitude,
  address,
  className = '',
  height = '400px',
  showDirectionsButton = true,
}: LocationMapProps) {
  const { isLoaded, loadError } = useMap()

  const center = useMemo(
    () => ({
      lat: latitude,
      lng: longitude,
    }),
    [latitude, longitude]
  )

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    window.open(url, '_blank')
  }

  if (loadError) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center text-gray-600">
        <p className="mb-2">📍</p>
        <p>Unable to load map</p>
        {address && <p className="text-sm mt-2">{address}</p>}
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className="bg-gray-100 rounded-xl animate-pulse"
        style={{ height }}
      />
    )
  }

  return (
    <div className={`relative ${className}`}>
      <GoogleMap
        mapContainerStyle={{ ...mapContainerStyle, height }}
        center={center}
        zoom={15}
        options={defaultMapOptions}
      >
        <Marker position={center} />
      </GoogleMap>

      {showDirectionsButton && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleGetDirections}
            className="bg-white shadow-lg rounded-xl px-4 py-2.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition border border-gray-200 flex items-center gap-2"
          >
            <span>🧭</span>
            Get Directions
          </button>
        </div>
      )}
    </div>
  )
}
