"use client"
import { RefObject, useEffect, useMemo, useState } from "react"
import ActivityTimeline from "@/components/itinerary/activity-timeline"
import ActivityDetail from "@/components/itinerary/activity-detail"
import { Activity, TransportLeg } from "@/lib/api-types"

export default function DailyDetailPage({
  day,
  activities,
  transports,
  availableDays,
  onSelectDay,
  highlightTransportFromId,
  highlightActivityId,
  onOpenChatForActivity,
  onOpenChatForTransport,
  timelineRef,
  detailRef,
}: {
  day: number
  activities: Activity[]
  transports: TransportLeg[]
  availableDays: number[]
  onSelectDay: (day: number) => void
  highlightTransportFromId?: string | null
  highlightActivityId?: string | null
  onOpenChatForActivity?: (activity: Activity, day: number) => void
  onOpenChatForTransport?: (leg: TransportLeg, from: Activity, to: Activity, day: number) => void
  timelineRef?: RefObject<HTMLDivElement>
  detailRef?: RefObject<HTMLDivElement>
}) {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)

  useEffect(() => {
    if (activities.length > 0) {
      setExpandedActivity(activities[0].id)
    } else {
      setExpandedActivity(null)
    }
  }, [activities, day])

  const selectedActivity = useMemo(() => {
    if (!expandedActivity) return activities[0] || null
    return activities.find((activity) => activity.id === expandedActivity) || activities[0] || null
  }, [activities, expandedActivity])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-blue-900">Day {day} 상세 일정</h1>
        <div className="flex flex-wrap gap-2">
          {availableDays.map((availableDay) => (
            <button
              key={availableDay}
              onClick={() => onSelectDay(availableDay)}
              className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                day === availableDay ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Day {availableDay}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div ref={timelineRef} className="col-span-12 lg:col-span-5">
          <ActivityTimeline
            day={day}
            activities={activities}
            transports={transports}
            expandedActivity={expandedActivity}
            onSelectActivity={setExpandedActivity}
            highlightTransportFromId={highlightTransportFromId}
            highlightActivityId={highlightActivityId}
            onOpenChatForActivity={onOpenChatForActivity}
            onOpenChatForTransport={onOpenChatForTransport}
          />
        </div>

        <div ref={detailRef} className="col-span-12 lg:col-span-7 md:sticky md:top-24 md:self-start">
          <div className="md:max-h-[calc(100vh-160px)] md:overflow-y-auto md:pr-1">
            {selectedActivity ? (
              <ActivityDetail activity={selectedActivity} />
            ) : (
              <div className="flex h-96 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-8 text-center text-gray-600">
                <p>해당 일자에 등록된 활동이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
