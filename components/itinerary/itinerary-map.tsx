"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { loadGoogleMaps } from "@/lib/google-maps-loader"
import { formatScheduleTime } from "@/lib/time-format"

interface Location {
  name: string
  time: string
  lat: number
  lng: number
}

interface DayItinerary {
  day: number
  date: string
  title: string
  photo: string
  activities: string[]
  locations: Location[]
}

interface PlaceDetails {
  name: string
  address?: string
  rating?: number
  photoUrl?: string
  location?: { lat: number; lng: number }
}

export default function ItineraryMap({
  itinerary,
  selectedDay,
  title,
}: {
  itinerary: DayItinerary[]
  selectedDay: number | null
  title: string
}) {
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const googleRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylineRef = useRef<any>(null)
  const infoWindowRef = useRef<any>(null)
  const placesServiceRef = useRef<any>(null)
  const placeCacheRef = useRef<Map<string, PlaceDetails>>(new Map())
  const boundsRef = useRef<any>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const displayLocations = useMemo(() => {
    if (selectedDay && itinerary[selectedDay - 1]) {
      return itinerary[selectedDay - 1].locations
    }
    return itinerary.flatMap((day) => day.locations)
  }, [itinerary, selectedDay])

  useEffect(() => {
    if (!mapContainerRef.current) return
    if (!apiKey) {
      setMapError("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 환경 변수가 필요합니다.")
      return
    }

    let cancelled = false
    setMapError(null)

    loadGoogleMaps(apiKey)
      .then((google) => {
        if (cancelled) return
        googleRef.current = google

        const fallbackCenter = displayLocations[0]
          ? { lat: displayLocations[0].lat, lng: displayLocations[0].lng }
          : { lat: 37.5665, lng: 126.978 } // Seoul as a neutral default

        const map = new google.maps.Map(mapContainerRef.current!, {
          center: fallbackCenter,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        mapRef.current = map
        infoWindowRef.current = new google.maps.InfoWindow()
        placesServiceRef.current = new google.maps.places.PlacesService(map)
        setIsMapReady(true)
      })
      .catch((err) => {
        if (!cancelled) {
          setMapError(err.message || "지도를 불러오지 못했습니다.")
        }
      })

    return () => {
      cancelled = true
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
        polylineRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !googleRef.current) return

    const normalizeLocation = (location: Location): Location => {
      const toNumber = (value: any) => {
        const parsed = typeof value === "string" ? parseFloat(value) : value
        return Number.isFinite(parsed) ? parsed : null
      }

      const rawLat = toNumber((location as any).lat ?? (location as any).latitude)
      const rawLng = toNumber((location as any).lng ?? (location as any).longitude ?? (location as any).lon)

      let lat = rawLat
      let lng = rawLng

      if (lat === null && lng === null && Array.isArray((location as any).coordinates)) {
        const [lngFromArray, latFromArray] = (location as any).coordinates
        lat = toNumber(latFromArray)
        lng = toNumber(lngFromArray)
      }

      if (lat !== null && lng !== null) {
        if ((Math.abs(lat) > 90 && Math.abs(lng) <= 90) || Math.abs(lng) > 180) {
          ;[lat, lng] = [lng, lat]
        }
      }

      return {
        ...location,
        lat: lat ?? 0,
        lng: lng ?? 0,
      }
    }

    const normalizedLocations = displayLocations.map((loc) => normalizeLocation(loc))
    const resolvedLocations = normalizedLocations.map((loc) => ({ ...loc }))

    const updateMarkerPosition = (
      marker: any,
      idx: number,
      newPosition: { lat: number; lng: number },
      positions: Location[],
    ) => {
      const current = marker.getPosition()
      const currentLat = current?.lat ? current.lat() : undefined
      const currentLng = current?.lng ? current.lng() : undefined
      const moved =
        !current ||
        typeof currentLat !== "number" ||
        typeof currentLng !== "number" ||
        Math.abs(currentLat - newPosition.lat) > 0.0001 ||
        Math.abs(currentLng - newPosition.lng) > 0.0001

      if (!moved) return

      marker.setPosition(newPosition)
      positions[idx] = { ...positions[idx], lat: newPosition.lat, lng: newPosition.lng }

      if (polylineRef.current) {
        polylineRef.current.setPath(positions.map((loc) => ({ lat: loc.lat, lng: loc.lng })))
      }

      if (boundsRef.current) {
        boundsRef.current.extend(newPosition)
        mapRef.current?.fitBounds(boundsRef.current, 64)
      }
    }

    const google = googleRef.current
    const map = mapRef.current

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    if (polylineRef.current) {
      polylineRef.current.setMap(null)
      polylineRef.current = null
    }

    const bounds = new google.maps.LatLngBounds()
    boundsRef.current = bounds

    resolvedLocations.forEach((location, idx) => {
      const position = { lat: location.lat, lng: location.lng }
      const cacheKey = `${location.name}-${location.time || idx}`
      const timeLabel = formatScheduleTime(location.time)

      const marker = new google.maps.Marker({
        position,
        map,
        label: `${idx + 1}`,
        title: `${location.name} (${timeLabel})`,
        animation: google.maps.Animation.DROP,
      })

      marker.addListener("click", () => {
        const cachedDetails = placeCacheRef.current.get(cacheKey)
        openInfoWindow(location, marker, cachedDetails)
      })

      markersRef.current.push(marker)
      bounds.extend(position)
      fetchPlaceDetails(location, cacheKey, marker, idx, resolvedLocations, updateMarkerPosition)
    })

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 64)
      if (displayLocations.length === 1) {
        map.setZoom(14)
        map.setCenter(bounds.getCenter())
      }
    }

    if (displayLocations.length > 1) {
      polylineRef.current = new google.maps.Polyline({
        path: resolvedLocations.map((loc) => ({ lat: loc.lat, lng: loc.lng })),
        geodesic: true,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.7,
        strokeWeight: 3,
      })
      polylineRef.current.setMap(map)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayLocations, isMapReady])

  const openInfoWindow = (location: Location, marker: any, placeDetails?: PlaceDetails) => {
    if (!infoWindowRef.current || !mapRef.current) return

    const title = placeDetails?.name || location.name
    const address = placeDetails?.address
    const rating = placeDetails?.rating
    const photoUrl = placeDetails?.photoUrl
    const timeLabel = formatScheduleTime(location.time)

    const content = `
      <div style="max-width:260px;font-family:Inter,system-ui,-apple-system,sans-serif;">
        ${photoUrl ? `<div style="width:100%;height:140px;border-radius:12px;overflow:hidden;margin-bottom:10px;">
          <img src="${photoUrl}" alt="${title}" style="width:100%;height:100%;object-fit:cover;" />
        </div>` : ""}
        <div style="font-weight:700;color:#0f172a;font-size:15px;line-height:1.3;">${title}</div>
        <div style="margin-top:6px;color:#4b5563;font-size:12px;">⏰ ${timeLabel}</div>
        ${address ? `<div style="margin-top:6px;color:#4b5563;font-size:12px;">📍 ${address}</div>` : ""}
        ${
          typeof rating === "number"
            ? `<div style="margin-top:6px;color:#f59e0b;font-size:12px;">⭐ ${rating.toFixed(1)} / 5</div>`
            : ""
        }
      </div>
    `

    infoWindowRef.current.setContent(content)
    infoWindowRef.current.open({
      anchor: marker,
      map: mapRef.current,
      shouldFocus: false,
    })
  }

  const fetchPlaceDetails = (
    location: Location,
    cacheKey: string,
    marker: any,
    idx: number,
    resolvedLocations: Location[],
    updateMarkerPosition: (marker: any, idx: number, position: { lat: number; lng: number }, locations: Location[]) => void,
  ) => {
    const placesService = placesServiceRef.current
    const google = googleRef.current
    if (!placesService || !google) return

    const cachedDetails = placeCacheRef.current.get(cacheKey)
    if (cachedDetails?.location) {
      updateMarkerPosition(marker, idx, cachedDetails.location, resolvedLocations)
      return
    }
    if (cachedDetails) return

    placesService.findPlaceFromQuery(
      {
        query: location.name,
        fields: ["name", "formatted_address", "rating", "photos", "place_id", "geometry"],
        locationBias: { lat: location.lat, lng: location.lng },
      },
      (results: any, status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          const place = results[0]
          const placeLocation = place.geometry?.location
          const lat = typeof placeLocation?.lat === "function" ? placeLocation.lat() : placeLocation?.lat
          const lng = typeof placeLocation?.lng === "function" ? placeLocation.lng() : placeLocation?.lng
          const geoPosition =
            typeof lat === "number" && typeof lng === "number" ? { lat, lng } : undefined

          const details: PlaceDetails = {
            name: place.name || location.name,
            address: place.formatted_address,
            rating: place.rating,
            photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 320, maxHeight: 180 }),
          }
          if (geoPosition) {
            details.location = geoPosition
          }

          placeCacheRef.current.set(cacheKey, details)

          if (geoPosition) {
            updateMarkerPosition(marker, idx, geoPosition, resolvedLocations)
          }
        } else {
          placeCacheRef.current.set(cacheKey, { name: location.name })
        }
      }
    )
  }

  const dayLabel = selectedDay ? `Day ${selectedDay} 경로` : "전체 일정 경로"

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-900">{title}</h2>
        <span className="text-xs rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">{dayLabel}</span>
      </div>

      <div className="rounded-xl overflow-hidden border-2 border-blue-200 bg-white">
        <div className="relative w-full h-96">
          {mapError ? (
            <div className="flex h-full items-center justify-center bg-blue-50 text-sm text-blue-800">{mapError}</div>
          ) : (
            <div ref={mapContainerRef} className="h-full w-full" />
          )}

          {!mapError && !isMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm text-blue-800">
              지도를 불러오는 중입니다...
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 p-4 border-t border-blue-100 bg-gray-50 max-h-32 overflow-y-auto">
          {displayLocations.map((location, idx) => (
            <div
              key={`${location.name}-${idx}`}
              className="text-xs bg-white p-2 rounded border border-gray-200 hover:border-blue-400 transition-colors"
            >
              <p className="font-semibold text-blue-900">
                {idx + 1}. {location.name}
              </p>
              <p className="text-gray-600">⏰ {formatScheduleTime(location.time)}</p>
            </div>
          ))}
          {displayLocations.length === 0 && (
            <div className="col-span-2 text-center text-sm text-gray-600">표시할 위치가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  )
}
