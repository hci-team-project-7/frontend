"use client"
import { useState } from "react"

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

export default function ItineraryMap({
  itinerary,
  selectedDay,
  title,
}: {
  itinerary: DayItinerary[]
  selectedDay: number | null
  title: string
}) {
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null)

  const displayLocations =
    selectedDay && itinerary[selectedDay - 1]
      ? itinerary[selectedDay - 1].locations
      : itinerary.flatMap((day) => day.locations)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-900">{title}</h2>

      <div className="rounded-xl overflow-hidden border-2 border-blue-200 bg-white">
        {/* Map Container Simulation */}
        <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-blue-50">
          {/* Map SVG representation */}
          <svg className="w-full h-full" viewBox="0 0 800 600">
            {/* Background map grid */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e0e7ff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="800" height="600" fill="url(#grid)" />

            {/* Route lines */}
            {displayLocations.length > 1 && (
              <polyline
                points={displayLocations
                  .map((loc) => `${((loc.lng + 74.2591) / 0.2591) * 400},${((41.1315 - loc.lat) / 0.5781) * 600}`)
                  .join(" ")}
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
              />
            )}

            {/* Location Markers */}
            {displayLocations.map((location, idx) => (
              <g key={idx} onMouseEnter={() => setHoveredMarker(idx)} onMouseLeave={() => setHoveredMarker(null)}>
                <circle
                  cx={((location.lng + 74.2591) / 0.2591) * 400}
                  cy={((41.1315 - location.lat) / 0.5781) * 600}
                  r={hoveredMarker === idx ? "12" : "8"}
                  fill={hoveredMarker === idx ? "#f97316" : "#3b82f6"}
                  opacity={hoveredMarker === idx ? 0.9 : 0.7}
                  className="transition-all cursor-pointer"
                />
                <text
                  x={((location.lng + 74.2591) / 0.2591) * 400}
                  y={((41.1315 - location.lat) / 0.5781) * 600}
                  textAnchor="middle"
                  dy="0.3em"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {idx + 1}
                </text>
              </g>
            ))}
          </svg>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">활동 유형</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">위치 표시</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-px bg-blue-500" style={{ borderStyle: "dashed" }}></div>
                <span className="text-gray-600">경로</span>
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button className="w-8 h-8 bg-white rounded border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50 shadow">
              +
            </button>
            <button className="w-8 h-8 bg-white rounded border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50 shadow">
              −
            </button>
          </div>
        </div>

        {/* Locations List */}
        <div className="grid grid-cols-2 gap-2 p-4 border-t border-blue-100 bg-gray-50 max-h-32 overflow-y-auto">
          {displayLocations.map((location, idx) => (
            <div
              key={idx}
              className="text-xs bg-white p-2 rounded border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
            >
              <p className="font-semibold text-blue-900">
                {idx + 1}. {location.name}
              </p>
              <p className="text-gray-600">⏰ {location.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
