"use client"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Activity, TransportLeg } from "@/lib/api-types"

export default function ActivityTimeline({
  day,
  activities,
  transports,
  expandedActivity,
  onSelectActivity,
  highlightTransportFromId,
  onOpenChatForActivity,
  onOpenChatForTransport,
}: {
  day: number
  activities: Activity[]
  transports: TransportLeg[]
  expandedActivity: string | null
  onSelectActivity: (id: string) => void
  highlightTransportFromId?: string | null
  onOpenChatForActivity?: (activity: Activity, day: number) => void
  onOpenChatForTransport?: (leg: TransportLeg, from: Activity, to: Activity, day: number) => void
}) {
  const transportMap = useMemo(() => {
    const map = new Map<string, TransportLeg>()
    transports.forEach((leg) => map.set(leg.fromActivityId, leg))
    return map
  }, [transports])

  const activityMap = useMemo(() => {
    const map = new Map<string, Activity>()
    activities.forEach((act) => map.set(act.id, act))
    return map
  }, [activities])

  const modeLabel = (mode: TransportLeg["mode"]) => {
    switch (mode) {
      case "walk":
        return "도보"
      case "transit":
        return "대중교통"
      case "bike":
        return "자전거"
      default:
        return "자동차"
    }
  }

  const modeIcon = (mode: TransportLeg["mode"]) => {
    switch (mode) {
      case "walk":
        return "🚶"
      case "transit":
        return "🚇"
      case "bike":
        return "🚲"
      default:
        return "🚗"
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-900 mb-6">일정 타임라인</h2>

      <div className="space-y-4">
        {activities.map((activity, idx) => {
          const leg = transportMap.get(activity.id)
          const isLast = idx === activities.length - 1
          const toActivity = leg ? activityMap.get(leg.toActivityId) : null
          const isHighlighted = leg && highlightTransportFromId === leg.fromActivityId
          return (
            <div key={activity.id} className="relative">
              {/* Card */}
              <div
                className={`rounded-lg border-2 p-4 transition-all transform hover:scale-102 cursor-pointer ${
                  expandedActivity === activity.id
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
                onClick={() => onSelectActivity(activity.id)}
                onDoubleClick={() => onOpenChatForActivity?.(activity, day)}
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
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{activity.time}</span>
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">{activity.duration}</span>
                    </div>
                    <h3 className="font-bold text-blue-900 mb-1">{activity.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">📍 {activity.location}</p>

                    <p className="text-xs text-gray-500 mt-2">{activity.description}</p>
                  </div>
                </div>
              </div>

              {/* Transport leg */}
              {leg && !isLast && (
                <div className="ml-8 border-l-2 border-dashed border-blue-200 pl-6 py-3">
                  <div
                    className={cn(
                      "rounded-lg border px-4 py-3 flex items-center justify-between text-sm shadow-sm transition-colors cursor-pointer",
                      isHighlighted
                        ? "border-amber-300 bg-amber-50 text-amber-900"
                        : "border-blue-200 bg-blue-50 text-blue-900",
                    )}
                    onDoubleClick={() => toActivity && onOpenChatForTransport?.(leg, activity, toActivity, day)}
                  >
                    <div className="flex items-center gap-3 font-semibold">
                      <span>{modeIcon(leg.mode)}</span>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-gray-500">이동</span>
                        <span className="text-sm">
                          {activity.name} → {toActivity?.name || "다음 장소"}
                        </span>
                        <span className="text-xs text-gray-500">{modeLabel(leg.mode)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span>⏱ {leg.durationMinutes}분</span>
                      <span>📏 {(leg.distanceMeters / 1000).toFixed(1)}km</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Connector to next block */}
              {!isLast && <div className="absolute left-6 top-full h-4 w-0.5 bg-blue-200"></div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
