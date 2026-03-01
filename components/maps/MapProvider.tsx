'use client'

import { useLoadScript } from '@react-google-maps/api'
import { createContext, useContext, ReactNode } from 'react'

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places']

interface MapContextType {
  isLoaded: boolean
  loadError?: Error
}

const MapContext = createContext<MapContextType>({ isLoaded: false })

export const useMap = () => useContext(MapContext)

export default function MapProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  return (
    <MapContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapContext.Provider>
  )
}
