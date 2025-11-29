"use client"

interface Activity {
  id: string
  name: string
  location: string
  time: string
  duration: string
  description: string
  image: string
  openHours: string
  price: string
  tips: string[]
  nearbyFood: string[]
  estimatedDuration: string
  bestTime: string
}

export default function ActivityTimeline({
  activities,
  expandedActivity,
  onSelectActivity,
}: {
  activities: Activity[]
  expandedActivity: string | null
  onSelectActivity: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-900 mb-6">일정 타임라인</h2>

      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="relative cursor-pointer" onClick={() => onSelectActivity(activity.id)}>
            {/* Timeline line */}
            {idx < activities.length - 1 && <div className="absolute left-6 top-12 h-8 w-0.5 bg-blue-300"></div>}

            {/* Card */}
            <div
              className={`rounded-lg border-2 p-4 transition-all transform hover:scale-102 ${
                expandedActivity === activity.id
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              {/* Time indicator */}
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div
                    className={`w-4 h-4 rounded-full border-4 ${
                      expandedActivity === activity.id ? "border-blue-500 bg-blue-500" : "border-blue-300 bg-white"
                    }`}
                  ></div>
                </div>

                <div className="flex-1">
                  {/* Image preview */}
                  <div className="rounded-lg overflow-hidden mb-3 h-24 bg-gray-200">
                    <img
                      src={activity.image || "/placeholder.svg"}
                      alt={activity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Activity info */}
                  <h3 className="font-bold text-blue-900 mb-1">{activity.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">📍 {activity.location}</p>
                  <div className="flex gap-3 text-xs">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">⏰ {activity.time}</span>
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">⏱ {activity.duration}</span>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">{activity.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
