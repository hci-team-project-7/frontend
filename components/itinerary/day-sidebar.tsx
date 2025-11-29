"use client"

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

export default function DaySidebar({
  itinerary,
  selectedDay,
  onSelectDay,
}: {
  itinerary: DayItinerary[]
  selectedDay: number | null
  onSelectDay: (day: number) => void
}) {
  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      <h2 className="text-xl font-bold text-blue-900 mb-4">7일 일정 개요</h2>
      {itinerary.map((day) => (
        <div
          key={day.day}
          onClick={() => onSelectDay(day.day)}
          className={`rounded-xl overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
            selectedDay === day.day ? "ring-2 ring-blue-500 shadow-lg bg-blue-50" : "hover:shadow-md"
          }`}
        >
          <div
            className="h-24 bg-cover bg-center relative"
            style={{
              backgroundImage: `url('${day.photo}')`,
            }}
          >
            <div className="absolute inset-0 bg-black/30 flex items-center justify-start">
              <span className="ml-4 text-white font-bold text-lg">Day {day.day}</span>
            </div>
          </div>
          <div className="p-3 bg-white">
            <p className="text-xs text-gray-500 mb-1">{day.date}</p>
            <h3 className="font-semibold text-sm text-blue-900 mb-2">{day.title}</h3>
            <div className="space-y-1">
              {day.activities.slice(0, 3).map((activity, idx) => (
                <p key={idx} className="text-xs text-gray-600 flex items-start">
                  <span className="mr-2">•</span>
                  <span className="line-clamp-1">{activity}</span>
                </p>
              ))}
              {day.activities.length > 3 && (
                <p className="text-xs text-orange-500 font-semibold">+{day.activities.length - 3} more</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="text-lg">⏱</span>
              경일 일정
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
